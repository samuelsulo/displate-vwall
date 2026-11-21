import { ref } from 'vue'
import type { Poster } from '@/types/poster'
import type { SizeId, WallItem, WallSettings } from '@/types/wall'
import { findFreeSpot } from '@/utils/placement'
import { dimensionsFor, findSize } from '@/utils/sizes'

export const DEFAULT_WALL: WallSettings = { width: 300, height: 250, color: '#f2f2f2' }

function newUid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Wall state: the wall itself and the posters on it. */
export function createWall() {
  const settings = ref<WallSettings>({ ...DEFAULT_WALL })
  const items = ref<WallItem[]>([])

  function addPoster(poster: Poster, sizeId: SizeId): WallItem {
    const dimensions = dimensionsFor(findSize(sizeId), poster.orientation)
    const spot = findFreeSpot(
      items.value.map((item) => ({ x: item.x, y: item.y, ...itemDimensions(item) })),
      dimensions,
      settings.value,
    )
    const item: WallItem = {
      uid: newUid(),
      posterId: poster.id,
      title: poster.title,
      image: poster.image,
      url: poster.url,
      orientation: poster.orientation,
      size: sizeId,
      ...spot,
    }
    items.value.push(item)
    return item
  }

  return { settings, items, addPoster }
}

export function itemDimensions(item: Pick<WallItem, 'size' | 'orientation'>) {
  return dimensionsFor(findSize(item.size), item.orientation)
}

const wall = createWall()

export function useWall() {
  return wall
}
