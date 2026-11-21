import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { WALL_STORAGE_KEY } from '@/services/wallStorage'
import type { Poster } from '@/types/poster'

const poster: Poster = {
  id: 1,
  title: 'Red Dragon',
  image: 'https://static.displate.com/857x1200/displate/a.jpg',
  orientation: 'vertical',
  url: 'https://displate.com/displate/1',
}

describe('wall persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  it('restores the wall and the posters after a reload', async () => {
    const first = (await import('./useWall')).useWall()
    first.setWallSize(420, 270)
    first.addPoster(poster, 'XL')
    await nextTick()
    expect(localStorage.getItem(WALL_STORAGE_KEY)).toContain('Red Dragon')

    vi.resetModules()
    const reloaded = (await import('./useWall')).useWall()
    expect(reloaded.settings.value).toMatchObject({ width: 420, height: 270 })
    expect(reloaded.items.value).toHaveLength(1)
    expect(reloaded.items.value[0]).toMatchObject({ title: 'Red Dragon', size: 'XL' })
  })

  it('saves the changes of a poster that was moved', async () => {
    const wall = (await import('./useWall')).useWall()
    const item = wall.addPoster(poster, 'M')
    wall.moveTo(item.uid, 100, 100)
    await nextTick()
    const stored = JSON.parse(localStorage.getItem(WALL_STORAGE_KEY)!)
    expect(stored.items[0]).toMatchObject({ x: 100, y: 100 })
  })
})
