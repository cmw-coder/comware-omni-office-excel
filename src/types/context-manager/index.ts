import { officeHelper } from 'boot/office';
import type { CellAddress, CellData } from 'src/types/common';
import { TEST_CASE_CONFIGS } from 'src/types/context-manager/constants';
import { columnStringToIndex } from 'src/utils/excel';
import { useSettingsStore } from 'stores/settings';

import { ContextMode } from './types';

export class ContextManager {
  private _contextMode = ContextMode.generic;
  private _staticRangeAddress = '';

  get contextMode(): ContextMode {
    return this._contextMode;
  }

  set contextMode(mode: ContextMode) {
    this._contextMode = mode;
    switch (this._contextMode) {
      case ContextMode.generic: {
        const settingsStore = useSettingsStore();
        officeHelper
          .getFileId()
          .then(
            (fileId) => (this._staticRangeAddress = settingsStore.staticRangesMap[fileId] ?? ''),
          )
          .catch((error) => {
            console.error(error);
            this._staticRangeAddress = '';
          });
        break;
      }
      case ContextMode.testCase: {
        this._staticRangeAddress = 'A1:S1';
        break;
      }
    }
  }

  async getRelatedCellDataList(currentCellAddress: CellAddress): Promise<CellData[]> {
    let result: CellData[];
    switch (this._contextMode) {
      case ContextMode.generic: {
        result = await officeHelper.retrieveRangeByRectCenterAndAxes(currentCellAddress, 3, 3);
        break;
      }
      case ContextMode.testCase: {
        if (currentCellAddress.column <= TEST_CASE_CONFIGS.v1.dataRange.begin.column) {
          console.info('Editing indexing columns')
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
          console.info('Editing data columns')
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
          console.info('Editing other columns')
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
    return await officeHelper.retrieveRangesRaw(this._staticRangeAddress);
  }
}
