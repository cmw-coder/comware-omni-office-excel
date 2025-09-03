<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

import { useSettingsStore } from 'stores/settings';

const { applyLocale, applyTheme, detectBaseUrl } = useSettingsStore();
const { serviceUrl } = storeToRefs(useSettingsStore());

onMounted(() => {
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
