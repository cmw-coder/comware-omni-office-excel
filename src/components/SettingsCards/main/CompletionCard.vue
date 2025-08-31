<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';
import { useSettingsStore } from 'stores/settings';
import { officeHelper } from 'boot/office';

const { apiToken, baseUrl, model, staticRangesMap } = storeToRefs(useSettingsStore());

const models = [
  {
    label: 'Qwen3 30B A3B Instruct 2507',
    value: 'qwen/qwen3-30b-a3b-instruct-2507',
  },
  {
    label: 'Qwen3 Coder 30B A3B Instruct',
    value: 'qwen/qwen3-coder-30b-a3b-instruct',
  },
  {
    label: 'Claude Sonnet 4',
    value: 'anthropic/claude-sonnet-4',
  },
  {
    label: 'GPT-5',
    value: 'openai/gpt-5',
  },
  {
    label: 'Gemini 2.5 Pro',
    value: 'google/gemini-2.5-pro',
  },
];

const i18n = i18nSubPath('components.SettingsCards.main.CompletionCard');

const fileId = ref<string>();

const staticRanges = computed({
  get: () => (fileId.value ? (staticRangesMap.value[fileId.value] ?? '') : ''),
  set: (val: string | undefined) => {
    if (fileId.value) {
      staticRangesMap.value[fileId.value] = val ?? '';
      officeHelper.staticRanges = val ?? '';
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
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>
            {{ i18n('labels.serviceUrl') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-input dense input-class="text-right" name="apiToken" v-model="baseUrl" />
        </q-item-section>
      </q-item>
      <q-item tag="label" v-ripple>
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
      <q-item tag="label" v-ripple>
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
