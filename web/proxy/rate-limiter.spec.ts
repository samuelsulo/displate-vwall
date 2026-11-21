import { describe, expect, it } from 'vitest'
import { TokenBucket } from './rate-limiter'

describe('TokenBucket', () => {
  it('allows up to the capacity, then blocks with a retry time', () => {
    const now = 0
    const bucket = new TokenBucket(3, 60_000, () => now)
    expect(bucket.take().allowed).toBe(true)
    expect(bucket.take().allowed).toBe(true)
    expect(bucket.take().allowed).toBe(true)
    const blocked = bucket.take()
    expect(blocked).toEqual({ allowed: false, retryAfterSeconds: 20 })
  })

  it('refills over time', () => {
    let now = 0
    const bucket = new TokenBucket(2, 60_000, () => now)
    bucket.take()
    bucket.take()
    expect(bucket.take().allowed).toBe(false)
    now += 30_000
    expect(bucket.take().allowed).toBe(true)
    expect(bucket.take().allowed).toBe(false)
  })

  it('never holds more than the capacity', () => {
    let now = 0
    const bucket = new TokenBucket(2, 60_000, () => now)
    now += 10 * 60_000
    expect(bucket.take().allowed).toBe(true)
    expect(bucket.take().allowed).toBe(true)
    expect(bucket.take().allowed).toBe(false)
  })
})
