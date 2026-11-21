import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { TokenBucket } from './rate-limiter'
import { validateSearch } from './validate-search'

export const PROXY_PREFIX = '/displate-api'
export const SEARCH_PATH = `${PROXY_PREFIX}/search`
const UPSTREAM_SEARCH_URL = 'https://displate.com/elysium-api/user/v9/search'
const REQUESTS_PER_MINUTE = 20
const UPSTREAM_TIMEOUT_MS = 15_000

const LOOPBACK_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value)
  res.end(JSON.stringify(body))
}

export interface ProxyOptions {
  /** Injected in tests. */
  fetchImpl?: typeof fetch
  bucket?: TokenBucket
}

/**
 * Forwards only the Displate search, from localhost, with a server-side rate limit.
 * Every other path under the prefix is a 404: this is not an open relay.
 */
export function createProxyHandler(options: ProxyOptions = {}) {
  const fetchImpl = options.fetchImpl ?? fetch
  const bucket = options.bucket ?? new TokenBucket(REQUESTS_PER_MINUTE, 60_000)
  // Anonymous visitor id that the upstream search requires, random for each run.
  const anonymousUser = randomUUID()

  return async function handle(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname !== SEARCH_PATH && !url.pathname.startsWith(`${PROXY_PREFIX}/`)) return false

    if (url.pathname !== SEARCH_PATH) {
      sendJson(res, 404, { error: 'not_found' })
      return true
    }
    if (!LOOPBACK_ADDRESSES.has(req.socket.remoteAddress ?? '')) {
      sendJson(res, 403, { error: 'forbidden' })
      return true
    }
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'method_not_allowed' }, { Allow: 'GET' })
      return true
    }

    const validation = validateSearch(url.searchParams)
    if (!validation.ok) {
      sendJson(res, 400, { error: 'bad_request', message: validation.message })
      return true
    }

    const slot = bucket.take()
    if (!slot.allowed) {
      sendJson(
        res,
        429,
        { error: 'rate_limited', retryAfterSeconds: slot.retryAfterSeconds },
        { 'Retry-After': String(slot.retryAfterSeconds) },
      )
      return true
    }

    const { phrase, size, page } = validation.query
    const upstream = new URL(UPSTREAM_SEARCH_URL)
    upstream.searchParams.set('phrase', phrase)
    upstream.searchParams.set('au', anonymousUser)
    upstream.searchParams.set('size', String(size))
    upstream.searchParams.set('page', String(page))
    upstream.searchParams.set('isArtistSuggestion', 'false')

    try {
      const response = await fetchImpl(upstream, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      })
      res.statusCode = response.status
      res.setHeader('Content-Type', 'application/json')
      res.end(await response.text())
    } catch {
      sendJson(res, 502, { error: 'upstream_unavailable' })
    }
    return true
  }
}

type Middlewares = {
  use: (handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void
}

function install(middlewares: Middlewares, options?: ProxyOptions) {
  const handle = createProxyHandler(options)
  middlewares.use((req, res, next) => {
    handle(req, res).then((handled) => {
      if (!handled) next()
    })
  })
}

/** Vite plugin: the same proxy for `vite` (dev) and `vite preview`. */
export function displateProxy(options?: ProxyOptions): Plugin {
  return {
    name: 'displate-proxy',
    configureServer: (server) => install(server.middlewares, options),
    configurePreviewServer: (server) => install(server.middlewares, options),
  }
}
