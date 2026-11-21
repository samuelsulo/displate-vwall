import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from './AppFooter.vue'
import { i18n } from '@/i18n'

describe('AppFooter', () => {
  it('shows the disclaimer, the version and the credits link', () => {
    const wrapper = mount(AppFooter, { global: { plugins: [i18n] } })
    expect(wrapper.text()).toContain('Displate')
    expect(wrapper.text()).toContain('vdev')
    expect(wrapper.find('a[href="https://samuelsulo.it"]').exists()).toBe(true)
  })
})
