<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

import { contextManager } from 'boot/context';
import { officeHelper } from 'boot/office';
import { i18nSubPath } from 'src/utils/common';
import { useSettingsStore } from 'stores/settings';
import { ContextMode } from 'src/types/context-manager/types';

const models = [
  {
    label: 'Claude Sonnet 4',
    value: 'anthropic/claude-sonnet-4',
  },
  {
    label: 'DeepSeek V3.1',
    value: 'deepseek/deepseek-chat-v3.1',
  },
  {
    label: 'Gemini 2.5 Pro',
    value: 'google/gemini-2.5-pro',
  },
  {
    label: 'Gemini 2.5 Flash',
    value: 'google/gemini-2.5-flash',
  },
];

const i18n = i18nSubPath('components.SettingsCards.main.CompletionCard');
const { apiToken, model, serviceUrl, staticRangesMap } = storeToRefs(useSettingsStore());

const fileId = ref<string>();

const isGenericMode = computed(() => contextManager.contextMode === ContextMode.generic);
const staticRanges = computed({
  get: () => (fileId.value ? (staticRangesMap.value[fileId.value] ?? '') : ''),
  set: (val: string | undefined) => {
    if (fileId.value) {
      staticRangesMap.value[fileId.value] = val ?? '';
    }
  },
});

onMounted(async () => {
  fileId.value = await officeHelper.getFileId();
});
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
      <q-item v-if="!serviceUrl?.length" tag="label" v-ripple>
        <q-item-section>
          <q-item-label>
            {{ i18n('labels.apiToken') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-input dense input-class="text-right" name="baseUrl" v-model="apiToken" />
        </q-item-section>
      </q-item>
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>
            {{ i18n('labels.model') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-select
            borderless
            dense
            emit-value
            map-options
            name="models"
            :options="models"
            v-model="model"
          />
        </q-item-section>
      </q-item>
      <q-item v-if="isGenericMode" tag="label" v-ripple>
        <q-item-section>
          <q-item-label>
            {{ i18n('labels.staticRanges') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-input
            clearable
            dense
            input-class="text-right"
            name="staticRanges"
            v-model="staticRanges"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped></style>
