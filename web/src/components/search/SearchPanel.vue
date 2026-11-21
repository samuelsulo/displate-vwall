<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PosterCard from '@/components/search/PosterCard.vue'
import SizePicker from '@/components/search/SizePicker.vue'
import { usePosterSearch } from '@/composables/usePosterSearch'
import { useWall } from '@/composables/useWall'
import type { Poster } from '@/types/poster'
import type { SizeId } from '@/types/wall'

const { t } = useI18n()
const {
  phrase,
  activePhrase,
  posters,
  total,
  related,
  status,
  failure,
  hasMore,
  isEmpty,
  search,
  loadMore,
  retry,
} = usePosterSearch()

const wall = useWall()
const lastAdded = ref('')

function addToWall(poster: Poster, size: SizeId) {
  wall.addPoster(poster, size)
  lastAdded.value = t('sizes.added', { title: poster.title, size })
}

const isLoading = computed(() => status.value === 'loading')

const errorMessage = computed(() => {
  if (!failure.value) return ''
  if (failure.value.kind === 'rate-limited') {
    return t('search.errorRateLimited', { seconds: failure.value.retryAfterSeconds })
  }
  return failure.value.kind === 'network' ? t('search.errorNetwork') : t('search.errorApi')
})
</script>

<template>
  <div class="search-panel">
    <form class="search-panel__form" role="search" @submit.prevent="search()">
      <label class="sr-only" for="poster-search">{{ t('search.label') }}</label>
      <input
        id="poster-search"
        v-model="phrase"
        class="search-panel__input"
        type="search"
        autocomplete="off"
        :placeholder="t('search.placeholder')"
      />
      <button type="submit" class="search-panel__submit">{{ t('search.submit') }}</button>
    </form>

    <ul v-if="related.length > 0" class="search-panel__chips" :aria-label="t('search.related')">
      <li v-for="chip in related" :key="chip">
        <button type="button" class="search-panel__chip" @click="search(chip)">{{ chip }}</button>
      </li>
    </ul>

    <div class="search-panel__status" aria-live="polite">
      <p v-if="isLoading" role="status">{{ t('search.loading') }}</p>
      <p v-else-if="isEmpty" role="status">{{ t('search.empty', { phrase: activePhrase }) }}</p>
      <p v-else-if="status === 'success'" class="search-panel__count">
        {{ t('search.count', { count: total }) }}
      </p>
    </div>

    <p class="sr-only" aria-live="polite">{{ lastAdded }}</p>

    <div v-if="failure" class="search-panel__error" role="alert">
      <p>{{ errorMessage }}</p>
      <button type="button" class="search-panel__submit" @click="retry()">
        {{ t('search.retry') }}
      </button>
    </div>

    <ul v-if="posters.length > 0" class="search-panel__grid">
      <PosterCard v-for="poster in posters" :key="poster.id" :poster="poster">
        <template #actions="{ poster: item }">
          <SizePicker :poster="item" @add="(size) => addToWall(item, size)" />
        </template>
      </PosterCard>
    </ul>

    <button
      v-if="hasMore || status === 'loading-more'"
      type="button"
      class="search-panel__more"
      :disabled="status === 'loading-more'"
      @click="loadMore()"
    >
      {{ status === 'loading-more' ? t('search.loadingMore') : t('search.loadMore') }}
    </button>
  </div>
</template>

<style scoped>
.search-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
}

.search-panel__form {
  display: flex;
  gap: var(--space-2);
}

.search-panel__input {
  flex: 1;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0 var(--space-4);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: var(--color-bg);
}

.search-panel__submit,
.search-panel__more {
  min-height: 2.75rem;
  padding: 0 var(--space-6);
  border: 1px solid var(--color-text-primary);
  border-radius: var(--radius-pill);
  background: var(--color-text-primary);
  color: var(--color-bg);
  font-weight: 600;
  cursor: pointer;
}

.search-panel__more {
  justify-self: center;
}

.search-panel__more:disabled {
  opacity: 0.6;
  cursor: progress;
}

.search-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.search-panel__chip {
  min-height: 2.25rem;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  font-size: var(--fs-sm);
  cursor: pointer;
}

.search-panel__chip:hover {
  background: var(--color-surface-hover);
}

.search-panel__status p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
}

.search-panel__error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
}

.search-panel__error p {
  margin: 0;
}

.search-panel__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
