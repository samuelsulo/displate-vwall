import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CookieConsentBanner from './CookieConsentBanner.vue'
import { useCookieConsent } from '@/composables/useCookieConsent'
import { i18n } from '@/i18n'

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en'
    localStorage.clear()
    useCookieConsent().closePreferences()
  })

  it('gives accept and reject the same size and weight', () => {
    const wrapper = mount(CookieConsentBanner, { global: { plugins: [i18n] } })
    const buttons = wrapper.findAll('button')
    const labels = buttons.map((b) => b.text())
    expect(labels).toEqual(['Customize', 'Reject', 'Accept'])
    expect(buttons[1]!.classes()).toEqual(['cookie-banner__button'])
  })
})
