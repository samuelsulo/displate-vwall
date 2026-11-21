<script setup lang="ts">
/**
 * CookieConsentBanner
 *
 * First-visit (and re-prompt-on-version-bump) cookie banner. Deliberately
 * gives "reject all" the same visual weight as "accept all" — see
 * references/cookie-consent.md, rule 2: a banner that makes rejecting
 * harder than accepting is a non-compliant dark pattern under the Garante's
 * cookie guidelines, not just a style choice. Don't reintroduce that
 * asymmetry when restyling this component for a client's visual identity.
 */
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCookieConsent } from '@/composables/useCookieConsent'

const { t } = useI18n()
const { isBannerVisible, acceptAll, rejectAll, openPreferences } = useCookieConsent()

const bannerRef = ref<HTMLElement | null>(null)

watch(
  isBannerVisible,
  async (visible) => {
    if (!visible) return
    await nextTick()
    bannerRef.value?.focus()
  },
  { immediate: true },
)

function customize() {
  openPreferences()
}
</script>

<template>
  <div
    v-if="isBannerVisible"
    ref="bannerRef"
    class="cookie-banner"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cookie-banner-title"
    aria-describedby="cookie-banner-description"
    tabindex="-1"
  >
    <div class="cookie-banner__body">
      <h2 id="cookie-banner-title" class="cookie-banner__title">{{ t('cookies.banner.title') }}</h2>
      <p id="cookie-banner-description" class="cookie-banner__description">
        {{ t('cookies.banner.description') }}
      </p>
    </div>
    <div class="cookie-banner__actions">
      <button type="button" class="cookie-banner__button" @click="customize">
        {{ t('cookies.banner.customize') }}
      </button>
      <button type="button" class="cookie-banner__button" @click="rejectAll">
        {{ t('cookies.banner.rejectAll') }}
      </button>
      <button
        type="button"
        class="cookie-banner__button cookie-banner__button--primary"
        @click="acceptAll"
      >
        {{ t('cookies.banner.acceptAll') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cookie-banner {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -2px 12px rgb(0 0 0 / 12%);
}

.cookie-banner__body {
  flex: 1 1 20rem;
  min-width: 0;
}

.cookie-banner__title {
  margin: 0 0 var(--space-1);
  font-family: var(--font-body);
  font-size: var(--fs-md);
}

.cookie-banner__description {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
}

.cookie-banner__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.cookie-banner__button {
  padding: var(--space-1) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.cookie-banner__button:hover {
  background: var(--color-surface-hover);
}

.cookie-banner__button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Same size/border/padding as the other two — accept is distinguished only
   by fill color, never by size or position, so it never reads as the
   "default"/easier choice. */
.cookie-banner__button--primary {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-accent-contrast);
}

.cookie-banner__button--primary:hover {
  background: var(--color-brand-dark);
}

@media (prefers-reduced-motion: reduce) {
  .cookie-banner__button {
    transition: none;
  }
}
</style>
