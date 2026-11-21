import { describe, expect, it } from 'vitest'
import { findFreeSpot, overlaps } from './placement'

const wall = { width: 300, height: 250 }

describe('overlaps', () => {
  it('detects covered areas but not touching edges', () => {
    expect(
      overlaps({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 }),
    ).toBe(true)
    expect(
      overlaps({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 0, width: 10, height: 10 }),
    ).toBe(false)
  })
})

describe('findFreeSpot', () => {
  it('starts at the top left corner of an empty wall', () => {
    expect(findFreeSpot([], { width: 32, height: 45 }, wall)).toEqual({ x: 0, y: 0 })
  })

  it('places the next poster beside the first, on the snap grid', () => {
    const taken = [{ x: 0, y: 0, width: 32, height: 45 }]
    expect(findFreeSpot(taken, { width: 32, height: 45 }, wall)).toEqual({ x: 35, y: 0 })
  })

  it('moves to the next row when the row is full', () => {
    const taken = [{ x: 0, y: 0, width: 300, height: 45 }]
    expect(findFreeSpot(taken, { width: 32, height: 45 }, wall)).toEqual({ x: 0, y: 45 })
  })

  it('keeps the poster inside the wall when the wall is full', () => {
    const taken = [{ x: 0, y: 0, width: 300, height: 250 }]
    const spot = findFreeSpot(taken, { width: 90, height: 64 }, wall)
    expect(spot.x + 90).toBeLessThanOrEqual(300)
    expect(spot.y + 64).toBeLessThanOrEqual(250)
  })
})
