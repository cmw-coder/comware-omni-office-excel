<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import DarkModeButton from 'components/ThemeButton.vue';
import messages from 'src/i18n';
import { i18nSubPath } from 'src/utils/common';
import { useSettingsStore } from 'stores/settings';

const i18n = i18nSubPath('components.SettingsCards.main.GeneralCard');

const { applyLocale } = useSettingsStore();
const { locale } = storeToRefs(useSettingsStore());

const locales = computed(() => {
  return Object.keys(messages).map((key: string) => ({
    label: i18n(`languages.${key}`),
    value: key,
  }));
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
            {{ i18n('labels.theme') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <dark-mode-button />
        </q-item-section>
      </q-item>
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>
            {{ i18n('labels.language') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-select
            borderless
            dense
            emit-value
            map-options
            name="locales"
            :options="locales"
            v-model="locale"
            @update:model-value="applyLocale"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped></style>
