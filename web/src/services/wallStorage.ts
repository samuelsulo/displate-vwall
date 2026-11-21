import type { Orientation } from '@/types/poster'
import type { SizeId, WallItem, WallSettings } from '@/types/wall'

export const WALL_STORAGE_KEY = 'displate-vwall:wall'
const STORAGE_VERSION = 1

export interface StoredWall {
  settings: WallSettings
  items: WallItem[]
}

const SIZE_IDS: SizeId[] = ['M', 'L', 'XL']
const ORIENTATIONS: Orientation[] = ['vertical', 'horizontal']

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

function toItem(value: unknown): WallItem | null {
  if (!isRecord(value)) return null
  const { uid, posterId, title, image, url, orientation, size, x, y } = value
  if (
    typeof uid !== 'string' ||
    !isNumber(posterId) ||
    typeof title !== 'string' ||
    typeof image !== 'string' ||
    typeof url !== 'string' ||
    !ORIENTATIONS.includes(orientation as Orientation) ||
    !SIZE_IDS.includes(size as SizeId) ||
    !isNumber(x) ||
    !isNumber(y)
  ) {
    return null
  }
  return {
    uid,
    posterId,
    title,
    image,
    url,
    orientation: orientation as Orientation,
    size: size as SizeId,
    x,
    y,
  }
}

/** Reads the saved wall. Anything missing, malformed or unreadable gives `null`; bad items are dropped. */
export function loadWall(): StoredWall | null {
  try {
    const raw = localStorage.getItem(WALL_STORAGE_KEY)
    if (!raw) return null
    const data: unknown = JSON.parse(raw)
    if (!isRecord(data) || data.version !== STORAGE_VERSION || !isRecord(data.settings)) return null
    const { width, height, color } = data.settings
    if (!isNumber(width) || !isNumber(height) || typeof color !== 'string') return null
    const items = Array.isArray(data.items) ? data.items.map(toItem).filter((i) => i !== null) : []
    return { settings: { width, height, color }, items }
  } catch {
    // Sandboxed or private-browsing contexts can throw, and the stored value can be malformed
    return null
  }
}

/** Best effort: when storage is unavailable or full, the wall simply is not remembered. */
export function saveWall(wall: StoredWall): void {
  try {
    localStorage.setItem(
      WALL_STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, settings: wall.settings, items: wall.items }),
    )
  } catch {
    // Ignored on purpose
  }
}
