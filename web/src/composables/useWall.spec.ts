import { describe, expect, it } from 'vitest'
import { createWall } from './useWall'
import type { Poster } from '@/types/poster'

const vertical: Poster = {
  id: 1,
  title: 'Red Dragon',
  image: 'https://static.displate.com/857x1200/displate/a.jpg',
  orientation: 'vertical',
  url: 'https://displate.com/displate/1',
}

describe('useWall', () => {
  it('starts with the default wall', () => {
    const { settings, items } = createWall()
    expect(settings.value).toMatchObject({ width: 300, height: 250 })
    expect(items.value).toEqual([])
  })

  it('adds a poster at the chosen size in a free spot', () => {
    const { items, addPoster } = createWall()
    const item = addPoster(vertical, 'L')
    expect(item).toMatchObject({ posterId: 1, size: 'L', x: 0, y: 0, orientation: 'vertical' })
    expect(items.value).toHaveLength(1)
  })

  it('lets the same poster be added more than once, side by side', () => {
    const { items, addPoster } = createWall()
    const first = addPoster(vertical, 'M')
    const second = addPoster(vertical, 'M')
    expect(items.value).toHaveLength(2)
    expect(second.uid).not.toBe(first.uid)
    expect(second.x).toBeGreaterThanOrEqual(first.x + 32)
  })

  it('uses the swapped dimensions of a horizontal poster to find the spot', () => {
    const { addPoster } = createWall()
    addPoster({ ...vertical, orientation: 'horizontal' }, 'M')
    const next = addPoster(vertical, 'M')
    expect(next.x).toBe(45)
  })
})
