<script setup lang="ts">
/**
 * SiteVersion
 *
 * Displays the deployed version of the site, injected at build time via the
 * VITE_APP_VERSION environment variable (see the project's deploy script/CI
 * step): a version tag name in production, the deployed commit's short SHA
 * in every other environment. Falls back to "dev" when unset, i.e. a local
 * dev server run where no version is injected.
 */
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const version = import.meta.env.VITE_APP_VERSION || 'dev'
</script>

<template>
  <span class="site-version">{{ t('footer.version', { version }) }}</span>
</template>

<style scoped>
.site-version {
  font-family: var(--font-body);
  font-size: var(--fs-2xs);
  color: var(--color-text-tertiary);
  letter-spacing: var(--ls-wide);
}
</style>
