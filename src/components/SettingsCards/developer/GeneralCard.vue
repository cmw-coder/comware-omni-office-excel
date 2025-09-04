<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { i18nSubPath } from 'src/utils/common';
import { useSettingsStore } from 'stores/settings';

const i18n = i18nSubPath('components.SettingsCards.developer.GeneralCard');

const { developerMode } = storeToRefs(useSettingsStore());
</script>

<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 text-bold">
        {{ i18n('labels.title') }}
      </div>
    </q-card-section>
    <q-separator />
    <q-list>
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>
            {{ i18n('labels.developerMode') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle name="developerMode" v-model="developerMode" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped></style>
