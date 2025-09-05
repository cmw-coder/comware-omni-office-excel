<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { completionManager } from 'boot/completion';
import { contextManager } from 'boot/context';
import { officeHelper } from 'boot/office';
import { statisticManager } from 'boot/statistic';
import type { CellData } from 'src/types/common';
import { GenerateResult, PromptElements } from 'src/types/completion-manager/types/common';
import { i18nSubPath } from 'src/utils/common';

const templateId = 'components.DashboardCards.CompletionCard';

const i18n = i18nSubPath(templateId);

const currentStatisticId = ref<string>();
const loading = ref(false);
const generateData = ref('');
const generateResult = ref<GenerateResult>();
const projectId = ref<string>();
const timestamp = ref<string>();
const userId = ref<string>();

const applyCompletion = async () => {
  await officeHelper.setCellContent(generateData.value, true);
  if (currentStatisticId.value) {
    statisticManager.accept(currentStatisticId.value);
    currentStatisticId.value = undefined;
  }
};

const triggerCompletion = async (address?: string) => {
  if (!projectId.value || !timestamp.value || !userId.value) {
    console.warn('No projectId or userId, skip completion');
    return;
  }

  loading.value = true;
  const statisticId = statisticManager.begin(projectId.value);
  let currentCellData: CellData | undefined;
  if (address) {
    console.log({ address });
    const cellCount = await officeHelper.retrieveRangesCellCountRaw(address);
    if (cellCount > 1 || cellCount < 0) {
      // TODO: Support multi-cell edit
      console.log('Multiple cells edited, ignore:', { cellCount });
      statisticManager.abort(statisticId);
      loading.value = false;
      return;
    }
    currentCellData = (await officeHelper.retrieveRangesRaw(address))[0];
  } else {
    currentCellData = await officeHelper.retrieveCurrentCellData();
  }

  if (!currentCellData) {
    generateData.value = i18n('labels.noNeedToComplete');
    generateResult.value = GenerateResult.empty;
    statisticManager.abort(statisticId);
    loading.value = false;
    return;
  }

  const [fileName, sheetName, relatedCellDataList, staticCellDataList] = await Promise.all([
    officeHelper.retrieveCurrentFileName(),
    officeHelper.retrieveCurrentSheetName(),
    contextManager.getRelatedCellDataList(currentCellData.address),
    contextManager.getStaticCellDataList(),
  ]);
  const context = {
    fileName,
    sheetName,
    projectId: projectId.value,
    userId: userId.value,
    timestamp: timestamp.value,
    cells: {
      current: currentCellData,
      related: relatedCellDataList,
      static: staticCellDataList,
    },
  };
  statisticManager.setContext(statisticId, context);

  const promptElements = new PromptElements(context);
  statisticManager.setElements(statisticId, promptElements);

  const { result, data } = await completionManager.generate(promptElements, !address);
  console.log({ result, data });
  switch (result) {
    case GenerateResult.cancel: {
      generateResult.value = result;
      statisticManager.abort(statisticId);
      break;
    }
    case GenerateResult.empty: {
      generateData.value = i18n('labels.noNeedToComplete');
      generateResult.value = result;
      statisticManager.abort(statisticId);
      break;
    }
    case GenerateResult.error: {
      generateData.value = data[0] ?? '';
      generateResult.value = result;
      statisticManager.abort(statisticId);
      break;
    }
    case GenerateResult.success: {
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
        generateResult.value = GenerateResult.empty;
        statisticManager.abort(statisticId);
      }
      break;
    }
  }
  loading.value = false;
};

onMounted(async () => {
  projectId.value = await officeHelper.retrieveProjectId();
  timestamp.value = await officeHelper.retrieveTimestamp();
  userId.value = await officeHelper.retrieveUserId();

  officeHelper.registerOnSheetChanged(templateId, async ({ address, changeType }) => {
    if (
      changeType === Excel.DataChangeType.cellDeleted ||
      changeType === Excel.DataChangeType.cellInserted ||
      changeType === Excel.DataChangeType.rangeEdited
    ) {
      await triggerCompletion(address);
    }
  });
  officeHelper.registerOnSheetSelectionChanged(templateId, async ({ address }) => {
    await triggerCompletion(address);
  });
  officeHelper.onAcceptCandidate = () => {
    if (
      generateResult.value !== GenerateResult.cancel &&
      generateResult.value !== GenerateResult.success
    ) {
      console.warn('No valid completion to accept:', { generateResult: generateResult.value });
      return;
    }
    applyCompletion().catch((err) => console.error('Failed to apply completion:', err));
  };
});

onUnmounted(() => {
  officeHelper.unregisterOnSheetChanged(templateId);
  officeHelper.unregisterOnSheetSelectionChanged(templateId);
  if (currentStatisticId.value) {
    statisticManager.abort(currentStatisticId.value);
    currentStatisticId.value = undefined;
  }
  officeHelper.onAcceptCandidate = undefined;
});
</script>

<template>
  <q-card>
    <q-card-section
      class="q-gutter-y-sm"
      :class="{
        'text-accent': generateResult === GenerateResult.empty,
        'text-negative': generateResult === GenerateResult.error,
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
          @click="triggerCompletion()"
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
          generateResult !== GenerateResult.cancel && generateResult !== GenerateResult.success
        "
        :label="i18n('labels.insertCompletion')"
        no-caps
        @click="applyCompletion"
      />
    </q-card-section>
    <q-inner-loading :showing="loading">
      <q-spinner-rings size="50px" color="primary" />
    </q-inner-loading>
  </q-card>
</template>

<style scoped></style>
