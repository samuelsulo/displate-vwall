import { describe, expect, it } from 'vitest'
import { dimensionsFor, findSize, posterSizes } from './sizes'

describe('sizes', () => {
  it('reads M, L and XL from the data file', () => {
    expect(posterSizes.map((size) => size.id)).toEqual(['M', 'L', 'XL'])
  })

  it('swaps width and height for a horizontal poster', () => {
    expect(dimensionsFor(findSize('M'), 'vertical')).toEqual({ width: 32, height: 45 })
    expect(dimensionsFor(findSize('M'), 'horizontal')).toEqual({ width: 45, height: 32 })
    expect(dimensionsFor(findSize('L'), 'vertical')).toEqual({ width: 48, height: 67.5 })
    expect(dimensionsFor(findSize('L'), 'horizontal')).toEqual({ width: 67.5, height: 48 })
    expect(dimensionsFor(findSize('XL'), 'vertical')).toEqual({ width: 64, height: 90 })
    expect(dimensionsFor(findSize('XL'), 'horizontal')).toEqual({ width: 90, height: 64 })
  })
})
