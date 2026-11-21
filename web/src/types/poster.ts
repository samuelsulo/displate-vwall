export type Orientation = 'vertical' | 'horizontal'

export interface Poster {
  /** Displate external id, also used in the poster page url. */
  id: number
  title: string
  /** Full image url, already sized for the poster orientation. */
  image: string
  orientation: Orientation
  /** Poster page on displate.com. */
  url: string
}

export interface SearchPage {
  phrase: string
  page: number
  posters: Poster[]
  /** Total number of matches for the phrase. */
  total: number
  /** Related search phrases, without the searched one. */
  related: string[]
}
