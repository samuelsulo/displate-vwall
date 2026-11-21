import { watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, type AppLocale } from '@/i18n'

export function useLocale() {
  const { locale, t } = useI18n()

  function setLocale(next: AppLocale) {
    locale.value = next
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      // localStorage can throw in sandboxed or private-browsing contexts
    }
  }

  /** Keep <html lang>, the document title and the meta description in sync with the locale. */
  function syncDocument() {
    watchEffect(() => {
      document.documentElement.lang = locale.value
      document.title = t('app.name')
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute('content', t('app.description'))
    })
  }

  return { locale, locales: SUPPORTED_LOCALES, setLocale, syncDocument }
}
