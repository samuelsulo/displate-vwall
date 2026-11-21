/** The proxy (or Displate) asked to slow down. */
export class RateLimitedError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super(`Rate limited, retry in ${retryAfterSeconds}s`)
    this.name = 'RateLimitedError'
  }
}

/** The proxy or Displate could not be reached. */
export class NetworkError extends Error {
  constructor(message = 'Network error') {
    super(message)
    this.name = 'NetworkError'
  }
}

/** The search answered with an unexpected status or body. */
export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`Unexpected response (${status})`)
    this.name = 'ApiError'
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
