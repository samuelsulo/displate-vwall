import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SizePicker from './SizePicker.vue'
import { i18n } from '@/i18n'
import type { Poster } from '@/types/poster'

const poster: Poster = {
  id: 1,
  title: 'Red Dragon',
  image: 'https://static.displate.com/857x1200/displate/a.jpg',
  orientation: 'vertical',
  url: 'https://displate.com/displate/1',
}

function mountPicker(orientation: Poster['orientation']) {
  return mount(SizePicker, {
    props: { poster: { ...poster, orientation } },
    global: { plugins: [i18n] },
  })
}

describe('SizePicker', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en'
  })

  it('shows the sizes in cm for a vertical poster', () => {
    const texts = mountPicker('vertical')
      .findAll('button')
      .map((b) => b.text())
    expect(texts).toEqual(['M32 x 45 cm', 'L48 x 67.5 cm', 'XL64 x 90 cm'])
  })

  it('shows the swapped sizes for a horizontal poster', () => {
    const texts = mountPicker('horizontal')
      .findAll('button')
      .map((b) => b.text())
    expect(texts).toEqual(['M45 x 32 cm', 'L67.5 x 48 cm', 'XL90 x 64 cm'])
  })

  it('emits the chosen size', async () => {
    const wrapper = mountPicker('vertical')
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('add')).toEqual([['L']])
  })
})
