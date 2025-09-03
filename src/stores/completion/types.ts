import type { CellData, CompletionStrategy, CompletionStrategyVersion } from 'src/types/common';

export interface CompletionStrategyDefinition {
  strategy: CompletionStrategy;
  features: {
    version: CompletionStrategyVersion;
    rangeAddress: string;
    cellDataList: CellData[];
  }[];
}
