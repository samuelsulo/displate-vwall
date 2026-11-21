<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWall, itemDimensions } from '@/composables/useWall'
import { SNAP_CM } from '@/utils/placement'
import type { WallItem } from '@/types/wall'

const { t } = useI18n()
const wall = useWall()
const { settings, items, selectedUid } = wall

const canvasRef = ref<HTMLElement | null>(null)

interface Drag {
  uid: string
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
  cmPerPx: number
}

let drag: Drag | null = null

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-SNAP_CM, 0],
  ArrowRight: [SNAP_CM, 0],
  ArrowUp: [0, -SNAP_CM],
  ArrowDown: [0, SNAP_CM],
}

/** Everything is drawn with percentages of the wall, so posters keep their real ratio at any width. */
function itemStyle(item: WallItem) {
  const { width, height } = itemDimensions(item)
  return {
    left: `${(item.x / settings.value.width) * 100}%`,
    top: `${(item.y / settings.value.height) * 100}%`,
    width: `${(width / settings.value.width) * 100}%`,
    height: `${(height / settings.value.height) * 100}%`,
  }
}

function itemLabel(item: WallItem) {
  return t('wall.itemLabel', { title: item.title, size: item.size, x: item.x, y: item.y })
}

function onPointerDown(event: PointerEvent, item: WallItem) {
  wall.select(item.uid)
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect || rect.width === 0) return
  drag = {
    uid: item.uid,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: item.x,
    originY: item.y,
    cmPerPx: settings.value.width / rect.width,
  }
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId) return
  wall.moveTo(
    drag.uid,
    drag.originX + (event.clientX - drag.startX) * drag.cmPerPx,
    drag.originY + (event.clientY - drag.startY) * drag.cmPerPx,
  )
}

function endDrag(event: PointerEvent) {
  if (drag && event.pointerId === drag.pointerId) drag = null
}

function onKeydown(event: KeyboardEvent, item: WallItem) {
  const arrow = ARROWS[event.key]
  if (arrow) {
    event.preventDefault()
    wall.moveBy(item.uid, arrow[0], arrow[1])
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    wall.remove(item.uid)
    canvasRef.value?.focus()
  }
}
</script>

<template>
  <div
    ref="canvasRef"
    class="wall-canvas"
    tabindex="-1"
    :style="{
      aspectRatio: `${settings.width} / ${settings.height}`,
      backgroundColor: settings.color,
    }"
    @pointerdown.self="wall.select(null)"
  >
    <p v-if="items.length === 0" class="wall-canvas__empty">{{ t('wall.empty') }}</p>
    <button
      v-for="item in items"
      :key="item.uid"
      type="button"
      class="wall-item"
      :class="{ 'wall-item--selected': item.uid === selectedUid }"
      :style="itemStyle(item)"
      :aria-label="itemLabel(item)"
      :aria-pressed="item.uid === selectedUid"
      @pointerdown="onPointerDown($event, item)"
      @pointermove="onPointerMove"
      @pointerup="endDrag"
      @pointercancel="endDrag"
      @focus="wall.select(item.uid)"
      @keydown="onKeydown($event, item)"
    >
      <img class="wall-item__image" :src="item.image" alt="" draggable="false" />
    </button>
  </div>
</template>

<style scoped>
.wall-canvas {
  position: relative;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  touch-action: pan-y;
}

.wall-canvas__empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  padding: var(--space-4);
  color: var(--color-text-secondary);
  text-align: center;
  pointer-events: none;
}

.wall-item {
  position: absolute;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: 0 2px 8px rgb(0 0 0 / 35%);
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.wall-item:active {
  cursor: grabbing;
}

.wall-item--selected {
  outline: 2px solid var(--color-focus);
  outline-offset: 1px;
}

.wall-item__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
</style>
