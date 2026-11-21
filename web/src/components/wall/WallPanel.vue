<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ShoppingList from '@/components/wall/ShoppingList.vue'
import WallCanvas from '@/components/wall/WallCanvas.vue'
import { MAX_WALL_CM, MIN_WALL_CM, useWall } from '@/composables/useWall'
import { dimensionsFor, posterSizes } from '@/utils/sizes'
import type { SizeId } from '@/types/wall'

const { t } = useI18n()
const wall = useWall()
const { settings, items, selectedUid } = wall

const selected = computed(() => items.value.find((item) => item.uid === selectedUid.value))

function onWallSize(side: 'width' | 'height', event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(value)) return
  wall.setWallSize(
    side === 'width' ? value : settings.value.width,
    side === 'height' ? value : settings.value.height,
  )
}

function sizeLabel(id: SizeId) {
  const size = posterSizes.find((item) => item.id === id)!
  const { width, height } = dimensionsFor(size, selected.value?.orientation ?? 'vertical')
  return t('sizes.dimensions', { width, height })
}
</script>

<template>
  <div class="wall-panel">
    <div class="wall-panel__settings">
      <label class="wall-panel__field">
        <span>{{ t('wall.width') }}</span>
        <input
          type="number"
          inputmode="numeric"
          :min="MIN_WALL_CM"
          :max="MAX_WALL_CM"
          step="5"
          :value="settings.width"
          @change="onWallSize('width', $event)"
        />
      </label>
      <label class="wall-panel__field">
        <span>{{ t('wall.height') }}</span>
        <input
          type="number"
          inputmode="numeric"
          :min="MIN_WALL_CM"
          :max="MAX_WALL_CM"
          step="5"
          :value="settings.height"
          @change="onWallSize('height', $event)"
        />
      </label>
      <label class="wall-panel__field">
        <span>{{ t('wall.color') }}</span>
        <input
          type="color"
          class="wall-panel__color"
          :value="settings.color"
          @input="wall.setWallColor(($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>

    <WallCanvas />
    <p class="wall-panel__hint">{{ t('wall.hint') }}</p>

    <section v-if="selected" class="wall-panel__selected" :aria-label="t('wall.selected')">
      <p class="wall-panel__selected-title">{{ selected.title }}</p>
      <div class="wall-panel__sizes" role="group" :aria-label="t('wall.size')">
        <button
          v-for="size in posterSizes"
          :key="size.id"
          type="button"
          class="wall-panel__button"
          :aria-pressed="selected.size === size.id"
          :aria-label="t('wall.setSize', { size: size.id, dimensions: sizeLabel(size.id) })"
          @click="wall.setSize(selected.uid, size.id)"
        >
          {{ size.id }}
        </button>
      </div>
      <div class="wall-panel__actions">
        <button type="button" class="wall-panel__button" @click="wall.bringToFront(selected.uid)">
          {{ t('wall.bringToFront') }}
        </button>
        <button type="button" class="wall-panel__button" @click="wall.remove(selected.uid)">
          {{ t('wall.remove') }}
        </button>
      </div>
    </section>

    <ShoppingList />
  </div>
</template>

<style scoped>
.wall-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-3);
}

.wall-panel__settings {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.wall-panel__field {
  display: grid;
  gap: var(--space-1);
  font-size: var(--fs-sm);
}

.wall-panel__field input {
  min-height: 2.75rem;
  width: 6rem;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
}

.wall-panel__field .wall-panel__color {
  width: 4rem;
  padding: 0.125rem;
}

.wall-panel__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
}

.wall-panel__selected {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.wall-panel__selected-title {
  margin: 0;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.wall-panel__sizes,
.wall-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.wall-panel__button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0 var(--space-4);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: transparent;
  font-weight: 600;
  cursor: pointer;
}

.wall-panel__button[aria-pressed='true'] {
  background: var(--color-text-primary);
  color: var(--color-bg);
}
</style>
