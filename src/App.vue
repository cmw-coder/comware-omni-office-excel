<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useSettingsStore } from 'stores/settings';
import { onMounted } from 'vue';

const { applyLocale, applyTheme, detectBaseUrl } = useSettingsStore();
const { baseUrl } = storeToRefs(useSettingsStore());

onMounted(() => {
  applyLocale();
  applyTheme();
  if (!baseUrl.value.length) {
    detectBaseUrl().catch((e) => console.error(e));
  }
});
</script>

<template>
  <router-view />
</template>
