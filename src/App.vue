<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useSettingsStore } from 'stores/settings'
import { onMounted } from 'vue'

const { applyTheme, detectBaseUrl } = useSettingsStore()
const { baseUrl } = storeToRefs(useSettingsStore())

onMounted(() => {
  applyTheme();
  if (!baseUrl.value.length) {
    detectBaseUrl().catch((e) => console.error(e))
  }
})
</script>

<template>
  <router-view />
</template>
