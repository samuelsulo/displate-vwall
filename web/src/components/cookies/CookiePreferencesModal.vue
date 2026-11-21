<script setup lang="ts">
/**
 * CookiePreferencesModal
 *
 * Granular per-category consent, reopenable at any time from the footer
 * link (see references/cookie-consent.md, rule 3 — withdrawing/changing
 * consent must stay as easy as giving it, not just available on first
 * visit). Unlike CookieConsentBanner, Escape is allowed to close this one:
 * the visitor already has a stored choice, closing without saving just
 * keeps it.
 */
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCookieConsent } from '@/composables/useCookieConsent'

const { t } = useI18n()
const { categories, consent, isPreferencesOpen, closePreferences, savePreferences } =
  useCookieConsent()

const draft = reactive<Record<string, boolean>>({})

function resetDraft() {
  for (const category of categories) {
    draft[category.id] = category.required ? true : consent.value.categories[category.id] === true
  }
}

watch(isPreferencesOpen, async (open) => {
  if (!open) return
  resetDraft()
  await nextTick()
  dialogRef.value?.focus()
})

const dialogRef = ref<HTMLElement | null>(null)

function onSave() {
  savePreferences({ ...draft })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closePreferences()
}

const orderedCategories = computed(() => categories)
</script>

<template>
  <div
    v-if="isPreferencesOpen"
    class="cookie-modal__backdrop"
    @click.self="closePreferences"
    @keydown="onKeydown"
  >
    <div
      ref="dialogRef"
      class="cookie-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
      tabindex="-1"
    >
      <h2 id="cookie-modal-title" class="cookie-modal__title">
        {{ t('cookies.preferences.title') }}
      </h2>

      <ul class="cookie-modal__list">
        <li v-for="category in orderedCategories" :key="category.id" class="cookie-modal__item">
          <div class="cookie-modal__item-text">
            <p class="cookie-modal__item-label">
              {{ t(`cookies.categories.${category.id}.label`) }}
            </p>
            <p class="cookie-modal__item-description">
              {{ t(`cookies.categories.${category.id}.description`) }}
            </p>
          </div>

          <span v-if="category.required" class="cookie-modal__always-active">
            {{ t('cookies.categories.necessary.alwaysActive') }}
          </span>
          <label v-else class="cookie-modal__switch">
            <input
              v-model="draft[category.id]"
              type="checkbox"
              :aria-label="t(`cookies.categories.${category.id}.label`)"
            />
            <span aria-hidden="true" class="cookie-modal__switch-track" />
          </label>
        </li>
      </ul>

      <div class="cookie-modal__actions">
        <button type="button" class="cookie-modal__button" @click="closePreferences">
          {{ t('cookies.preferences.close') }}
        </button>
        <button
          type="button"
          class="cookie-modal__button cookie-modal__button--primary"
          @click="onSave"
        >
          {{ t('cookies.preferences.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cookie-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: rgb(0 0 0 / 45%);
}

.cookie-modal {
  width: min(32rem, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.cookie-modal__title {
  margin: 0 0 var(--space-4);
  font-family: var(--font-body);
  font-size: var(--fs-lg);
}

.cookie-modal__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin: 0 0 var(--space-6);
  padding: 0;
  list-style: none;
}

.cookie-modal__item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding-block-end: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.cookie-modal__item:last-child {
  padding-block-end: 0;
  border-bottom: none;
}

.cookie-modal__item-label {
  margin: 0 0 var(--space-1);
  font-weight: 600;
  font-size: var(--fs-sm);
}

.cookie-modal__item-description {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
}

.cookie-modal__always-active {
  flex-shrink: 0;
  font-size: var(--fs-2xs);
  color: var(--color-text-tertiary);
}

.cookie-modal__switch {
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  width: 2.5rem;
  height: 1.5rem;
}

.cookie-modal__switch input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.cookie-modal__switch-track {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--color-border);
  transition: background-color var(--duration-fast) var(--ease-out);
}

.cookie-modal__switch-track::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: #fff;
  transition: transform var(--duration-fast) var(--ease-out);
}

.cookie-modal__switch input:checked + .cookie-modal__switch-track {
  background: var(--color-accent);
}

.cookie-modal__switch input:checked + .cookie-modal__switch-track::before {
  transform: translateX(1rem);
}

.cookie-modal__switch input:focus-visible + .cookie-modal__switch-track {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.cookie-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.cookie-modal__button {
  padding: var(--space-1) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--fs-sm);
  cursor: pointer;
}

.cookie-modal__button--primary {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-accent-contrast);
}

@media (prefers-reduced-motion: reduce) {
  .cookie-modal__switch-track,
  .cookie-modal__switch-track::before {
    transition: none;
  }
}
</style>
