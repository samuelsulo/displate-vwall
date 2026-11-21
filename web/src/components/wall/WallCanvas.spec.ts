import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WallCanvas from './WallCanvas.vue'
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

function setup() {
  i18n.global.locale.value = 'en'
  const wall = useWall()
  wall.items.value = []
  wall.selectedUid.value = null
  wall.settings.value = { ...DEFAULT_WALL }
  const item = wall.addPoster(poster, 'M')
  const wrapper = mount(WallCanvas, { global: { plugins: [i18n] } })
  return { wall, item, wrapper }
}

describe('WallCanvas', () => {
  beforeEach(() => {
    useWall().items.value = []
  })

  it('draws posters at their real ratio to the wall', () => {
    const { wrapper } = setup()
    const style = wrapper.find('.wall-item').attributes('style')!
    expect(style).toContain(`width: ${(32 / 300) * 100}%`)
    expect(style).toContain(`height: ${(45 / 250) * 100}%`)
    expect(wrapper.find('.wall-canvas').attributes('style')).toContain('aspect-ratio: 300 / 250')
  })

  it('draws a horizontal poster with swapped sides', () => {
    const { wall, wrapper } = setup()
    wall.addPoster({ ...poster, id: 2, orientation: 'horizontal' }, 'M')
    return wrapper.vm.$nextTick().then(() => {
      const style = wrapper.findAll('.wall-item')[1]!.attributes('style')!
      expect(style).toContain(`width: ${(45 / 300) * 100}%`)
      expect(style).toContain(`height: ${(32 / 250) * 100}%`)
    })
  })

  it('moves the focused poster with the arrow keys by 5 cm', async () => {
    const { item, wrapper } = setup()
    const button = wrapper.find('.wall-item')
    await button.trigger('keydown', { key: 'ArrowRight' })
    await button.trigger('keydown', { key: 'ArrowDown' })
    expect(item).toMatchObject({ x: 5, y: 5 })
    await button.trigger('keydown', { key: 'ArrowLeft' })
    await button.trigger('keydown', { key: 'ArrowLeft' })
    expect(item.x).toBe(0)
  })

  it('removes the poster with Delete', async () => {
    const { wall, wrapper } = setup()
    await wrapper.find('.wall-item').trigger('keydown', { key: 'Delete' })
    expect(wall.items.value).toHaveLength(0)
  })

  it('drags with the pointer, snapping to 5 cm', async () => {
    const { item, wrapper } = setup()
    const canvas = wrapper.find('.wall-canvas').element
    canvas.getBoundingClientRect = () => ({ width: 600, height: 500 }) as DOMRect
    const button = wrapper.find('.wall-item')
    await button.trigger('pointerdown', { clientX: 10, clientY: 10, pointerId: 1 })
    await button.trigger('pointermove', { clientX: 110, clientY: 60, pointerId: 1 })
    expect(item).toMatchObject({ x: 50, y: 25 })
    await button.trigger('pointerup', { pointerId: 1 })
    await button.trigger('pointermove', { clientX: 400, clientY: 400, pointerId: 1 })
    expect(item).toMatchObject({ x: 50, y: 25 })
  })

  it('labels each poster with its size and position', () => {
    const { wrapper } = setup()
    expect(wrapper.find('.wall-item').attributes('aria-label')).toBe(
      'Red Dragon, size M, position 0 x 0 cm',
    )
  })
})
