import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { usePosterSearch } from './usePosterSearch'
import { ApiError, NetworkError, RateLimitedError } from '@/services/displateService'
import type { Poster, SearchPage } from '@/types/poster'

function poster(id: number): Poster {
  return {
    id,
    title: `Poster ${id}`,
    image: `https://static.displate.com/img/${id}.jpg`,
    orientation: 'vertical',
    url: `https://displate.com/displate/${id}`,
  }
}

function page(phrase: string, pageNumber: number, ids: number[], total = 3): SearchPage {
  return { phrase, page: pageNumber, posters: ids.map(poster), total, related: ['fantasy'] }
}

function setup() {
  const search = vi.fn<(phrase: string, page?: number) => Promise<SearchPage>>(
    async (phrase, n = 1) => (n === 1 ? page(phrase, 1, [1, 2]) : page(phrase, 2, [3])),
  )
  return { search, state: usePosterSearch({ search }) }
}

describe('usePosterSearch', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('searches after the typing pause, not on every key', async () => {
    const { search, state } = setup()
    state.phrase.value = 'dra'
    await nextTick()
    state.phrase.value = 'dragon'
    await nextTick()
    await vi.advanceTimersByTimeAsync(399)
    expect(search).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(search).toHaveBeenCalledTimes(1)
    expect(search).toHaveBeenCalledWith('dragon', 1)
    expect(state.posters.value).toHaveLength(2)
    expect(state.status.value).toBe('success')
  })

  it('searches right away on submit and for a related chip', async () => {
    const { search, state } = setup()
    await state.search('wolf')
    expect(search).toHaveBeenCalledWith('wolf', 1)
    expect(state.related.value).toEqual(['fantasy'])
    await state.search('fantasy')
    expect(state.phrase.value).toBe('fantasy')
    expect(search).toHaveBeenLastCalledWith('fantasy', 1)
  })

  it('appends the next page on load more until everything is shown', async () => {
    const { search, state } = setup()
    await state.search('dragon')
    expect(state.hasMore.value).toBe(true)
    await state.loadMore()
    expect(search).toHaveBeenLastCalledWith('dragon', 2)
    expect(state.posters.value.map((p) => p.id)).toEqual([1, 2, 3])
    expect(state.hasMore.value).toBe(false)
  })

  it('shows the empty state when nothing matches', async () => {
    const search = vi.fn<(phrase: string, page?: number) => Promise<SearchPage>>(
      async (phrase) => ({
        phrase,
        page: 1,
        posters: [],
        total: 0,
        related: [],
      }),
    )
    const state = usePosterSearch({ search })
    await state.search('zzzz')
    expect(state.isEmpty.value).toBe(true)
  })

  it('resets when the phrase is cleared', async () => {
    const { search, state } = setup()
    await state.search('dragon')
    await state.search('   ')
    expect(state.status.value).toBe('idle')
    expect(state.posters.value).toEqual([])
    expect(search).toHaveBeenCalledTimes(1)
  })

  it.each([
    [new RateLimitedError(17), { kind: 'rate-limited', retryAfterSeconds: 17 }],
    [new NetworkError(), { kind: 'network' }],
    [new ApiError(502), { kind: 'api' }],
  ])('maps %s to a failure', async (error, expected) => {
    const search = vi.fn<(phrase: string, page?: number) => Promise<SearchPage>>(async () => {
      throw error
    })
    const state = usePosterSearch({ search })
    await state.search('dragon')
    expect(state.status.value).toBe('error')
    expect(state.failure.value).toEqual(expected)
  })

  it('ignores an aborted search and keeps loading for the newer one', async () => {
    const search = vi
      .fn<(phrase: string, page?: number) => Promise<SearchPage>>()
      .mockRejectedValueOnce(new DOMException('aborted', 'AbortError'))
      .mockResolvedValueOnce(page('wolf', 1, [1]))
    const state = usePosterSearch({ search })
    await state.search('dragon')
    expect(state.status.value).not.toBe('error')
    await state.search('wolf')
    expect(state.status.value).toBe('success')
  })

  it('retries the failed request', async () => {
    const search = vi
      .fn<(phrase: string, page?: number) => Promise<SearchPage>>()
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValueOnce(page('dragon', 1, [1, 2]))
    const state = usePosterSearch({ search })
    await state.search('dragon')
    await state.retry()
    expect(state.status.value).toBe('success')
    expect(state.failure.value).toBeNull()
  })
})
