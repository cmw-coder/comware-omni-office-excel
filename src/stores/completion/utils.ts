import { officeHelper } from 'boot/office';
import { CompletionStrategy } from 'src/types/common';

import { COMPLETION_STRATEGY_DEFINITIONS } from './constants';
import type { CompletionStrategyDefinition } from './types';

export const detectCompletionStrategyAndFeature = async (): Promise<{
  strategy: CompletionStrategy;
  feature?: CompletionStrategyDefinition['features'][number];
}> => {
  for (const completionStrategyDefinition of COMPLETION_STRATEGY_DEFINITIONS) {
    for (const feature of completionStrategyDefinition.features) {
      const currentCellDataList = await officeHelper.retrieveRangesRaw(feature.detectRangeAddress);
      if (currentCellDataList.length === feature.detectCellDataList.length) {
        let match = true;
        for (let i = 0; i < feature.detectCellDataList.length; i++) {
          if (currentCellDataList[i]?.content !== feature.detectCellDataList[i]?.content) {
            match = false;
            break;
          }
        }
        if (match) {
          return {
            strategy: completionStrategyDefinition.strategy,
            feature,
          };
        }
      }
    }
  }
  return {
    strategy: CompletionStrategy.generic,
  };
};
