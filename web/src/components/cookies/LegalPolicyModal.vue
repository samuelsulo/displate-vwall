<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import LegalPolicyView from '@/components/cookies/LegalPolicyView.vue'
import { useLegalModal } from '@/composables/useLegalModal'

const { t } = useI18n()
const { openDocument, close } = useLegalModal()

const dialogRef = ref<HTMLElement | null>(null)

watch(openDocument, async (value) => {
  if (!value) return
  await nextTick()
  dialogRef.value?.focus()
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}
</script>

<template>
  <div v-if="openDocument" class="legal-modal__backdrop" @click.self="close" @keydown="onKeydown">
    <div
      ref="dialogRef"
      class="legal-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="t(`legal.${openDocument}.title`)"
      tabindex="-1"
    >
      <LegalPolicyView :document-key="openDocument" />
      <button type="button" class="legal-modal__close" @click="close">
        {{ t('legal.close') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.legal-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: rgb(0 0 0 / 50%);
}

.legal-modal {
  display: flex;
  flex-direction: column;
  width: min(100%, 48rem);
  max-height: 90vh;
  overflow-y: auto;
  border-radius: var(--radius-lg);
  background: var(--color-bg);
}

.legal-modal__close {
  align-self: flex-end;
  margin: 0 var(--space-4) var(--space-4);
  min-height: 2.75rem;
  padding: var(--space-1) var(--space-6);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: transparent;
  cursor: pointer;
}
</style>
