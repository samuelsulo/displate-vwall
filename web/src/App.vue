<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppFooter from '@/components/layout/AppFooter.vue'
import CookieConsentBanner from '@/components/cookies/CookieConsentBanner.vue'
import CookiePreferencesModal from '@/components/cookies/CookiePreferencesModal.vue'
import LegalPolicyModal from '@/components/cookies/LegalPolicyModal.vue'
import SearchPanel from '@/components/search/SearchPanel.vue'
import WallPanel from '@/components/wall/WallPanel.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useLocale } from '@/composables/useLocale'

const { t } = useI18n()
useLocale().syncDocument()
</script>

<template>
  <a class="skip-link" href="#main">{{ t('app.skipToContent') }}</a>
  <div class="app-shell">
    <AppHeader />
    <main id="main" class="app-main">
      <section class="app-panel" aria-labelledby="search-title">
        <h2 id="search-title">{{ t('panels.search') }}</h2>
        <SearchPanel />
      </section>
      <section class="app-panel" aria-labelledby="wall-title">
        <h2 id="wall-title">{{ t('panels.wall') }}</h2>
        <WallPanel />
      </section>
    </main>
    <AppFooter />
  </div>
  <CookieConsentBanner />
  <CookiePreferencesModal />
  <LegalPolicyModal />
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: var(--layout-max);
  margin: 0 auto;
}

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-6);
  padding: var(--space-4);
}

.app-panel {
  min-width: 0;
}

.app-panel h2 {
  margin: 0 0 var(--space-3);
  font-size: var(--fs-lg);
}

/* Panels stack on phone and sit side by side from tablet width. */
@media (min-width: 48rem) {
  .app-main {
    grid-template-columns: minmax(18rem, 2fr) minmax(0, 3fr);
    align-items: start;
  }
}

.skip-link {
  position: absolute;
  left: var(--space-2);
  top: -4rem;
  z-index: 10;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  background: var(--color-text-primary);
  color: var(--color-bg);
}

.skip-link:focus {
  top: var(--space-2);
}
</style>
