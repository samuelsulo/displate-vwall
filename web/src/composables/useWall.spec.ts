import { describe, expect, it } from 'vitest'
import { createWall } from './useWall'
import type { StoredWall } from '@/services/wallStorage'
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

  it('selects the poster that was just added', () => {
    const { selectedUid, addPoster } = createWall()
    const item = addPoster(vertical, 'M')
    expect(selectedUid.value).toBe(item.uid)
  })

  it('moves with a 5 cm snap and stays inside the wall', () => {
    const { addPoster, moveTo, moveBy } = createWall()
    const item = addPoster(vertical, 'M')
    moveTo(item.uid, 12, 33)
    expect(item).toMatchObject({ x: 10, y: 35 })
    moveBy(item.uid, 5, -5)
    expect(item).toMatchObject({ x: 15, y: 30 })
    moveTo(item.uid, -50, 9999)
    expect(item).toMatchObject({ x: 0, y: 205 })
  })

  it('changes the size and keeps the poster inside the wall', () => {
    const { addPoster, moveTo, setSize } = createWall()
    const item = addPoster(vertical, 'M')
    moveTo(item.uid, 9999, 9999)
    setSize(item.uid, 'XL')
    expect(item.size).toBe('XL')
    expect(item.x + 64).toBeLessThanOrEqual(300)
    expect(item.y + 90).toBeLessThanOrEqual(250)
  })

  it('removes a poster and clears the selection', () => {
    const { items, selectedUid, addPoster, remove } = createWall()
    const item = addPoster(vertical, 'M')
    remove(item.uid)
    expect(items.value).toEqual([])
    expect(selectedUid.value).toBeNull()
  })

  it('brings a poster to the front', () => {
    const { items, addPoster, bringToFront } = createWall()
    const first = addPoster(vertical, 'M')
    const second = addPoster({ ...vertical, id: 2 }, 'M')
    bringToFront(first.uid)
    expect(items.value.map((item) => item.uid)).toEqual([second.uid, first.uid])
  })

  it('resizes the wall within limits and pulls posters back inside', () => {
    const { settings, addPoster, moveTo, setWallSize } = createWall()
    const item = addPoster(vertical, 'M')
    moveTo(item.uid, 250, 200)
    setWallSize(100, 80)
    expect(settings.value).toMatchObject({ width: 100, height: 80 })
    expect(item.x + 32).toBeLessThanOrEqual(100)
    expect(item.y + 45).toBeLessThanOrEqual(80)
    setWallSize(5, 99999)
    expect(settings.value).toMatchObject({ width: 50, height: 1000 })
  })

  it('changes the wall color', () => {
    const { settings, setWallColor } = createWall()
    setWallColor('#ff0000')
    expect(settings.value.color).toBe('#ff0000')
  })

  it('starts from a saved wall', () => {
    const first = createWall()
    first.setWallSize(400, 260)
    first.setWallColor('#abcdef')
    first.addPoster(vertical, 'L')
    const saved: StoredWall = {
      settings: { ...first.settings.value },
      items: first.items.value.map((item) => ({ ...item })),
    }
    const restored = createWall(saved)
    expect(restored.settings.value).toMatchObject({ width: 400, height: 260, color: '#abcdef' })
    expect(restored.items.value).toEqual(saved.items)
  })

  it('clears the posters and keeps the wall', () => {
    const { settings, items, selectedUid, addPoster, setWallColor, clear } = createWall()
    setWallColor('#123456')
    addPoster(vertical, 'M')
    clear()
    expect(items.value).toEqual([])
    expect(selectedUid.value).toBeNull()
    expect(settings.value.color).toBe('#123456')
  })
})
