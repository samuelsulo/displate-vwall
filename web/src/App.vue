<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main>
    <h1>{{ t('app.name') }}</h1>
    <p>{{ t('app.description') }}</p>
  </main>
</template>
