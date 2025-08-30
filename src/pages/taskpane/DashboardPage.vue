<script setup lang="ts">
import CompletionCard from 'components/DashboardCards/CompletionCard.vue'
</script>

<template>
  <q-page class="row">
    <q-tab-panels class="col-grow" model-value="main">
      <q-tab-panel class="q-gutter-y-md" name="main">
        <completion-card />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>
