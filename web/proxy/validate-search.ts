export const MAX_PAGE_SIZE = 60
export const DEFAULT_PAGE_SIZE = 24
export const MAX_PHRASE_LENGTH = 100
export const MAX_PAGE = 100

export interface SearchQuery {
  phrase: string
  size: number
  page: number
}

export type SearchValidation = { ok: true; query: SearchQuery } | { ok: false; message: string }

function readInteger(value: string | null, fallback: number): number | null {
  if (value === null) return fallback
  if (!/^\d{1,4}$/.test(value)) return null
  return Number(value)
}

/** Keeps only the known parameters: anything else in the query string is dropped. */
export function validateSearch(params: URLSearchParams): SearchValidation {
  const phrase = (params.get('phrase') ?? '').trim()
  if (phrase.length === 0) return { ok: false, message: 'phrase is required' }
  if (phrase.length > MAX_PHRASE_LENGTH) return { ok: false, message: 'phrase is too long' }

  const requestedSize = readInteger(params.get('size'), DEFAULT_PAGE_SIZE)
  if (requestedSize === null || requestedSize < 1) return { ok: false, message: 'invalid size' }

  const page = readInteger(params.get('page'), 1)
  if (page === null || page < 1 || page > MAX_PAGE) return { ok: false, message: 'invalid page' }

  return {
    ok: true,
    query: { phrase, size: Math.min(requestedSize, MAX_PAGE_SIZE), page },
  }
}
