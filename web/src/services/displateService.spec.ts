import { describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  NetworkError,
  RateLimitedError,
  createDisplateService,
  imageUrl,
  isAbortError,
} from './displateService'

const response = {
  searchResult: {
    count: 1050,
    artworks: [
      {
        externalId: 1,
        title: 'Red Dragon',
        imageCoreUrl: '2026-07-28/aaa',
        orientation: 'vertical',
      },
      { externalId: 2, title: 'Ronnom', imageCoreUrl: '2026-02-10/bbb', orientation: 'horizontal' },
    ],
  },
  seo: { relatedSearches: [{ phrase: 'dragon' }, { phrase: 'fantasy' }] },
  suggestedPhrases: { phrases: [{ phrase: 'fantasy' }, { phrase: 'wyvern' }] },
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), init)
}

function setup(fetchImpl = vi.fn<typeof fetch>(async () => json(response))) {
  let time = 10_000
  const sleeps: number[] = []
  const service = createDisplateService({
    fetchImpl,
    now: () => time,
    sleep: async (ms) => {
      sleeps.push(ms)
      time += ms
    },
  })
  return { service, fetchImpl, sleeps, advance: (ms: number) => (time += ms) }
}

describe('displateService', () => {
  it('maps the response to typed posters', async () => {
    const { service } = setup()
    const result = await service.search('dragon')
    expect(result.total).toBe(1050)
    expect(result.posters).toEqual([
      {
        id: 1,
        title: 'Red Dragon',
        image: 'https://static.displate.com/857x1200/displate/2026-07-28/aaa.jpg',
        orientation: 'vertical',
        url: 'https://displate.com/displate/1',
      },
      {
        id: 2,
        title: 'Ronnom',
        image: 'https://static.displate.com/1200x857/displate/2026-02-10/bbb.jpg',
        orientation: 'horizontal',
        url: 'https://displate.com/displate/2',
      },
    ])
    expect(result.related).toEqual(['fantasy', 'wyvern'])
  })

  it('sizes the image by orientation', () => {
    expect(imageUrl('x/y', 'vertical')).toContain('857x1200')
    expect(imageUrl('x/y', 'horizontal')).toContain('1200x857')
  })

  it('asks the proxy for the phrase and the page', async () => {
    const { service, fetchImpl } = setup()
    await service.search('  dragon ', 2)
    const url = String(fetchImpl.mock.calls[0]?.[0])
    expect(url).toBe('/displate-api/search?phrase=dragon&size=24&page=2')
  })

  it('caches by phrase and page', async () => {
    const { service, fetchImpl } = setup()
    await service.search('dragon')
    await service.search('Dragon')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    await service.search('dragon', 2)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('keeps at least one second between two requests', async () => {
    const { service, sleeps, advance } = setup()
    await service.search('dragon')
    advance(300)
    await service.search('dragon', 2)
    expect(sleeps).toEqual([700])
  })

  it('does not wait when enough time has passed', async () => {
    const { service, sleeps, advance } = setup()
    await service.search('dragon')
    advance(5000)
    await service.search('dragon', 2)
    expect(sleeps).toEqual([])
  })

  it('aborts the previous request when a new search starts', async () => {
    let firstSignal: AbortSignal | undefined
    const fetchImpl = vi.fn<typeof fetch>((_input, init) => {
      firstSignal ??= init?.signal ?? undefined
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))
      })
    })
    const { service } = setup(fetchImpl)
    const first = service.search('dragon')
    const firstOutcome = first.catch((error: unknown) => error)
    fetchImpl.mockImplementation(async () => json(response))
    await Promise.resolve()
    await service.search('wolf')
    expect(firstSignal?.aborted).toBe(true)
    expect(isAbortError(await firstOutcome)).toBe(true)
  })

  it('throws a rate limited error with the retry time', async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      async () => new Response('{}', { status: 429, headers: { 'Retry-After': '17' } }),
    )
    const { service } = setup(fetchImpl)
    await expect(service.search('dragon')).rejects.toMatchObject({
      name: 'RateLimitedError',
      retryAfterSeconds: 17,
    })
    await expect(service.search('dragon')).rejects.toBeInstanceOf(RateLimitedError)
  })

  it('throws typed errors for network and api failures', async () => {
    const down = setup(
      vi.fn<typeof fetch>(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    await expect(down.service.search('dragon')).rejects.toBeInstanceOf(NetworkError)

    const broken = setup(vi.fn<typeof fetch>(async () => new Response('{}', { status: 502 })))
    await expect(broken.service.search('dragon')).rejects.toMatchObject({ status: 502 })
    await expect(broken.service.search('dragon')).rejects.toBeInstanceOf(ApiError)
  })

  it('does not cache failures', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 502 }))
      .mockResolvedValueOnce(json(response))
    const { service } = setup(fetchImpl)
    await expect(service.search('dragon')).rejects.toBeInstanceOf(ApiError)
    expect((await service.search('dragon')).posters).toHaveLength(2)
  })
})
