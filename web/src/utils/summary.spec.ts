import { describe, expect, it } from 'vitest'
import { summarize } from './summary'
import type { WallItem } from '@/types/wall'

function item(
  uid: string,
  posterId: number,
  size: WallItem['size'],
  orientation: WallItem['orientation'] = 'vertical',
): WallItem {
  return {
    uid,
    posterId,
    title: `Poster ${posterId}`,
    image: 'https://static.displate.com/x.jpg',
    url: `https://displate.com/displate/${posterId}`,
    orientation,
    size,
    x: 0,
    y: 0,
  }
}

describe('summarize', () => {
  it('is empty for an empty wall', () => {
    expect(summarize([])).toEqual({ lines: [], totalPosters: 0, totalAreaM2: 0 })
  })

  it('groups copies of the same poster and size', () => {
    const { lines, totalPosters } = summarize([
      item('a', 1, 'M'),
      item('b', 1, 'M'),
      item('c', 1, 'L'),
    ])
    expect(totalPosters).toBe(3)
    expect(lines.map((line) => [line.posterId, line.size, line.count])).toEqual([
      [1, 'M', 2],
      [1, 'L', 1],
    ])
    expect(lines[0]).toMatchObject({
      url: 'https://displate.com/displate/1',
      width: 32,
      height: 45,
    })
  })

  it('sums the area in square meters, orientation aware', () => {
    const { totalAreaM2 } = summarize([item('a', 1, 'M'), item('b', 2, 'XL', 'horizontal')])
    expect(totalAreaM2).toBeCloseTo((32 * 45 + 90 * 64) / 10_000)
  })
})
