import type { Dimensions } from '@/types/wall'

export const SNAP_CM = 5

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/** Touching edges do not count as an overlap. */
export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

/**
 * First spot, scanning the wall left to right and top to bottom on the snap grid, where a poster
 * fits without covering another one. When the wall is full the poster is cascaded from the top left
 * corner so it stays visible and inside the wall.
 */
export function findFreeSpot(
  taken: Rect[],
  poster: Dimensions,
  wall: Dimensions,
): { x: number; y: number } {
  const maxX = Math.max(0, wall.width - poster.width)
  const maxY = Math.max(0, wall.height - poster.height)

  for (let y = 0; y <= maxY; y += SNAP_CM) {
    for (let x = 0; x <= maxX; x += SNAP_CM) {
      const candidate = { x, y, ...poster }
      if (!taken.some((rect) => overlaps(candidate, rect))) return { x, y }
    }
  }

  const step = (taken.length % 6) * SNAP_CM * 2
  return { x: Math.min(step, maxX), y: Math.min(step, maxY) }
}
