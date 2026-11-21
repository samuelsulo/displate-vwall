<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Poster } from '@/types/poster'

defineProps<{ poster: Poster }>()

const { t } = useI18n()
</script>

<template>
  <li class="poster-card">
    <a
      class="poster-card__link"
      :href="poster.url"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="t('search.viewOnDisplate', { title: poster.title })"
    >
      <img
        class="poster-card__image"
        :class="`poster-card__image--${poster.orientation}`"
        :src="poster.image"
        :alt="poster.title"
        loading="lazy"
        decoding="async"
      />
    </a>
    <p class="poster-card__title">{{ poster.title }}</p>
    <slot name="actions" :poster="poster" />
  </li>
</template>

<style scoped>
.poster-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.poster-card__link {
  display: block;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-surface);
}

.poster-card__image {
  width: 100%;
  object-fit: cover;
  transition: transform var(--duration-fast) var(--ease-out);
}

.poster-card__image--vertical {
  aspect-ratio: 32 / 45;
}

.poster-card__image--horizontal {
  aspect-ratio: 45 / 32;
}

.poster-card__link:hover .poster-card__image {
  transform: scale(1.03);
}

.poster-card__title {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.3;
  overflow-wrap: anywhere;
}
</style>
