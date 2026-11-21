import { createI18n } from 'vue-i18n'
import it from './locales/it.json'
import en from './locales/en.json'

export const SUPPORTED_LOCALES = ['it', 'en'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'it'
export const LOCALE_STORAGE_KEY = 'displate-vwall:locale'

function isSupported(value: string | null | undefined): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale)
}

export function resolveInitialLocale(): AppLocale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isSupported(saved)) return saved
  } catch {
    // localStorage can throw in sandboxed or private-browsing contexts
  }
  const browser = navigator.language?.slice(0, 2)
  return isSupported(browser) ? browser : DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  locale: resolveInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: { it, en },
})
