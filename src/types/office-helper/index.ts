import { uid } from 'quasar';

import { OFFICE_JS_SCRIPT_TAG } from 'src/constants/common';
import type { CellAddress, CellData, RangeAddress } from 'src/types/common';

import type {
  OfficeInfo,
  SheetChangedHandler,
  SheetSelectionChangedHandler,
} from './types';
import { stringifyRangeAreaAddress } from './utils';

export class OfficeHelper {
  private _initialized = false;
  private _officeInfo?: OfficeInfo;
  private _onSheetChangedHandlerMap = new Map<string, SheetChangedHandler>();
  private _onSheetSelectionChangedHandlerMap = new Map<string, SheetSelectionChangedHandler>();

  onAcceptCandidate?: (() => void) | undefined;
  staticRanges?: string;

  async init() {
    if (this._initialized) {
      console.warn('[OfficeHelper] OfficeHelper is already initialized');
      return;
    }

    if (Office) {
      this._officeInfo = await Office.onReady();
      await this._registryEvents();
      this._associateActions();
      console.log('[OfficeHelper] Office.js is ready:', this._officeInfo);
    } else {
      console.warn(
        '[OfficeHelper] Office.js is not loaded.\n' +
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
            content: currentCell.values?.[0]?.[0]?.toString() || '',
          };
          console.debug('[OfficeHelper](retrieveCurrentCellData) currentCellData: ', {
            address: {
              column: currentCell.columnIndex,
              row: currentCell.rowIndex,
            },
            content: currentCell.values?.[0]?.[0]?.toString() || '',
          });
          resolve(currentCellData);
        } catch (error) {
          console.warn('[OfficeHelper](retrieveCurrentCellData) Error during "Excel.run":', error);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch((error) => {
        console.error(
          '[OfficeHelper](retrieveCurrentCellData) Uncaught error during "Excel.run":',
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
      throw new Error('[OfficeHelper] RetrieveRangesRaw is not available');
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

          console.log(`[OfficeHelper] Retrieved ranges for ${address}:`, result);

          resolve(ignoreEmpty ? result.filter((cellData) => cellData.content.length) : result);
        } catch (error) {
          console.warn('[OfficeHelper] Error in retrieveRanges:', error);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch((error) => {
        console.warn('[OfficeHelper] Excel.run error:', error);
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

  async getFileId(): Promise<string> {
    if (!this._isAvailable) {
      return '';
    }

    try {
      return new Promise((resolve) => {
        Excel.run(async (context) => {
          try {
            const customProperties = context.workbook.properties.custom;
            customProperties.load();
            await context.sync();

            let fileId: string;
            try {
              const existingId = customProperties.getItem('ComwareOmniFileId');
              existingId.load('value');
              await context.sync();
              fileId = existingId.value;
            } catch {
              fileId = uid();
              try {
                customProperties.add('ComwareOmniFileId', fileId);
                await context.sync();
                console.log('[OfficeHelper] Created and stored new file ID:', fileId);
              } catch (setError) {
                console.warn(
                  '[OfficeHelper] Cannot set custom property, using generated ID:',
                  setError,
                );
                // 如果无法设置自定义属性，仍然返回生成的ID
              }
            }

            resolve(fileId);
          } catch (error) {
            console.error('[OfficeHelper] Error getting stable file ID:', error);
            // 如果以上方法都失败，生成一个基于当前时间的临时标识符
            const fallbackId = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;
            console.warn('[OfficeHelper] Using fallback temporary ID:', fallbackId);
            resolve(fallbackId);
          }
        }).catch((error) => {
          console.error('[OfficeHelper] Excel.run error in getCurrentFileId:', error);
          resolve('');
        });
      });
    } catch (error) {
      console.error('[OfficeHelper] Error in getCurrentFileId:', error);
      return '';
    }
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
            console.log(`[OfficeHelper] Sheet "${worksheet.name}" changed:`, { eventArgs: event });
            for (const handler of this._onSheetChangedHandlerMap.values()) {
              await handler(event, worksheet, context);
            }
            await context.sync();
          });
          worksheet.onSelectionChanged.add(async (event) => {
            console.log(`[OfficeHelper] Sheet "${worksheet.name}" selection changed:`, event);
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
