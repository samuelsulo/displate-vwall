import { computed, ref, watch } from 'vue'
import {
  displateService,
  isAbortError,
  RateLimitedError,
  NetworkError,
} from '@/services/displateService'
import type { Poster } from '@/types/poster'
import { debounce, SEARCH_DEBOUNCE_MS } from '@/utils/debounce'

export type SearchStatus = 'idle' | 'loading' | 'loading-more' | 'success' | 'error'

export type SearchFailure =
  { kind: 'rate-limited'; retryAfterSeconds: number } | { kind: 'network' } | { kind: 'api' }

type Service = Pick<typeof displateService, 'search'>

/** Search state for the poster panel: debounced typing, related chips and load more. */
export function usePosterSearch(service: Service = displateService) {
  const phrase = ref('')
  const activePhrase = ref('')
  const posters = ref<Poster[]>([])
  const total = ref(0)
  const related = ref<string[]>([])
  const page = ref(0)
  const status = ref<SearchStatus>('idle')
  const failure = ref<SearchFailure | null>(null)

  /** Ignores the answer of a request that a newer one has replaced. */
  let latest = 0

  const hasMore = computed(() => status.value === 'success' && posters.value.length < total.value)
  const isEmpty = computed(() => status.value === 'success' && posters.value.length === 0)

  function toFailure(error: unknown): SearchFailure {
    if (error instanceof RateLimitedError) {
      return { kind: 'rate-limited', retryAfterSeconds: error.retryAfterSeconds }
    }
    return error instanceof NetworkError ? { kind: 'network' } : { kind: 'api' }
  }

  async function load(text: string, nextPage: number) {
    const id = ++latest
    const append = nextPage > 1
    failure.value = null
    status.value = append ? 'loading-more' : 'loading'
    try {
      const result = await service.search(text, nextPage)
      if (id !== latest) return
      activePhrase.value = result.phrase
      posters.value = append ? [...posters.value, ...result.posters] : result.posters
      total.value = result.total
      related.value = result.related
      page.value = nextPage
      status.value = 'success'
    } catch (error) {
      if (isAbortError(error) || id !== latest) return
      failure.value = toFailure(error)
      status.value = 'error'
    }
  }

  function reset() {
    latest++
    activePhrase.value = ''
    posters.value = []
    total.value = 0
    related.value = []
    page.value = 0
    failure.value = null
    status.value = 'idle'
  }

  /** Runs the search now, for the submit button and the related chips. */
  function search(text = phrase.value) {
    debouncedSearch.cancel()
    const clean = text.trim()
    phrase.value = text
    if (clean.length === 0) return reset()
    return load(clean, 1)
  }

  function loadMore() {
    if (!hasMore.value) return
    return load(activePhrase.value, page.value + 1)
  }

  /** Retries what failed: the next page when there are results, the search otherwise. */
  function retry() {
    return posters.value.length > 0 ? load(activePhrase.value, page.value + 1) : search()
  }

  const debouncedSearch = debounce(() => void search(), SEARCH_DEBOUNCE_MS)
  watch(phrase, () => debouncedSearch())

  return {
    phrase,
    activePhrase,
    posters,
    total,
    related,
    status,
    failure,
    hasMore,
    isEmpty,
    search,
    loadMore,
    retry,
  }
}
