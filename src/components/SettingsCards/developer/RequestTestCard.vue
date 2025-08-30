<script setup lang="ts">
import { ref } from 'vue'

import { i18nSubPath } from 'src/utils/common'

const prefix = ref<string>()
const suffix = ref<string>()

const i18n = i18nSubPath('components.SettingsCards.developer.RequestTestCard')
</script>

<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 text-bold">
        {{ i18n('labels.title') }}
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section class="column q-gutter-y-md">
      <q-input
        clearable
        :label="i18n('labels.contextPrefix')"
        outlined
        type="textarea"
        v-model="prefix"
      />
      <q-input
        clearable
        :label="i18n('labels.contextSuffix')"
        outlined
        type="textarea"
        v-model="suffix"
      />
      <q-btn color="primary" :label="i18n('labels.sendRequest')" no-caps />
    </q-card-section>
  </q-card>
</template>

<style scoped></style>
