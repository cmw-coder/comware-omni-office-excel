import { officeHelper } from 'boot/office';
import { CompletionStrategy } from 'src/types/common';

import { COMPLETION_STRATEGY_DEFINITIONS } from './constants';

export const detectCompletionStrategy = async (): Promise<CompletionStrategy> => {
  for (const completionStrategyDefinition of COMPLETION_STRATEGY_DEFINITIONS) {
    for (const feature of completionStrategyDefinition.features) {
      const currentCellDataList = await officeHelper.retrieveRangesRaw(feature.rangeAddress);
      if (currentCellDataList.length === feature.cellDataList.length) {
        let match = true;
        for (let i = 0; i < feature.cellDataList.length; i++) {
          if (currentCellDataList[i]?.content !== feature.cellDataList[i]?.content) {
            match = false;
            break;
          }
        }
        if (match) {
          return completionStrategyDefinition.strategy;
        }
      }
    }
  }
  return CompletionStrategy.generic;
};
