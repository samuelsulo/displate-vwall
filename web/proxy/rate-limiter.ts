/** Token bucket: `capacity` requests, refilled evenly over `windowMs`. */
export class TokenBucket {
  private tokens: number
  private lastRefill: number

  constructor(
    private readonly capacity: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {
    this.tokens = capacity
    this.lastRefill = now()
  }

  private refill() {
    const current = this.now()
    const elapsed = current - this.lastRefill
    this.tokens = Math.min(this.capacity, this.tokens + (elapsed * this.capacity) / this.windowMs)
    this.lastRefill = current
  }

  /** Takes one token. When none is left, returns the seconds to wait for the next one. */
  take(): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
    this.refill()
    if (this.tokens >= 1) {
      this.tokens -= 1
      return { allowed: true }
    }
    const missing = 1 - this.tokens
    const waitMs = (missing * this.windowMs) / this.capacity
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(waitMs / 1000)) }
  }
}
