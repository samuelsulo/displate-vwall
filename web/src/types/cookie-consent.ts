/**
 * Cookie consent types.
 *
 * See references/cookie-consent.md in the vue-webapp-standard skill before
 * changing the shape of these — CookieConsentState is persisted to
 * localStorage and CONSENT_VERSION (in useCookieConsent.ts) depends on it.
 */

export interface CookieCategory {
  /** Stable id, matches a key under `data/cookie-categories.json` and the `cookies.categories.<id>` i18n key. */
  id: string
  /** True only for the always-on category (typically "necessary") — never offered a toggle. */
  required: boolean
  /** i18n key for this category's label/description, e.g. "cookies.categories.analytics". */
  translationKey: string
}

export interface CookieConsentState {
  /** Bumped whenever the category list or its meaning changes — forces a re-prompt. See CONSENT_VERSION. */
  version: number
  /** ISO timestamp of the last explicit choice, or null if the user has never decided. */
  decidedAt: string | null
  /** Per-category opt-in, keyed by CookieCategory.id. */
  categories: Record<string, boolean>
}
