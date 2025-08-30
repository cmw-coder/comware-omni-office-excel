<script setup lang="ts">
import { i18nSubPath } from 'src/utils/common'

const routes = [
  {
    label: 'dashboard',
    icon: 'view_quilt',
    available: true,
    route: 'dashboard',
  },
  {
    label: 'settings',
    icon: 'mdi-cog',
    available: true,
    route: 'settings',
  },
]

const i18n = i18nSubPath('layouts.headers.TaskpaneHeader')
</script>

<template>
  <q-header class="bg-primary text-white" height-hint="98">
    <q-tabs align="center" dense>
      <q-route-tab
        v-for="route in routes"
        :key="route.label"
        :disable="!route.available"
        :icon="route.icon"
        :label="i18n(`routes.${route.label}`)"
        no-caps
        :to="route.route"
      />
    </q-tabs>
  </q-header>
</template>

<style scoped></style>
