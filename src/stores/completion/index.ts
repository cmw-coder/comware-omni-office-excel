import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

import { officeHelper } from 'boot/office';
import { CompletionStrategy } from 'src/types/common';

import { detectCompletionStrategy } from './utils';

export const useCompletionStore = defineStore(
  'completion',
  () => {
    const completionStrategy = ref<CompletionStrategy>(CompletionStrategy.generic);
    const staticRangesMap = reactive<Record<string, string>>({});
    const staticRangeAddress = ref<string>();

    const initCompletionStore = async () => {
      completionStrategy.value = await detectCompletionStrategy();
      switch (completionStrategy.value) {
        case CompletionStrategy.generic: {
          staticRangeAddress.value = staticRangesMap[await officeHelper.getFileId()];
          break;
        }
        case CompletionStrategy.testCase: {
          staticRangeAddress.value = 'A1:S1';
          break;
        }
      }
    };

    const updateStaticRangeAddress = async (address: string | number | null) => {
      if (completionStrategy.value === CompletionStrategy.generic) {
        staticRangesMap[await officeHelper.getFileId()] = address?.toString() ?? '';
        staticRangeAddress.value = address?.toString() ?? '';
      }
    };
    return {
      completionStrategy,
      staticRangeAddress,
      initCompletionStore,
      updateStaticRangeAddress,
    };
  },
  {
    persist: {
      pick: ['staticRangesMap'],
    },
  },
);
