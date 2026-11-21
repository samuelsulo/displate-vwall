import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WALL_STORAGE_KEY, loadWall, saveWall, type StoredWall } from './wallStorage'

const wall: StoredWall = {
  settings: { width: 400, height: 260, color: '#abcdef' },
  items: [
    {
      uid: 'a',
      posterId: 1,
      title: 'Red Dragon',
      image: 'https://static.displate.com/857x1200/displate/a.jpg',
      url: 'https://displate.com/displate/1',
      orientation: 'vertical',
      size: 'L',
      x: 10,
      y: 20,
    },
  ],
}

describe('wallStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('gives nothing when nothing was saved', () => {
    expect(loadWall()).toBeNull()
  })

  it('restores what was saved', () => {
    saveWall(wall)
    expect(loadWall()).toEqual(wall)
  })

  it('ignores a malformed value', () => {
    localStorage.setItem(WALL_STORAGE_KEY, '{not json')
    expect(loadWall()).toBeNull()
    localStorage.setItem(WALL_STORAGE_KEY, JSON.stringify({ version: 99 }))
    expect(loadWall()).toBeNull()
  })

  it('drops the items that are not valid', () => {
    saveWall(wall)
    const stored = JSON.parse(localStorage.getItem(WALL_STORAGE_KEY)!)
    stored.items.push({ uid: 'b', size: 'XXL' }, 'nope')
    localStorage.setItem(WALL_STORAGE_KEY, JSON.stringify(stored))
    expect(loadWall()?.items).toEqual(wall.items)
  })

  it('does not throw when the storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full')
    })
    expect(loadWall()).toBeNull()
    expect(() => saveWall(wall)).not.toThrow()
  })
})
