import { uid } from 'quasar';

import { OFFICE_JS_SCRIPT_TAG } from 'src/constants/common';
import type { CellAddress, CellData, RangeAddress } from 'src/types/common';

import type { OfficeInfo, SheetChangedHandler, SheetSelectionChangedHandler } from './types';
import { stringifyRangeAreaAddress } from './utils';
import { PROPERTY_FILE_ID_KEY } from 'src/types/office-helper/constants';

export class OfficeHelper {
  private _initialized = false;
  private _officeInfo?: OfficeInfo;
  private _onSheetChangedHandlerMap = new Map<string, SheetChangedHandler>();
  private _onSheetSelectionChangedHandlerMap = new Map<string, SheetSelectionChangedHandler>();

  onAcceptCandidate?: (() => void) | undefined;

  async init() {
    if (this._initialized) {
      console.warn('[OfficeHelper](init)', 'Instance is already initialized');
      return;
    }

    if (Office) {
      this._officeInfo = await Office.onReady();
      await this._registryEvents();
      this._associateActions();
      console.log('[OfficeHelper](init)', 'Instance is ready:', this._officeInfo);
    } else {
      console.error(
        '[OfficeHelper](init)',
        '"Office.js" is not loaded.\n' +
          'Please make sure it is loaded before calling OfficeHelper.init()\n' +
          `By insert ${OFFICE_JS_SCRIPT_TAG} in your HTML head tag`,
      );
    }

    this._initialized = true;
  }

  get info(): OfficeInfo | undefined {
    return this._officeInfo;
  }

  async setCellContent(text: string) {
    if (!this._isAvailable) {
      return false;
    }

    await Excel.run(async (context) => {
      const activeCell = context.workbook.getActiveCell();
      activeCell.values = [[text]];
      await context.sync();
    });
  }

  registerOnSheetChanged(id: string, callback: SheetChangedHandler) {
    this._onSheetChangedHandlerMap.set(id, callback);
  }

  unregisterOnSheetChanged(id: string) {
    this._onSheetChangedHandlerMap.delete(id);
  }

  registerOnSheetSelectionChanged(id: string, callback: SheetSelectionChangedHandler) {
    this._onSheetSelectionChangedHandlerMap.set(id, callback);
  }

  unregisterOnSheetSelectionChanged(id: string) {
    this._onSheetSelectionChangedHandlerMap.delete(id);
  }

  async retrieveCurrentCellData(): Promise<CellData> {
    if (!this._isAvailable) {
      throw new Error('[OfficeHelper](retrieveCurrentCellData) Instance is not available');
    }

    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const currentCell = context.workbook.getActiveCell();
          currentCell.load(['address', 'columnIndex', 'rowIndex', 'values']);
          await context.sync();

          const currentCellData = {
            address: {
              column: currentCell.columnIndex,
              row: currentCell.rowIndex,
            },
            content: currentCell.values?.[0]?.[0]?.toString() ?? '',
          };
          console.debug(
            '[OfficeHelper](retrieveCurrentCellData)',
            'currentCellData: ',
            currentCellData,
          );
          resolve(currentCellData);
        } catch (error) {
          console.warn(
            '[OfficeHelper](retrieveCurrentCellData)',
            'Error during "Excel.run":',
            error,
          );
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch((error) => {
        console.error(
          '[OfficeHelper](retrieveCurrentCellData)',
          'Uncaught error during "Excel.run":',
          error,
        );
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }

  async retrieveCurrentFileName(): Promise<string> {
    if (!this._isAvailable) {
      throw new Error('[OfficeHelper](retrieveCurrentFileName) Instance is not available');
    }

    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const workbook = context.workbook;
          workbook.load(['name']);
          await context.sync();

          const fileName = workbook.name;
          console.debug('[OfficeHelper](retrieveCurrentFileName)', 'FileName:', fileName);
          resolve(fileName);
        } catch (error) {
          console.warn(
            '[OfficeHelper](retrieveCurrentFileName)',
            'Error during "Excel.run":',
            error,
          );
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch((error) => {
        console.error(
          '[OfficeHelper](retrieveCurrentFileName)',
          'Uncaught error during "Excel.run":',
          error,
        );
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }

  async retrieveCurrentSheetName(): Promise<string> {
    if (!this._isAvailable) {
      throw new Error('[OfficeHelper](retrieveCurrentSheetName) Instance is not available');
    }

    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const activeWorksheet = context.workbook.worksheets.getActiveWorksheet();
          activeWorksheet.load(['name']);
          await context.sync();

          const sheetName = activeWorksheet.name;
          console.debug('[OfficeHelper](retrieveCurrentSheetName)', 'sheetName:', sheetName);
          resolve(sheetName);
        } catch (error) {
          console.warn(
            '[OfficeHelper](retrieveCurrentSheetName)',
            'Error during "Excel.run":',
            error,
          );
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch((error) => {
        console.error(
          '[OfficeHelper](retrieveCurrentSheetName)',
          'Uncaught error during "Excel.run":',
          error,
        );
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }

  async retrieveRanges(
    rangeAreasAddress: RangeAddress[],
    ignoreEmpty = false,
  ): Promise<CellData[]> {
    return this.retrieveRangesRaw(stringifyRangeAreaAddress(rangeAreasAddress), ignoreEmpty);
  }

  async retrieveRangesRaw(address: string, ignoreEmpty = false): Promise<CellData[]> {
    if (!this._isAvailable) {
      throw new Error('[OfficeHelper](RetrieveRangesRaw) Instance is not available');
    }

    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const currentSheet = context.workbook.worksheets.getActiveWorksheet();
          const ranges = currentSheet.getRanges(address);
          ranges.load(['address', 'values', 'areas']);
          await context.sync();

          const result = ranges.areas.items
            .map((range) => {
              const startCol = range.columnIndex;
              const startRow = range.rowIndex;
              return range.values.map((row, rowIndex) =>
                row.map((cell, cellIndex) => ({
                  address: {
                    column: startCol + cellIndex,
                    row: startRow + rowIndex,
                  },
                  content: cell?.toString() ?? '',
                })),
              );
            })
            .flat(2);

          console.debug(
            '[OfficeHelper](RetrieveRangesRaw)',
            `Retrieved ranges for "${address}":`,
            result,
          );

          resolve(ignoreEmpty ? result.filter((cellData) => cellData.content.length) : result);
        } catch (error) {
          console.warn('[OfficeHelper](RetrieveRangesRaw)', 'Error during "Excel.run":', error);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch((error) => {
        console.error(
          '[OfficeHelper](RetrieveRangesRaw)',
          'Uncaught error during "Excel.run":',
          error,
        );
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }

  async retrieveRangeByRectCenterAndAxes(
    centerCellAddress: CellAddress,
    a: number,
    b: number,
    ignoreEmpty = false,
  ): Promise<CellData[]> {
    a = Math.round(Math.abs(a));
    b = Math.round(Math.abs(b));
    const beginColumnIndex = Math.max(0, centerCellAddress.column - a);
    const beginRowIndex = Math.max(0, centerCellAddress.row - b);
    return await this.retrieveRanges(
      [
        {
          begin: { column: beginColumnIndex, row: beginRowIndex },
          end: { column: centerCellAddress.column + a, row: centerCellAddress.row + b },
        },
      ],
      ignoreEmpty,
    );
  }

  async retrieveFileId(): Promise<string> {
    if (!this._isAvailable) {
      return '';
    }

    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const customProperties = context.workbook.properties.custom;
          customProperties.load();
          await context.sync();

          let fileId: string;
          try {
            const existingId = customProperties.getItem(PROPERTY_FILE_ID_KEY);
            existingId.load('value');
            await context.sync();
            fileId = existingId.value;
          } catch {
            fileId = uid();
            customProperties.add(PROPERTY_FILE_ID_KEY, fileId);
            await context.sync();
            console.info(
              '[OfficeHelper](retrieveFileId)',
              'Created and stored new file ID:',
              fileId,
            );
          }

          resolve(fileId);
        } catch (error) {
          console.error('[OfficeHelper](retrieveFileId)', 'Error during "Excel.run":', error);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch((error) => {
        console.error(
          '[OfficeHelper](retrieveFileId)',
          'Uncaught error during "Excel.run":',
          error,
        );
        resolve('');
      });
    });
  }

  private _associateActions() {
    Office.actions.associate('ComwareOmniAcceptCandidate', () => {
      this.onAcceptCandidate?.();
    });
    Office.actions.associate('ComwareOmniHideTaskpane', () => {
      Office.addin.hide().catch((error) => console.log(error));
    });
    Office.actions.associate('ComwareOmniShowTaskpane', () => {
      Office.addin.showAsTaskpane().catch((error) => console.log(error));
    });
  }

  private get _isAvailable(): boolean {
    return this._initialized && this._officeInfo !== undefined;
  }

  private async _registryEvents() {
    return new Promise<void>((resolve, reject) => {
      Excel.run(async (context) => {
        context.workbook.worksheets.load();
        await context.sync();

        context.workbook.worksheets.items.forEach((worksheet) => {
          worksheet.onChanged.add(async (event) => {
            console.debug(
              '[OfficeHelper](_registryEvents)',
              `Sheet "${worksheet.name}" event "onChanged":`,
              event,
            );
            for (const handler of this._onSheetChangedHandlerMap.values()) {
              await handler(event, worksheet, context);
            }
            await context.sync();
          });
          worksheet.onSelectionChanged.add(async (event) => {
            console.debug(
              '[OfficeHelper](_registryEvents)',
              `Sheet "${worksheet.name}" event "onSelectionChanged":`,
              event,
            );
            for (const handler of this._onSheetSelectionChangedHandlerMap.values()) {
              await handler(event, worksheet, context);
            }
            await context.sync();
          });
        });
        await context.sync();
        resolve();
      }).catch((error) => reject(error instanceof Error ? error : new Error(String(error))));
    });
  }
}
