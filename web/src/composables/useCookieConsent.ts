/**
 * useCookieConsent
 *
 * Cookie consent state: which categories the visitor has accepted, whether
 * the first-visit banner or the reopenable preferences modal should be
 * shown, and persistence to localStorage. See
 * references/cookie-consent.md in the vue-webapp-standard skill for the
 * full rationale (GDPR/Garante rules this implements) before changing this.
 *
 * Adapt before use:
 * - STORAGE_KEY: replace "<project>" with this project's slug (same
 *   namespacing convention as the i18n locale key).
 * - CONSENT_VERSION: bump it whenever the category list in
 *   data/cookie-categories.json changes meaning (a category is added,
 *   removed, or starts covering a materially different set of
 *   cookies/trackers) — never for a copy-only or visual change. Bumping it
 *   re-prompts every visitor who already made a choice under the old
 *   version, which is the point: see "Updating an existing project" in
 *   references/cookie-consent.md.
 */
import { computed, ref } from 'vue'
import categories from '@/data/cookie-categories.json'
import type { CookieCategory, CookieConsentState } from '@/types/cookie-consent'

const STORAGE_KEY = 'displate-vwall:cookie-consent'
const CONSENT_VERSION = 1

function readStoredState(): CookieConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CookieConsentState
  } catch {
    // Sandboxed/private-browsing contexts can throw, or the stored value can
    // be malformed after a manual edit — either way, treat as "never decided"
    // rather than crashing.
    return null
  }
}

function writeStoredState(state: CookieConsentState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Best-effort persistence: if storage is unavailable the banner will
    // simply reappear next visit, which is an acceptable degradation here.
  }
}

function defaultState(): CookieConsentState {
  const initial: Record<string, boolean> = {}
  for (const category of categories as CookieCategory[]) {
    initial[category.id] = category.required
  }
  return { version: CONSENT_VERSION, decidedAt: null, categories: initial }
}

const state = ref<CookieConsentState>(readStoredState() ?? defaultState())
const isPreferencesOpen = ref(false)

function persist(next: CookieConsentState) {
  state.value = next
  writeStoredState(next)
}

export function useCookieConsent() {
  const isBannerVisible = computed(
    () => state.value.decidedAt === null || state.value.version !== CONSENT_VERSION,
  )

  function hasConsent(categoryId: string): boolean {
    const category = (categories as CookieCategory[]).find((c) => c.id === categoryId)
    if (category?.required) return true
    return state.value.categories[categoryId] === true
  }

  function acceptAll() {
    const next: Record<string, boolean> = {}
    for (const category of categories as CookieCategory[]) next[category.id] = true
    persist({ version: CONSENT_VERSION, decidedAt: new Date().toISOString(), categories: next })
  }

  function rejectAll() {
    const next: Record<string, boolean> = {}
    for (const category of categories as CookieCategory[]) next[category.id] = category.required
    persist({ version: CONSENT_VERSION, decidedAt: new Date().toISOString(), categories: next })
  }

  function savePreferences(chosen: Record<string, boolean>) {
    const next: Record<string, boolean> = { ...state.value.categories, ...chosen }
    for (const category of categories as CookieCategory[]) {
      if (category.required) next[category.id] = true
    }
    persist({ version: CONSENT_VERSION, decidedAt: new Date().toISOString(), categories: next })
    isPreferencesOpen.value = false
  }

  function openPreferences() {
    isPreferencesOpen.value = true
  }

  function closePreferences() {
    isPreferencesOpen.value = false
  }

  return {
    categories: categories as CookieCategory[],
    consent: state,
    isBannerVisible,
    isPreferencesOpen,
    hasConsent,
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
    closePreferences,
  }
}
