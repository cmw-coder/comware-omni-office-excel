<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { completionManager } from 'boot/completion';
import { officeHelper } from 'boot/office';
import { statisticManager } from 'boot/statistic';
import type { ContentContext } from 'src/types/common';
import { GenerateResult, PromptElements } from 'src/types/completion-manager/types';
import { i18nSubPath } from 'src/utils/common';

const templateId = 'components.DashboardCards.CompletionCard';

const currentStatisticId = ref<string>();
const loading = ref(false);
const generateData = ref('');
const generateResult = ref<GenerateResult>();

const i18n = i18nSubPath(templateId);

const insertCompletion = async () => {
  await officeHelper.setCellContent(generateData.value);
  if (currentStatisticId.value) {
    statisticManager.accept(currentStatisticId.value);
    currentStatisticId.value = undefined;
  }
};

const manualCompletion = async () => {
  loading.value = true;
  const statisticId = statisticManager.begin('');
  const context = await officeHelper.retrieveContext();
  statisticManager.setContext(statisticId, context);
  await triggerCompletion(statisticId, await officeHelper.retrieveContext(), true);
  loading.value = false;
};

const triggerCompletion = async (statisticId: string, context: ContentContext, noCache = false) => {
  const promptElements = new PromptElements(context);
  statisticManager.setElements(statisticId, promptElements);
  const { result, data } = await completionManager.generate(promptElements, noCache);
  console.log({ result, data });
  switch (result) {
    case GenerateResult.Cancel: {
      generateResult.value = result;
      statisticManager.abort(statisticId);
      break;
    }
    case GenerateResult.Empty: {
      generateData.value = i18n('labels.noNeedToComplete');
      generateResult.value = result;
      statisticManager.abort(statisticId);
      break;
    }
    case GenerateResult.Error: {
      generateData.value = data[0] ?? '';
      generateResult.value = result;
      statisticManager.abort(statisticId);
      break;
    }
    case GenerateResult.Success: {
      statisticManager.setCandidates(statisticId, data);
      const candidate = statisticManager.getCurrentCandidate(statisticId);
      if (!candidate) {
        console.warn('No candidate for statisticId:', statisticId);
        statisticManager.abort(statisticId);
      } else if (candidate.content.length) {
        generateData.value = candidate.content;
        generateResult.value = result;
        if (currentStatisticId.value) {
          statisticManager.abort(currentStatisticId.value);
        }
        currentStatisticId.value = statisticId;
      } else {
        generateData.value = i18n('labels.noNeedToComplete');
        generateResult.value = GenerateResult.Empty;
        statisticManager.abort(statisticId);
      }
      break;
    }
  }
};

// TODO: Add unmount event
onMounted(() => {
  officeHelper.addOnSheetChanged(templateId, async (context, worksheet, eventArgs) => {
    if (
      eventArgs.changeType === Excel.DataChangeType.cellDeleted ||
      eventArgs.changeType === Excel.DataChangeType.cellInserted ||
      eventArgs.changeType === Excel.DataChangeType.rangeEdited
    ) {
      const cellDataList = await officeHelper.retrieveRangesRaw(eventArgs.address);
      console.log('Cell data changed:', cellDataList);
    }

    // loading.value = true;
    // const statisticId = statisticManager.begin('');
    // const context = await officeHelper.retrieveContext();
    // statisticManager.setContext(statisticId, context);
    // await triggerCompletion(statisticId, context);
    // loading.value = false;
  });

  // officeHelper.registerOnChange(async (context) => {
  //   loading.value = true;
  //   const statisticId = statisticManager.begin('');
  //   statisticManager.setContext(statisticId, context);
  //   await triggerCompletion(statisticId, context);
  //   loading.value = false;
  // });
  //
  // officeHelper.onAcceptCandidate = () => {
  //   if (
  //     generateResult.value !== GenerateResult.Cancel &&
  //     generateResult.value !== GenerateResult.Success
  //   ) {
  //     return;
  //   }
  //   insertCompletion().catch((error) => console.error(error));
  // };
});

onUnmounted(() => {
  officeHelper.unregisterOnChange();
  officeHelper.onAcceptCandidate = undefined;
});
</script>

<template>
  <q-card>
    <q-card-section
      class="q-gutter-y-sm"
      :class="{
        'text-accent': generateResult === GenerateResult.Empty,
        'text-negative': generateResult === GenerateResult.Error,
      }"
    >
      <div class="row items-center justify-between">
        <div class="text-h6 text-bold">
          {{ i18n('labels.title') }}
        </div>
        <q-btn
          class="q-ml-md"
          color="accent"
          dense
          icon="mdi-refresh"
          :label="i18n('labels.generate')"
          no-caps
          @click="manualCompletion"
        />
      </div>
      <div v-if="!generateData.length" class="text-grey text-italic">
        {{ i18n('labels.noData') }}
      </div>
      <div v-else style="white-space: pre-line">
        {{ generateData }}
      </div>
      <q-btn
        class="full-width"
        color="primary"
        :disable="
          generateResult !== GenerateResult.Cancel && generateResult !== GenerateResult.Success
        "
        :label="i18n('labels.insertCompletion')"
        no-caps
        @click="insertCompletion"
      />
    </q-card-section>
    <q-inner-loading :showing="loading">
      <q-spinner-rings size="50px" color="primary" />
    </q-inner-loading>
  </q-card>
</template>

<style scoped></style>
