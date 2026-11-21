import sizes from '@/data/sizes.json'
import type { Orientation } from '@/types/poster'
import type { Dimensions, PosterSize, SizeId } from '@/types/wall'

export const posterSizes = sizes as PosterSize[]

/** Width and height in cm of a poster, aware of its orientation. */
export function dimensionsFor(size: PosterSize, orientation: Orientation): Dimensions {
  return orientation === 'horizontal'
    ? { width: size.height, height: size.width }
    : { width: size.width, height: size.height }
}

export function findSize(id: SizeId): PosterSize {
  const size = posterSizes.find((item) => item.id === id)
  if (!size) throw new Error(`Unknown poster size: ${id}`)
  return size
}
