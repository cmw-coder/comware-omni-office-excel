<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

import { useCompletionStore } from 'stores/completion';
import { useSettingsStore } from 'stores/settings';

const { initCompletionStore } = useCompletionStore();
const { applyLocale, applyTheme, detectBaseUrl } = useSettingsStore();
const { serviceUrl } = storeToRefs(useSettingsStore());

onMounted(() => {
  initCompletionStore().catch((e) => console.error(e));
  applyLocale();
  applyTheme();
  if (!serviceUrl.value.length) {
    detectBaseUrl().catch((e) => console.error(e));
  }
});
</script>

<template>
  <router-view />
</template>
