<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLocale } from '@/composables/useLocale'

const { t } = useI18n()
const { locale, locales, setLocale } = useLocale()
</script>

<template>
  <header class="app-header">
    <h1 class="app-header__name">{{ t('app.name') }}</h1>
    <div class="app-header__lang" role="group" :aria-label="t('header.language')">
      <button
        v-for="code in locales"
        :key="code"
        type="button"
        class="app-header__lang-btn"
        :aria-pressed="locale === code"
        @click="setLocale(code)"
      >
        {{ code.toUpperCase() }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.app-header__name {
  margin: 0;
  font-size: var(--fs-lg);
  font-weight: 700;
  letter-spacing: -0.01em;
}

.app-header__lang {
  display: flex;
  gap: var(--space-1);
}

.app-header__lang-btn {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: transparent;
  font-size: var(--fs-sm);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.app-header__lang-btn[aria-pressed='true'] {
  background: var(--color-text-primary);
  border-color: var(--color-text-primary);
  color: var(--color-bg);
}
</style>
