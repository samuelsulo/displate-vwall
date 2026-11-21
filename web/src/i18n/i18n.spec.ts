import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import itMessages from './locales/it.json'
import enMessages from './locales/en.json'

type Messages = { [key: string]: string | Messages }

function flatten(messages: Messages, prefix = ''): Record<string, string> {
  return Object.entries(messages).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') acc[path] = value
    else Object.assign(acc, flatten(value, path))
    return acc
  }, {})
}

const locales = { it: itMessages as Messages, en: enMessages as Messages }

describe('i18n messages', () => {
  it('has the same keys in every locale', () => {
    expect(Object.keys(flatten(locales.en)).sort()).toEqual(Object.keys(flatten(locales.it)).sort())
  })

  it('keeps the footer version placeholder', () => {
    for (const messages of Object.values(locales)) {
      expect(flatten(messages)['footer.version']).toBe('v{version}')
    }
  })

  for (const [locale, messages] of Object.entries(locales)) {
    it(`compiles every ${locale} message`, () => {
      const errors: unknown[] = []
      const i18n = createI18n({
        legacy: false,
        locale,
        messages: { [locale]: messages },
        missingWarn: false,
        warnHtmlMessage: false,
      })
      for (const key of Object.keys(flatten(messages))) {
        try {
          i18n.global.t(key, { version: '1' })
        } catch (error) {
          errors.push({ key, error })
        }
      }
      expect(errors).toEqual([])
    })
  }
})
