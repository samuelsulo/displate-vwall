<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Poster } from '@/types/poster'
import type { SizeId } from '@/types/wall'
import { dimensionsFor, posterSizes } from '@/utils/sizes'

const props = defineProps<{ poster: Poster }>()
const emit = defineEmits<{ add: [size: SizeId] }>()

const { t } = useI18n()

function label(size: (typeof posterSizes)[number]) {
  const { width, height } = dimensionsFor(size, props.poster.orientation)
  return t('sizes.dimensions', { width, height })
}
</script>

<template>
  <div class="size-picker" role="group" :aria-label="t('sizes.addToWall', { title: poster.title })">
    <button
      v-for="size in posterSizes"
      :key="size.id"
      type="button"
      class="size-picker__button"
      :aria-label="t('sizes.add', { size: size.id, dimensions: label(size) })"
      @click="emit('add', size.id)"
    >
      <span class="size-picker__id">{{ size.id }}</span>
      <span class="size-picker__dimensions">{{ label(size) }}</span>
    </button>
  </div>
</template>

<style scoped>
.size-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-1);
}

.size-picker__button {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 2.75rem;
  padding: var(--space-1) 0;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: transparent;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.size-picker__button:hover {
  background: var(--color-surface-hover);
}

.size-picker__id {
  font-size: var(--fs-sm);
  font-weight: 700;
  line-height: 1.1;
}

.size-picker__dimensions {
  font-size: var(--fs-2xs);
  color: var(--color-text-secondary);
  line-height: 1.1;
}
</style>
