import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from './AppHeader.vue'
import { i18n, LOCALE_STORAGE_KEY } from '@/i18n'

describe('AppHeader', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'it'
    localStorage.clear()
  })

  it('switches language and remembers the choice', async () => {
    const wrapper = mount(AppHeader, { global: { plugins: [i18n] } })
    const en = wrapper.findAll('button').find((b) => b.text() === 'EN')!
    await en.trigger('click')
    expect(i18n.global.locale.value).toBe('en')
    expect(en.attributes('aria-pressed')).toBe('true')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en')
  })
})
