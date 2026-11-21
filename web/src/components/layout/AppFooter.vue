<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CreditsLink from '@/components/ui/CreditsLink.vue'
import Kitsune from '@/components/ui/Kitsune.vue'
import SiteVersion from '@/components/ui/SiteVersion.vue'

const { t } = useI18n()
</script>

<template>
  <footer class="app-footer">
    <p class="app-footer__disclaimer">{{ t('footer.disclaimer') }}</p>
    <div class="app-footer__bottom">
      <p class="app-footer__legal">{{ t('app.name') }} <SiteVersion /></p>
      <div class="app-footer__credits">
        <CreditsLink
          :label="t('footer.credits')"
          :color="'var(--color-text-secondary)'"
          :hover-color="'var(--color-text-primary)'"
        />
        <Kitsune
          :color-light="'var(--color-brand-light)'"
          :color-mid="'var(--color-brand)'"
          :color-dark="'var(--color-brand-dark)'"
          :color-accent="'var(--color-accent)'"
          badge-fill="none"
        />
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
}

.app-footer__disclaimer,
.app-footer__legal {
  margin: 0;
}

.app-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.app-footer__credits {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>
