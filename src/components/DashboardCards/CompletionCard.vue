<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { completionManager } from 'boot/completion';
import { contextManager } from 'boot/context';
import { officeHelper } from 'boot/office';
import { statisticManager } from 'boot/statistic';
import type { CellData } from 'src/types/common';
import { GenerateResult, PromptElements } from 'src/types/completion-manager/types';
import { i18nSubPath } from 'src/utils/common';

const templateId = 'components.DashboardCards.CompletionCard';

const i18n = i18nSubPath(templateId);

const currentStatisticId = ref<string>();
const loading = ref(false);
const generateData = ref('');
const generateResult = ref<GenerateResult>();

const insertCompletion = async () => {
  await officeHelper.setCellContent(generateData.value);
  if (currentStatisticId.value) {
    statisticManager.accept(currentStatisticId.value);
    currentStatisticId.value = undefined;
  }
};

const triggerCompletion = async (address?: string) => {
  loading.value = true;
  const statisticId = statisticManager.begin('');
  let currentCellData: CellData | undefined;
  if (address) {
    const modifiedCellDataList = await officeHelper.retrieveRangesRaw(address);
    if (modifiedCellDataList.length > 1) {
      // TODO: Support multi-cell edit
      console.log('Multiple cells edited, ignore:', { modifiedCellDataList });
      loading.value = false;
      statisticManager.abort(statisticId);
      return;
    }
    currentCellData = modifiedCellDataList[0];
  } else {
    currentCellData = await officeHelper.retrieveCurrentCellData();
  }

  if (!currentCellData) {
    generateData.value = i18n('labels.noNeedToComplete');
    generateResult.value = GenerateResult.Empty;
    statisticManager.abort(statisticId);
    return;
  }

  const context = {
    fileName: await officeHelper.retrieveCurrentFileName(),
    sheetName: await officeHelper.retrieveCurrentSheetName(),
    cells: {
      current: currentCellData,
      related: await contextManager.getRelatedCellDataList(currentCellData.address),
      static: await contextManager.getStaticCellDataList(),
    }
  };
  statisticManager.setContext(statisticId, context);
  const promptElements = new PromptElements(context);
  statisticManager.setElements(statisticId, promptElements);
  const { result, data } = await completionManager.generate(promptElements, !address);
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
  loading.value = false;
};

onMounted(() => {
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
