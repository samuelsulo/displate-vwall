// @vitest-environment node
import type { IncomingMessage, ServerResponse } from 'node:http'
import { describe, expect, it, vi } from 'vitest'
import { createProxyHandler } from './displate-proxy'
import { TokenBucket } from './rate-limiter'

function fakeRequest(url: string, method = 'GET', remoteAddress = '127.0.0.1') {
  return { url, method, socket: { remoteAddress } } as unknown as IncomingMessage
}

function fakeResponse() {
  const headers: Record<string, string> = {}
  const res = {
    statusCode: 200,
    body: '',
    headers,
    setHeader(name: string, value: string) {
      headers[name] = value
    },
    end(chunk?: string) {
      res.body = chunk ?? ''
    },
  }
  return res
}

function okFetch() {
  return vi.fn<typeof fetch>(
    async () => new Response(JSON.stringify({ searchResult: { artworks: [] } })),
  )
}

async function call(handler: ReturnType<typeof createProxyHandler>, req: IncomingMessage) {
  const res = fakeResponse()
  const handled = await handler(req, res as unknown as ServerResponse)
  return { handled, res }
}

describe('displate proxy', () => {
  it('ignores paths outside its prefix', async () => {
    const handler = createProxyHandler({ fetchImpl: okFetch() })
    expect((await call(handler, fakeRequest('/index.html'))).handled).toBe(false)
  })

  it('answers 404 for any other path under the prefix', async () => {
    const fetchImpl = okFetch()
    const handler = createProxyHandler({ fetchImpl })
    const { res } = await call(handler, fakeRequest('/displate-api/anything-else'))
    expect(res.statusCode).toBe(404)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('forwards only the validated search parameters to the Displate search', async () => {
    const fetchImpl = okFetch()
    const handler = createProxyHandler({ fetchImpl })
    const { res } = await call(
      handler,
      fakeRequest('/displate-api/search?phrase=dragon&size=999&x=1'),
    )
    expect(res.statusCode).toBe(200)
    const target = new URL(String((fetchImpl.mock.calls[0] as unknown[])[0]))
    expect(target.origin + target.pathname).toBe('https://displate.com/elysium-api/user/v9/search')
    expect(target.searchParams.get('phrase')).toBe('dragon')
    expect(target.searchParams.get('size')).toBe('60')
    expect(target.searchParams.get('x')).toBeNull()
  })

  it('rejects an invalid query without calling Displate', async () => {
    const fetchImpl = okFetch()
    const handler = createProxyHandler({ fetchImpl })
    const { res } = await call(handler, fakeRequest('/displate-api/search?size=10'))
    expect(res.statusCode).toBe(400)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('answers 429 with Retry-After beyond the limit', async () => {
    const fetchImpl = okFetch()
    const bucket = new TokenBucket(1, 60_000, () => 0)
    const handler = createProxyHandler({ fetchImpl, bucket })
    await call(handler, fakeRequest('/displate-api/search?phrase=a'))
    const { res } = await call(handler, fakeRequest('/displate-api/search?phrase=a'))
    expect(res.statusCode).toBe(429)
    expect(res.headers['Retry-After']).toBe('60')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('refuses non-GET methods and non-loopback clients', async () => {
    const handler = createProxyHandler({ fetchImpl: okFetch() })
    expect(
      (await call(handler, fakeRequest('/displate-api/search?phrase=a', 'POST'))).res.statusCode,
    ).toBe(405)
    const remote = fakeRequest('/displate-api/search?phrase=a', 'GET', '192.168.1.20')
    expect((await call(handler, remote)).res.statusCode).toBe(403)
  })

  it('answers 502 when Displate is unreachable', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      throw new Error('network down')
    })
    const handler = createProxyHandler({ fetchImpl })
    const { res } = await call(handler, fakeRequest('/displate-api/search?phrase=a'))
    expect(res.statusCode).toBe(502)
  })
})
