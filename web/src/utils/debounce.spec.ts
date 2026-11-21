import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('calls once with the last arguments after the wait', () => {
    const fn = vi.fn<(value: string) => void>()
    const debounced = debounce(fn, 400)
    debounced('d')
    debounced('dr')
    debounced('dra')
    vi.advanceTimersByTime(399)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('dra')
  })

  it('drops the pending call on cancel', () => {
    const fn = vi.fn<() => void>()
    const debounced = debounce(fn, 400)
    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(1000)
    expect(fn).not.toHaveBeenCalled()
  })
})
