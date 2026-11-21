import type { Orientation, Poster, SearchPage } from '@/types/poster'
import { ApiError, NetworkError, RateLimitedError } from './displate-errors'

export { ApiError, NetworkError, RateLimitedError, isAbortError } from './displate-errors'

const SEARCH_URL = '/displate-api/search'
const IMAGE_BASE_URL = 'https://static.displate.com'
const POSTER_BASE_URL = 'https://displate.com/displate'
const DEFAULT_RETRY_AFTER_SECONDS = 60

export const PAGE_SIZE = 24
export const MIN_INTERVAL_MS = 1000

interface ApiArtwork {
  externalId: number
  title: string
  imageCoreUrl: string
  orientation: Orientation
}

interface ApiPhrase {
  phrase: string
}

interface ApiSearchResponse {
  searchResult?: { artworks?: ApiArtwork[]; count?: number }
  seo?: { relatedSearches?: ApiPhrase[] }
  suggestedPhrases?: { phrases?: ApiPhrase[] }
}

export function imageUrl(imageCoreUrl: string, orientation: Orientation): string {
  const dimensions = orientation === 'horizontal' ? '1200x857' : '857x1200'
  return `${IMAGE_BASE_URL}/${dimensions}/displate/${imageCoreUrl}.jpg`
}

function toPoster(artwork: ApiArtwork): Poster {
  return {
    id: artwork.externalId,
    title: artwork.title,
    image: imageUrl(artwork.imageCoreUrl, artwork.orientation),
    orientation: artwork.orientation,
    url: `${POSTER_BASE_URL}/${artwork.externalId}`,
  }
}

function toRelated(body: ApiSearchResponse, phrase: string): string[] {
  const all = [...(body.seo?.relatedSearches ?? []), ...(body.suggestedPhrases?.phrases ?? [])].map(
    (item) => item.phrase,
  )
  const unique = new Set(all.filter((item) => item.toLowerCase() !== phrase.toLowerCase()))
  return [...unique]
}

export function mapSearchResponse(
  body: ApiSearchResponse,
  phrase: string,
  page: number,
): SearchPage {
  return {
    phrase,
    page,
    posters: (body.searchResult?.artworks ?? []).map(toPoster),
    total: body.searchResult?.count ?? 0,
    related: toRelated(body, phrase),
  }
}

function abortError(): DOMException {
  return new DOMException('The search was aborted', 'AbortError')
}

function defaultSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(abortError())
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(abortError())
      },
      { once: true },
    )
  })
}

export interface DisplateServiceOptions {
  fetchImpl?: typeof fetch
  now?: () => number
  sleep?: (ms: number, signal: AbortSignal) => Promise<void>
  minIntervalMs?: number
}

/**
 * Talks to the local proxy: one request at a time (a new search aborts the previous one),
 * at least `minIntervalMs` between two requests, and an in-memory cache by phrase and page.
 */
export function createDisplateService(options: DisplateServiceOptions = {}) {
  const fetchImpl = options.fetchImpl ?? ((...args: Parameters<typeof fetch>) => fetch(...args))
  const now = options.now ?? Date.now
  const sleep = options.sleep ?? defaultSleep
  const minIntervalMs = options.minIntervalMs ?? MIN_INTERVAL_MS

  const cache = new Map<string, SearchPage>()
  let controller: AbortController | null = null
  let lastRequestAt: number | null = null

  async function search(phrase: string, page = 1): Promise<SearchPage> {
    const cleanPhrase = phrase.trim()
    const key = `${cleanPhrase.toLowerCase()}|${page}`
    const cached = cache.get(key)
    if (cached) return cached

    controller?.abort()
    const current = new AbortController()
    controller = current

    if (lastRequestAt !== null) {
      const wait = minIntervalMs - (now() - lastRequestAt)
      if (wait > 0) await sleep(wait, current.signal)
    }
    lastRequestAt = now()

    const query = new URLSearchParams({
      phrase: cleanPhrase,
      size: String(PAGE_SIZE),
      page: String(page),
    })

    let response: Response
    try {
      response = await fetchImpl(`${SEARCH_URL}?${query}`, { signal: current.signal })
    } catch (error) {
      if (current.signal.aborted) throw abortError()
      throw new NetworkError(error instanceof Error ? error.message : undefined)
    }

    if (response.status === 429) {
      const header = Number(response.headers.get('Retry-After'))
      throw new RateLimitedError(header > 0 ? header : DEFAULT_RETRY_AFTER_SECONDS)
    }
    if (!response.ok) throw new ApiError(response.status)

    let body: ApiSearchResponse
    try {
      body = (await response.json()) as ApiSearchResponse
    } catch {
      if (current.signal.aborted) throw abortError()
      throw new ApiError(response.status)
    }

    const result = mapSearchResponse(body, cleanPhrase, page)
    cache.set(key, result)
    return result
  }

  return { search, clearCache: () => cache.clear() }
}

export const displateService = createDisplateService()
