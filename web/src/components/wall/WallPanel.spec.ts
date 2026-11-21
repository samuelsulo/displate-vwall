import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WallPanel from './WallPanel.vue'
import { i18n } from '@/i18n'
import { DEFAULT_WALL, useWall } from '@/composables/useWall'
import type { Poster } from '@/types/poster'

const poster: Poster = {
  id: 1,
  title: 'Red Dragon',
  image: 'https://static.displate.com/857x1200/displate/a.jpg',
  orientation: 'vertical',
  url: 'https://displate.com/displate/1',
}

describe('WallPanel', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en'
    const wall = useWall()
    wall.items.value = []
    wall.selectedUid.value = null
    wall.settings.value = { ...DEFAULT_WALL }
  })

  it('starts with a 300 x 250 cm wall', () => {
    const wrapper = mount(WallPanel, { global: { plugins: [i18n] } })
    const [width, height] = wrapper.findAll('input[type="number"]')
    expect((width!.element as HTMLInputElement).value).toBe('300')
    expect((height!.element as HTMLInputElement).value).toBe('250')
  })

  it('changes the wall size', async () => {
    const wrapper = mount(WallPanel, { global: { plugins: [i18n] } })
    const width = wrapper.findAll('input[type="number"]')[0]!
    ;(width.element as HTMLInputElement).value = '400'
    await width.trigger('change')
    expect(useWall().settings.value.width).toBe(400)
  })

  it('changes the size, brings to front and removes the selected poster', async () => {
    const wall = useWall()
    const first = wall.addPoster(poster, 'M')
    wall.addPoster({ ...poster, id: 2 }, 'M')
    wall.select(first.uid)
    const wrapper = mount(WallPanel, { global: { plugins: [i18n] } })

    const sizeButtons = wrapper.findAll('.wall-panel__sizes button')
    await sizeButtons[2]!.trigger('click')
    expect(first.size).toBe('XL')

    await wrapper.findAll('.wall-panel__actions button')[0]!.trigger('click')
    expect(wall.items.value[wall.items.value.length - 1]!.uid).toBe(first.uid)

    await wrapper.findAll('.wall-panel__actions button')[1]!.trigger('click')
    expect(wall.items.value).toHaveLength(1)
    expect(wrapper.find('.wall-panel__selected').exists()).toBe(false)
  })
})
