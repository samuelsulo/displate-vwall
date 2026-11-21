import { describe, expect, it } from 'vitest'
import { clampPosition, findFreeSpot, overlaps, snap, snapAndClamp } from './placement'

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

describe('snap and clamp', () => {
  it('snaps to 5 cm', () => {
    expect(snap(12)).toBe(10)
    expect(snap(13)).toBe(15)
  })

  it('keeps the poster inside the wall', () => {
    const poster = { width: 90, height: 64 }
    expect(snapAndClamp({ x: -40, y: 999 }, poster, wall)).toEqual({ x: 0, y: 186 })
    expect(snapAndClamp({ x: 999, y: 3 }, poster, wall)).toEqual({ x: 210, y: 5 })
  })

  it('clamps without snapping', () => {
    expect(clampPosition({ x: 12.5, y: 20 }, { width: 32, height: 45 }, wall)).toEqual({
      x: 12.5,
      y: 20,
    })
    expect(clampPosition({ x: 290, y: 0 }, { width: 32, height: 45 }, wall)).toEqual({
      x: 268,
      y: 0,
    })
  })
})
