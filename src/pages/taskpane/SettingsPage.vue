<script setup lang="ts">
import { ref } from 'vue'

import AboutCard from 'components/SettingsCards/main/AboutCard.vue'
import CompletionCard from 'components/SettingsCards/main/CompletionCard.vue'
import RequestTestCard from 'components/SettingsCards/developer/RequestTestCard.vue'
import GeneralCard from 'components/SettingsCards/main/GeneralCard.vue'
import { i18nSubPath } from 'src/utils/common'
import DeveloperModeCard from 'components/SettingsCards/developer/GeneralCard.vue'

const currentTab = ref('main')
const tabStack = ref<string[]>([])

const i18n = i18nSubPath('pages.taskpane.SettingsPage')

const popTab = () => {
  const popped = tabStack.value.pop()
  if (popped) {
    currentTab.value = popped
  }
}

const pushTab = (tab: string) => {
  tabStack.value.push(currentTab.value)
  currentTab.value = tab
}
</script>

<template>
  <q-page class="row">
    <q-tab-panels class="col-grow" v-model="currentTab">
      <q-tab-panel class="q-gutter-y-md" name="main">
        <general-card />
        <completion-card />
        <about-card @push="pushTab" />
      </q-tab-panel>
      <q-tab-panel class="q-gutter-y-md" name="developer">
        <div class="row q-gutter-x-md">
          <q-btn dense flat icon="mdi-chevron-left" round @click="popTab" />
          <div class="text-h5 text-bold">
            {{ i18n('labels.developerOptions') }}
          </div>
        </div>
        <developer-mode-card @pop="popTab" />
        <request-test-card />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<style scoped></style>
