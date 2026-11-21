<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWall } from '@/composables/useWall'
import { summarize } from '@/utils/summary'

const { t, locale } = useI18n()
const wall = useWall()

const summary = computed(() => summarize(wall.items.value))
const area = computed(() =>
  new Intl.NumberFormat(locale.value, { maximumFractionDigits: 2 }).format(
    summary.value.totalAreaM2,
  ),
)

const isConfirming = ref(false)
const confirmRef = ref<HTMLButtonElement | null>(null)
const clearRef = ref<HTMLButtonElement | null>(null)

async function askToClear() {
  isConfirming.value = true
  await nextTick()
  confirmRef.value?.focus()
}

async function cancel() {
  isConfirming.value = false
  await nextTick()
  clearRef.value?.focus()
}

function confirmClear() {
  wall.clear()
  isConfirming.value = false
}
</script>

<template>
  <section class="shopping-list" aria-labelledby="shopping-list-title">
    <h3 id="shopping-list-title" class="shopping-list__title">{{ t('list.title') }}</h3>

    <p v-if="summary.lines.length === 0" class="shopping-list__empty">{{ t('list.empty') }}</p>

    <template v-else>
      <ul class="shopping-list__items">
        <li v-for="line in summary.lines" :key="line.key" class="shopping-list__item">
          <span class="shopping-list__name">
            <a :href="line.url" target="_blank" rel="noopener noreferrer">{{ line.title }}</a>
            <span class="shopping-list__meta">
              {{ line.size }},
              {{ t('sizes.dimensions', { width: line.width, height: line.height }) }}
            </span>
          </span>
          <span v-if="line.count > 1" class="shopping-list__count">
            {{ t('list.copies', { count: line.count }) }}
          </span>
        </li>
      </ul>

      <p class="shopping-list__total">
        {{ t('list.total', { count: summary.totalPosters, area }) }}
      </p>

      <div
        v-if="isConfirming"
        class="shopping-list__confirm"
        role="alertdialog"
        aria-labelledby="clear-question"
      >
        <p id="clear-question">{{ t('list.confirmQuestion') }}</p>
        <div class="shopping-list__actions">
          <button
            ref="confirmRef"
            type="button"
            class="shopping-list__button shopping-list__button--danger"
            @click="confirmClear"
          >
            {{ t('list.confirmYes') }}
          </button>
          <button type="button" class="shopping-list__button" @click="cancel">
            {{ t('list.cancel') }}
          </button>
        </div>
      </div>
      <button v-else ref="clearRef" type="button" class="shopping-list__button" @click="askToClear">
        {{ t('list.clear') }}
      </button>
    </template>
  </section>
</template>

<style scoped>
.shopping-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.shopping-list__title {
  margin: 0;
  font-size: var(--fs-lg);
}

.shopping-list__empty,
.shopping-list__total {
  margin: 0;
}

.shopping-list__empty {
  color: var(--color-text-secondary);
}

.shopping-list__total {
  font-weight: 600;
}

.shopping-list__items {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.shopping-list__item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}

.shopping-list__name {
  display: grid;
  min-width: 0;
  overflow-wrap: anywhere;
}

.shopping-list__meta {
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
}

.shopping-list__count {
  flex-shrink: 0;
  font-weight: 600;
}

.shopping-list__confirm {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
}

.shopping-list__confirm p {
  margin: 0;
}

.shopping-list__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.shopping-list__button {
  justify-self: start;
  min-height: 2.75rem;
  padding: 0 var(--space-6);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: transparent;
  font-weight: 600;
  cursor: pointer;
}

.shopping-list__button--danger {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-accent-contrast);
}
</style>
