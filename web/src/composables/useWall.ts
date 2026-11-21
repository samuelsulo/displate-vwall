import { ref } from 'vue'
import type { Poster } from '@/types/poster'
import type { SizeId, WallItem, WallSettings } from '@/types/wall'
import { clampPosition, findFreeSpot, snapAndClamp } from '@/utils/placement'
import { dimensionsFor, findSize } from '@/utils/sizes'

export const DEFAULT_WALL: WallSettings = { width: 300, height: 250, color: '#f2f2f2' }
export const MIN_WALL_CM = 50
export const MAX_WALL_CM = 1000

function clampWallSide(value: number): number {
  if (!Number.isFinite(value)) return MIN_WALL_CM
  return Math.min(MAX_WALL_CM, Math.max(MIN_WALL_CM, Math.round(value)))
}

function newUid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Wall state: the wall itself and the posters on it. */
export function createWall() {
  const settings = ref<WallSettings>({ ...DEFAULT_WALL })
  const items = ref<WallItem[]>([])
  const selectedUid = ref<string | null>(null)

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
    selectedUid.value = item.uid
    return item
  }

  function find(uid: string): WallItem | undefined {
    return items.value.find((item) => item.uid === uid)
  }

  function select(uid: string | null) {
    selectedUid.value = uid
  }

  /** Moves a poster to a position, snapped to the grid and kept inside the wall. */
  function moveTo(uid: string, x: number, y: number) {
    const item = find(uid)
    if (!item) return
    Object.assign(item, snapAndClamp({ x, y }, itemDimensions(item), settings.value))
  }

  function moveBy(uid: string, dx: number, dy: number) {
    const item = find(uid)
    if (item) moveTo(uid, item.x + dx, item.y + dy)
  }

  function setSize(uid: string, size: SizeId) {
    const item = find(uid)
    if (!item) return
    item.size = size
    Object.assign(item, clampPosition(item, itemDimensions(item), settings.value))
  }

  function remove(uid: string) {
    items.value = items.value.filter((item) => item.uid !== uid)
    if (selectedUid.value === uid) selectedUid.value = null
  }

  /** The last item of the list is drawn on top. */
  function bringToFront(uid: string) {
    const item = find(uid)
    if (!item) return
    items.value = [...items.value.filter((other) => other.uid !== uid), item]
  }

  function setWallSize(width: number, height: number) {
    settings.value.width = clampWallSide(width)
    settings.value.height = clampWallSide(height)
    for (const item of items.value) {
      Object.assign(item, clampPosition(item, itemDimensions(item), settings.value))
    }
  }

  function setWallColor(color: string) {
    settings.value.color = color
  }

  return {
    settings,
    items,
    selectedUid,
    addPoster,
    select,
    moveTo,
    moveBy,
    setSize,
    remove,
    bringToFront,
    setWallSize,
    setWallColor,
  }
}

export function itemDimensions(item: Pick<WallItem, 'size' | 'orientation'>) {
  return dimensionsFor(findSize(item.size), item.orientation)
}

const wall = createWall()

export function useWall() {
  return wall
}
