import { officeHelper } from 'boot/office';
import type { CellAddress, CellData } from 'src/types/common';
import { CompletionStrategy } from 'src/types/common';
import { columnStringToIndex } from 'src/utils/excel';
import { useCompletionStore } from 'stores/completion';

import { TEST_CASE_CONFIGS } from './constants';

export class ContextManager {
  async getRelatedCellDataList(currentCellAddress: CellAddress): Promise<CellData[]> {
    const completionStore = useCompletionStore();

    let result: CellData[];
    switch (completionStore.completionStrategy) {
      case CompletionStrategy.general: {
        result = await officeHelper.retrieveRangeByRectCenterAndAxes(currentCellAddress, 3, 3);
        break;
      }
      case CompletionStrategy.testCase: {
        if (currentCellAddress.column <= TEST_CASE_CONFIGS.v1.dataRange.begin.column) {
          console.debug('[ContextManager](getRelatedCellDataList)', 'Editing indexing columns');
          result = await officeHelper.retrieveRanges(
            TEST_CASE_CONFIGS.v1.indexingColumns
              .filter(
                (columnString) => columnStringToIndex(columnString) <= currentCellAddress.column,
              )
              .map((columnString) => ({
                begin: {
                  column: columnStringToIndex(columnString),
                  row: Math.max(currentCellAddress.row - 10, 2),
                },
                end: {
                  column: columnStringToIndex(columnString),
                  row: currentCellAddress.row + 10,
                },
              })),
            true,
          );
        } else if (
          currentCellAddress.column >= TEST_CASE_CONFIGS.v1.dataRange.begin.column &&
          currentCellAddress.column <= TEST_CASE_CONFIGS.v1.dataRange.end.column
        ) {
          console.debug('[ContextManager](getRelatedCellDataList)', 'Editing data columns');
          result = await officeHelper.retrieveRanges(
            [
              {
                begin: {
                  column: TEST_CASE_CONFIGS.v1.dataRange.begin.column,
                  row: Math.max(currentCellAddress.row - 10, 2),
                },
                end: {
                  column: TEST_CASE_CONFIGS.v1.dataRange.end.column,
                  row: currentCellAddress.row + 10,
                },
              },
            ],
            true,
          );
        } else {
          console.debug('[ContextManager](getRelatedCellDataList)', 'Editing other columns');
          result = await officeHelper.retrieveRangeByRectCenterAndAxes(
            currentCellAddress,
            3,
            3,
            true,
          );
        }
        break;
      }
    }

    // Exclude current cell
    return result.filter(
      (cell) =>
        cell.address.column !== currentCellAddress.column ||
        cell.address.row !== currentCellAddress.row,
    );
  }

  async getStaticCellDataList(): Promise<CellData[]> {
    const completionStore = useCompletionStore();

    if (!completionStore.staticRangeAddress?.length) {
      return [];
    }

    return await officeHelper.retrieveRangesRaw(completionStore.staticRangeAddress);
  }
}
