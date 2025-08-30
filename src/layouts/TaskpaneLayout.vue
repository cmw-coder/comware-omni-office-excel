<script setup lang="ts">
import { useQuasar } from 'quasar'

const { screen } = useQuasar()
</script>
<template>
  <q-layout view="hHh lpR fFf">
    <router-view :mobile="screen.lt.md" name="header" />
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
