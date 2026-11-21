import type { Orientation } from './poster'

export type SizeId = 'M' | 'L' | 'XL'

/** Size of a vertical poster in cm. A horizontal poster swaps width and height. */
export interface PosterSize {
  id: SizeId
  width: number
  height: number
}

export interface Dimensions {
  width: number
  height: number
}

/** A poster placed on the wall. Positions and sizes are in cm, from the top left corner. */
export interface WallItem {
  uid: string
  posterId: number
  title: string
  image: string
  url: string
  orientation: Orientation
  size: SizeId
  x: number
  y: number
}

export interface WallSettings extends Dimensions {
  color: string
}
