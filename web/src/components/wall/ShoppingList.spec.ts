import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ShoppingList from './ShoppingList.vue'
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

describe('ShoppingList', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en'
    const wall = useWall()
    wall.clear()
    wall.settings.value = { ...DEFAULT_WALL }
  })

  it('says the list is empty', () => {
    const wrapper = mount(ShoppingList, { global: { plugins: [i18n] } })
    expect(wrapper.text()).toContain('fills up')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('lists each poster with size and link, and the total area', () => {
    const wall = useWall()
    wall.addPoster(poster, 'M')
    wall.addPoster(poster, 'M')
    wall.addPoster(
      { ...poster, id: 2, title: 'Blue Dragon', url: 'https://displate.com/displate/2' },
      'XL',
    )
    const wrapper = mount(ShoppingList, { global: { plugins: [i18n] } })
    const links = wrapper.findAll('a')
    expect(links.map((a) => a.attributes('href'))).toEqual([
      'https://displate.com/displate/1',
      'https://displate.com/displate/2',
    ])
    expect(wrapper.text()).toContain('×2')
    expect(wrapper.text()).toContain('M, 32 x 45 cm')
    expect(wrapper.text()).toContain('XL, 64 x 90 cm')
    expect(wrapper.find('.shopping-list__total').text()).toBe(
      'Total: 3 posters, 0.86 m² of surface',
    )
  })

  it('asks for confirmation before clearing the wall', async () => {
    const wall = useWall()
    wall.addPoster(poster, 'M')
    const wrapper = mount(ShoppingList, { global: { plugins: [i18n] }, attachTo: document.body })
    await wrapper.find('.shopping-list__button').trigger('click')
    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(true)
    expect(wall.items.value).toHaveLength(1)

    const [yes, no] = wrapper.findAll('[role="alertdialog"] button')
    await no!.trigger('click')
    expect(wall.items.value).toHaveLength(1)

    await wrapper.find('.shopping-list__button').trigger('click')
    await wrapper.findAll('[role="alertdialog"] button')[0]!.trigger('click')
    expect(wall.items.value).toHaveLength(0)
    void yes
    wrapper.unmount()
  })
})
