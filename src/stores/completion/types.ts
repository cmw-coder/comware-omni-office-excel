import type { CellData, CompletionStrategy, CompletionStrategyVersion } from 'src/types/common';

export interface CompletionStrategyFeature {
  version: CompletionStrategyVersion;
  detectRangeAddress: string;
  detectCellDataList: CellData[];
  staticRangeAddress: string;
}

export interface CompletionStrategyDefinition {
  strategy: CompletionStrategy;
  features: CompletionStrategyFeature[];
}
