import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import SearchPanel from './SearchPanel.vue'
import { i18n } from '@/i18n'
import { RateLimitedError, displateService } from '@/services/displateService'
import type { SearchPage } from '@/types/poster'

vi.mock('@/services/displateService', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/services/displateService')>()
  return {
    ...original,
    displateService: {
      search: vi.fn<typeof original.displateService.search>(),
      clearCache: vi.fn<() => void>(),
    },
  }
})

const search = vi.mocked(displateService.search)

const result: SearchPage = {
  phrase: 'dragon',
  page: 1,
  total: 1,
  related: ['fantasy'],
  posters: [
    {
      id: 7,
      title: 'Red Dragon',
      image: 'https://static.displate.com/857x1200/displate/x.jpg',
      orientation: 'vertical',
      url: 'https://displate.com/displate/7',
    },
  ],
}

function mountPanel() {
  return mount(SearchPanel, { global: { plugins: [i18n] } })
}

describe('SearchPanel', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en'
    search.mockReset()
  })

  it('shows cards that link to displate.com, with related chips', async () => {
    search.mockResolvedValue(result)
    const wrapper = mountPanel()
    await wrapper.find('input').setValue('dragon')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    const link = wrapper.find('a.poster-card__link')
    expect(link.attributes('href')).toBe('https://displate.com/displate/7')
    expect(link.attributes('rel')).toContain('noopener')
    expect(wrapper.find('img').attributes('alt')).toBe('Red Dragon')
    expect(wrapper.text()).toContain('1 posters')
    expect(wrapper.find('.search-panel__chip').text()).toBe('fantasy')
  })

  it('starts a new search from a related chip', async () => {
    search.mockResolvedValue(result)
    const wrapper = mountPanel()
    await wrapper.find('input').setValue('dragon')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wrapper.find('.search-panel__chip').trigger('click')
    await flushPromises()
    expect(search).toHaveBeenLastCalledWith('fantasy', 1)
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('fantasy')
  })

  it('announces the loading state', async () => {
    search.mockReturnValue(new Promise(() => {}))
    const wrapper = mountPanel()
    await wrapper.find('input').setValue('dragon')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('[aria-live="polite"] [role="status"]').text()).toBe('Searching...')
  })

  it('shows the empty state', async () => {
    search.mockResolvedValue({ ...result, posters: [], total: 0, related: [] })
    const wrapper = mountPanel()
    await wrapper.find('input').setValue('zzzz')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('No posters found')
  })

  it('shows a friendly slow down message with a retry', async () => {
    search.mockRejectedValue(new RateLimitedError(17))
    const wrapper = mountPanel()
    await wrapper.find('input').setValue('dragon')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    const alert = wrapper.find('[role="alert"]')
    expect(alert.text()).toContain('Slow down')
    expect(alert.text()).toContain('17')
    expect(alert.find('button').exists()).toBe(true)
  })
})
