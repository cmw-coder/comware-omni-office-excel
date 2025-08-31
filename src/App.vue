<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useSettingsStore } from 'stores/settings';
import { onMounted } from 'vue';
import { officeHelper } from 'boot/office';

const { applyLocale, applyTheme, detectBaseUrl } = useSettingsStore();
const { baseUrl, staticRangesMap } = storeToRefs(useSettingsStore());

onMounted(async () => {
  applyLocale();
  applyTheme();
  if (!baseUrl.value.length) {
    detectBaseUrl().catch((e) => console.error(e));
  }

  const fileId = await officeHelper.getFileId();
  officeHelper.staticRanges = fileId ? (staticRangesMap.value[fileId] ?? '') : ''
});
</script>

<template>
  <router-view />
</template>
