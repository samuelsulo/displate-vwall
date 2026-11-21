export const SEARCH_DEBOUNCE_MS = 400

/** Delays `fn` until `waitMs` have passed without a new call. `cancel` drops a pending call. */
export function debounce<Args extends unknown[]>(fn: (...args: Args) => void, waitMs: number) {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = (...args: Args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), waitMs)
  }
  debounced.cancel = () => clearTimeout(timer)
  return debounced
}
