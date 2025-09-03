import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

import { officeHelper } from 'boot/office';
import { CompletionStrategy } from 'src/types/common';

import type { CompletionStrategyFeature } from './types';
import { detectCompletionStrategyAndFeature } from './utils';

export const useCompletionStore = defineStore(
  'completion',
  () => {
    const completionStrategy = ref<CompletionStrategy>(CompletionStrategy.generic);
    const completionStrategyFeature = ref<CompletionStrategyFeature>();
    const fileId = ref<string>('');
    const staticRangesMap = reactive<Record<string, string>>({});

    const staticRangeAddress = computed({
      get: () => {
        if (completionStrategy.value === CompletionStrategy.generic) {
          return staticRangesMap[fileId.value] ?? '';
        }
        return completionStrategyFeature.value?.staticRangeAddress ?? '';
      },
      set: (value: string) => {
        if (completionStrategy.value === CompletionStrategy.generic) {
          staticRangesMap[fileId.value] = value;
        }
      },
    });

    const initCompletionStore = async () => {
      const { strategy, feature } = await detectCompletionStrategyAndFeature();
      completionStrategy.value = strategy;
      completionStrategyFeature.value = feature;
      fileId.value = await officeHelper.getFileId();
    };

    return {
      completionStrategy,
      staticRangeAddress,
      initCompletionStore,
    };
  },
  {
    persist: {
      pick: ['staticRangesMap'],
    },
  },
);
