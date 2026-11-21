import type { WallItem, SizeId } from '@/types/wall'
import type { Orientation } from '@/types/poster'
import { dimensionsFor, findSize } from '@/utils/sizes'

export interface SummaryLine {
  key: string
  posterId: number
  title: string
  url: string
  size: SizeId
  orientation: Orientation
  width: number
  height: number
  count: number
}

export interface WallSummary {
  lines: SummaryLine[]
  /** Number of posters on the wall, copies included. */
  totalPosters: number
  /** Surface of all the posters in square meters. */
  totalAreaM2: number
}

/** One line for each poster and size, with how many copies are on the wall. */
export function summarize(items: WallItem[]): WallSummary {
  const lines = new Map<string, SummaryLine>()
  let areaCm2 = 0

  for (const item of items) {
    const { width, height } = dimensionsFor(findSize(item.size), item.orientation)
    areaCm2 += width * height
    const key = `${item.posterId}|${item.size}`
    const line = lines.get(key)
    if (line) line.count += 1
    else {
      lines.set(key, {
        key,
        posterId: item.posterId,
        title: item.title,
        url: item.url,
        size: item.size,
        orientation: item.orientation,
        width,
        height,
        count: 1,
      })
    }
  }

  return {
    lines: [...lines.values()],
    totalPosters: items.length,
    totalAreaM2: areaCm2 / 10_000,
  }
}
