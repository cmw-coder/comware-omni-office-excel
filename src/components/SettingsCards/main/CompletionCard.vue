<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import { officeHelper } from 'boot/office';
import { CompletionStrategy } from 'src/types/common';
import { i18nSubPath } from 'src/utils/common';
import { useCompletionStore } from 'stores/completion';
import { useSettingsStore } from 'stores/settings';

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

const { completionStrategy, staticRangeAddress } = storeToRefs(useCompletionStore());
const { apiToken, model, serviceUrl } = storeToRefs(useSettingsStore());

const fileId = ref<string>();

onMounted(async () => {
  fileId.value = await officeHelper.retrieveFileId();
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
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>
            {{ i18n('labels.staticRanges') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-input
            v-if="completionStrategy === CompletionStrategy.generic"
            clearable
            dense
            input-class="text-right"
            name="staticRanges"
            v-model="staticRangeAddress"
          />
          <div v-else class="row items-center q-gutter-x-sm">
            <div>
              {{ staticRangeAddress }}
            </div>
            <q-icon name="help_outline" size="sm">
              <q-tooltip>
                {{ i18n('tooltips.whyCannotEditStaticRanges') }}
              </q-tooltip>
            </q-icon>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped></style>
