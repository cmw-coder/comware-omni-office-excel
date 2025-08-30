<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { i18nSubPath } from 'src/utils/common'
import { useSettingsStore } from 'stores/settings'

const { baseUrl, singleParagraph } = storeToRefs(useSettingsStore())

const i18n = i18nSubPath('components.SettingsCards.main.CompletionCard')
</script>

<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 text-bold">
        {{ i18n('labels.title') }}
      </div>
    </q-card-section>
    <q-separator />
    <q-list separator>
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>
            {{ i18n('labels.serviceUrl') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-input dense input-class="text-right" v-model="baseUrl" />
        </q-item-section>
      </q-item>
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>
            {{ i18n('labels.singleParagraph') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-checkbox v-model="singleParagraph" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped></style>
