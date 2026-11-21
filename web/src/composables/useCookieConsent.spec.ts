import { beforeEach, describe, expect, it, vi } from 'vitest'

async function load() {
  vi.resetModules()
  return (await import('./useCookieConsent')).useCookieConsent()
}

describe('useCookieConsent', () => {
  beforeEach(() => localStorage.clear())

  it('shows the banner until a choice is made', async () => {
    const consent = await load()
    expect(consent.isBannerVisible.value).toBe(true)
    consent.rejectAll()
    expect(consent.isBannerVisible.value).toBe(false)
  })

  it('keeps the necessary category on whatever the choice', async () => {
    const consent = await load()
    consent.rejectAll()
    expect(consent.hasConsent('necessary')).toBe(true)
  })

  it('restores the choice after a reload', async () => {
    const first = await load()
    first.acceptAll()
    const second = await load()
    expect(second.isBannerVisible.value).toBe(false)
  })

  it('shows the banner again when the stored version is old', async () => {
    localStorage.setItem(
      'displate-vwall:cookie-consent',
      JSON.stringify({ version: 0, decidedAt: '2026-01-01T00:00:00.000Z', categories: {} }),
    )
    const consent = await load()
    expect(consent.isBannerVisible.value).toBe(true)
  })
})
