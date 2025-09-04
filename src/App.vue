<script setup lang="ts">
import { onMounted } from 'vue';

import { useCompletionStore } from 'stores/completion';
import { useSettingsStore } from 'stores/settings';

const { initCompletionStore } = useCompletionStore();
const { applyLocale, applyTheme, detectNetworkZone } = useSettingsStore();

onMounted(() => {
  initCompletionStore().catch((e) => console.error(e));
  applyLocale();
  applyTheme();
  detectNetworkZone().catch((e) => console.error(e));
});
</script>

<template>
  <router-view />
</template>
