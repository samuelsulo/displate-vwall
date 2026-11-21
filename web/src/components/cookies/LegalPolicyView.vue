<script setup lang="ts">
/**
 * LegalPolicyView
 *
 * Renders one legal document — Cookie Policy or Privacy Policy — from the
 * `legal.<documentKey>` i18n namespace. One component for both so they never
 * drift into two different layouts. Register it on /cookie-policy and
 * /privacy-policy when the project has a router; render it inside a modal
 * instead when it doesn't (see references/cookie-consent.md, "LegalPolicyView
 * and footer placement").
 *
 * `content` is treated as pre-sanitized, translator-authored markup (headings,
 * paragraphs, lists), never user input — don't wire it to anything
 * user-editable without re-sanitizing. It is still a vue-i18n message, so it
 * must compile: no literal `{`, `}`, `@`, `$` or `|` (an unresolved TODO is
 * plain text such as `<p class="legal-todo">TODO: ...</p>`, never `{{TODO}}`).
 * See "Messages must compile" in references/cookie-consent.md.
 *
 * If the project's Privacy Policy needs facts that are identical in every
 * locale (contact email, controller details, data-processing region,
 * retention periods, last-updated date), this is where they'd be
 * interpolated in: t(`legal.${documentKey}.content`, legalParams), with
 * legalParams read from the project's own data file. See "Legal data points
 * that are identical in every locale" in references/cookie-consent.md before
 * adding that — this template intentionally ships without it.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  documentKey: 'cookiePolicy' | 'privacyPolicy'
}>()

const { t } = useI18n()

const title = computed(() => t(`legal.${props.documentKey}.title`))
const content = computed(() => t(`legal.${props.documentKey}.content`))
</script>

<template>
  <article class="legal-policy">
    <h1 class="legal-policy__title">{{ title }}</h1>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="legal-policy__content" v-html="content" />
  </article>
</template>

<style scoped>
.legal-policy {
  max-width: 48rem;
  margin-inline: auto;
  padding: var(--space-8) var(--space-4);
}

.legal-policy__title {
  margin-bottom: var(--space-6);
  font-family: var(--font-body);
}

.legal-policy__content {
  font-family: var(--font-body);
  line-height: var(--line-height-relaxed);
}

.legal-policy__content :deep(h2) {
  margin-top: var(--space-6);
}

.legal-policy__content :deep(p),
.legal-policy__content :deep(ul) {
  margin-top: var(--space-2);
}

.legal-policy__content :deep(ul) {
  padding-left: 1.25rem;
  list-style: disc;
}

/* An unresolved TODO must be impossible to miss before delivery. */
.legal-policy__content :deep(.legal-todo) {
  padding: var(--space-2) var(--space-4);
  border: 2px dashed currentcolor;
  border-radius: var(--radius-md);
}
</style>
