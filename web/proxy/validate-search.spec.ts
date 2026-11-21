import { describe, expect, it } from 'vitest'
import { MAX_PAGE_SIZE, validateSearch } from './validate-search'

const check = (query: string) => validateSearch(new URLSearchParams(query))

describe('validateSearch', () => {
  it('accepts a phrase and applies the defaults', () => {
    expect(check('phrase=dragon')).toEqual({
      ok: true,
      query: { phrase: 'dragon', size: 24, page: 1 },
    })
  })

  it('caps the size', () => {
    const result = check('phrase=dragon&size=500')
    expect(result.ok && result.query.size).toBe(MAX_PAGE_SIZE)
  })

  it('drops unknown parameters', () => {
    const result = check('phrase=dragon&au=hijack&foo=bar')
    expect(result).toEqual({ ok: true, query: { phrase: 'dragon', size: 24, page: 1 } })
  })

  it.each([
    ['', 'missing phrase'],
    ['phrase=%20%20', 'blank phrase'],
    [`phrase=${'a'.repeat(101)}`, 'long phrase'],
    ['phrase=a&size=0', 'zero size'],
    ['phrase=a&size=-3', 'negative size'],
    ['phrase=a&size=abc', 'non numeric size'],
    ['phrase=a&page=0', 'zero page'],
    ['phrase=a&page=101', 'page too high'],
  ])('rejects %s (%s)', (query) => {
    expect(check(query).ok).toBe(false)
  })
})
