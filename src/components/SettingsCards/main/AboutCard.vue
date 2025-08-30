<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { copyToClipboard, useQuasar } from 'quasar'
import { ref } from 'vue'

import PackageJson from 'app/package.json'
import { officeHelper } from 'boot/office'
import { i18nSubPath } from 'src/utils/common'
import { useSettingsStore } from 'stores/settings'

const emit = defineEmits<{
  push: [path: string]
}>()

const { developerMode } = storeToRefs(useSettingsStore())
const { notify } = useQuasar()

const developerModeCounter = ref(0)

const i18n = i18nSubPath('components.SettingsCards.main.AboutCard')

const copyInfo = () => {
  copyToClipboard(JSON.stringify(officeHelper.info))
    .then(() => {
      notify({
        type: 'positive',
        position: 'top',
        timeout: 3000,
        message: i18n('notifications.copySuccess'),
      })
    })
    .catch(() => {
      notify({
        type: 'negative',
        position: 'top',
        timeout: 3000,
        message: i18n('notifications.copyFailed'),
      })
    })
}

const pushDeveloper = () => {
  emit('push', 'developer')
}

const tryEnableDeveloperMode = () => {
  if (developerMode.value) {
    return
  }
  developerModeCounter.value++
  if (developerModeCounter.value >= 3 && developerModeCounter.value < 7) {
    notify({
      type: 'info',
      group: 'developerModeHint',
      message: i18n('notifications.developerModeHint', {
        times: 7 - developerModeCounter.value,
      }),
      icon: 'mdi-dev-to',
    })
  } else if (developerModeCounter.value >= 7) {
    developerModeCounter.value = 0
    developerMode.value = true
    notify({
      type: 'positive',
      message: i18n('notifications.developerModeEnabled'),
      icon: 'mdi-dev-to',
    })
    developerMode.value = true
    pushDeveloper()
  }
}
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
      <q-item clickable v-ripple @click="copyInfo">
        <q-item-section>
          <q-item-label>
            {{ i18n('labels.environment') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row">
            <q-chip icon="mdi-microsoft-office">
              {{ officeHelper.info?.host }}
            </q-chip>
            <q-chip icon="mdi-laptop">
              {{ officeHelper.info?.platform }}
            </q-chip>
          </div>
        </q-item-section>
      </q-item>
      <q-item clickable v-ripple @click="tryEnableDeveloperMode">
        <q-item-section>
          <q-item-label>
            {{ i18n('labels.version') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          {{ PackageJson.version }}
        </q-item-section>
      </q-item>
      <q-item v-if="developerMode" clickable v-ripple @click="pushDeveloper">
        <q-item-section>
          <q-item-label>
            {{ i18n('labels.developerOptions') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="mdi-chevron-right" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped></style>
