import { ref } from 'vue'

export type LegalDocument = 'cookiePolicy' | 'privacyPolicy'

const openDocument = ref<LegalDocument | null>(null)

export function useLegalModal() {
  function open(document: LegalDocument) {
    openDocument.value = document
  }

  function close() {
    openDocument.value = null
  }

  return { openDocument, open, close }
}
