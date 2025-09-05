import { uid } from 'quasar';

import type { CellAddress, CellData, RangeAddress } from 'src/types/common';
import { useCompletionStore } from 'stores/completion';

import {
  PROPERTY_FILE_ID_KEY,
  OFFICE_JS_SCRIPT_TAG,
  PROPERTY_USER_ID_KEY,
  PROPERTY_PROJECT_ID_KEY,
  PROPERTY_TIMESTAMP_KEY,
} from './constants';
import type { OfficeInfo, SheetChangedHandler, SheetSelectionChangedHandler } from './types';
import { stringifyRangeAreaAddress } from './utils';

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

  async setCellContent(text: string, insertZeroWidthSpaces = false) {
    if (!this._isAvailable) {
      return false;
    }

    await Excel.run(async (context) => {
      const activeCell = context.workbook.getActiveCell();
      if (insertZeroWidthSpaces) {
        text = '\u200B' + text.split('\n').join('\n\u200B');
      }
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

  async retrieveRangesCellCountRaw(address: string): Promise<number> {
    if (!this._isAvailable) {
      throw new Error('[OfficeHelper](RetrieveRangesCellCountRaw) Instance is not available');
    }

    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const currentSheet = context.workbook.worksheets.getActiveWorksheet();
          const ranges = currentSheet.getRanges(address);
          ranges.load(['address', 'cellCount']);
          await context.sync();

          console.debug(
            '[OfficeHelper](RetrieveRangesCellCountRaw)',
            `Retrieved cell count for "${address}":`,
            ranges.cellCount,
          );

          resolve(ranges.cellCount);
        } catch (error) {
          console.warn(
            '[OfficeHelper](RetrieveRangesCellCountRaw)',
            'Error during "Excel.run":',
            error,
          );
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch((error) => {
        console.error(
          '[OfficeHelper](RetrieveRangesCellCountRaw)',
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
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }

  async retrieveProjectId(): Promise<string> {
    if (!this._isAvailable) {
      throw new Error('[OfficeHelper](RetrieveProjectId) Instance is not available');
    }

    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const customProperties = context.workbook.properties.custom;
          customProperties.load();
          await context.sync();

          let projectId: string;
          try {
            const existingId = customProperties.getItem(PROPERTY_PROJECT_ID_KEY);
            existingId.load('value');
            await context.sync();
            projectId = existingId.value;
          } catch {
            projectId = `TempProject_${uid()}`;
            customProperties.add(PROPERTY_PROJECT_ID_KEY, projectId);
            await context.sync();
            console.warn(
              '[OfficeHelper](retrieveProjectId)',
              `No existing project ID found, generating temporary ID: ${projectId}`,
            );
          }
          resolve(projectId);
        } catch (error) {
          console.error('[OfficeHelper](retrieveProjectId)', 'Error during "Excel.run":', error);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch((error) => {
        console.error(
          '[OfficeHelper](retrieveProjectId)',
          'Uncaught error during "Excel.run":',
          error,
        );
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }

  async retrieveTimestamp(): Promise<string> {
    if (!this._isAvailable) {
      throw new Error('[OfficeHelper](retrieveTimestamp) Instance is not available');
    }

    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const customProperties = context.workbook.properties.custom;
          customProperties.load();
          await context.sync();

          let timestamp: string;
          try {
            const existingTimestamp = customProperties.getItem(PROPERTY_TIMESTAMP_KEY);
            existingTimestamp.load('value');
            await context.sync();
            timestamp = existingTimestamp.value;
          } catch {
            timestamp = new Date().toISOString();
            customProperties.add(PROPERTY_TIMESTAMP_KEY, timestamp);
            await context.sync();
            console.info(
              '[OfficeHelper](retrieveTimestamp)',
              'Created and stored new timestamp:',
              timestamp,
            );
          }
          resolve(timestamp);
        } catch (error) {
          console.error('[OfficeHelper](retrieveTimestamp)', 'Error during "Excel.run":', error);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch((error) => {
        console.error(
          '[OfficeHelper](retrieveTimestamp)',
          'Uncaught error during "Excel.run":',
          error,
        );
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }

  async retrieveUserId(): Promise<string> {
    if (!this._isAvailable) {
      throw new Error('[OfficeHelper](retrieveUserId) Instance is not available');
    }

    return new Promise((resolve) => {
      try {
        // Method 1: Try to get user ID from mailbox profile
        if (Office.context && Office.context.mailbox && Office.context.mailbox.userProfile) {
          const userName =
            Office.context.mailbox.userProfile.displayName ||
            Office.context.mailbox.userProfile.emailAddress ||
            'Unknown';
          console.debug(
            '[OfficeHelper](retrieveUserId)',
            'userName from mailbox:',
            userName,
          );
          resolve(userName);
          return;
        }

        // Method 2: Try to get user ID from custom properties, fallback to document author
        Excel.run(async (context) => {
          try {
            const customProperties = context.workbook.properties.custom;
            customProperties.load();
            await context.sync();

            const userIdProperty = customProperties.getItem(PROPERTY_USER_ID_KEY);
            userIdProperty.load('value');
            await context.sync();

            resolve(userIdProperty.value);
            return;
          } catch (error) {
            console.warn(
              '[OfficeHelper](retrieveUserId)',
              `Error loading custom property "${PROPERTY_USER_ID_KEY}":`,
              error,
            );
          }

          try {
            const docProps = context.workbook.properties;
            docProps.load(['author']);
            await context.sync();

            const userName = docProps.author || 'Unknown';
            console.debug(
              '[OfficeHelper](retrieveUserId)',
              'userName from document author:',
              userName,
            );
            resolve(userName);
          } catch (error) {
            console.warn(
              '[OfficeHelper](retrieveUserId)',
              'Error during Excel.run:',
              error,
            );
            resolve('Unknown');
          }
        }).catch((error) => {
          console.error(
            '[OfficeHelper](retrieveUserId)',
            'Uncaught error during Excel.run:',
            error,
          );
          resolve('Unknown');
        });
      } catch (error) {
        console.error('[OfficeHelper](retrieveUserId)', 'Error getting user name:', error);
        resolve('Unknown');
      }
    });
  }

  async isInCellEditMode(): Promise<boolean> {
    if (!this._isAvailable) {
      return false;
    }

    return new Promise((resolve) => {
      Excel.run(async (context) => {
        try {
          // 尝试获取当前单元格来检测是否处于编辑模式
          const currentCell = context.workbook.getActiveCell();
          currentCell.load(['address']);
          await context.sync();

          // 如果能够成功获取单元格信息，说明不在编辑模式
          resolve(false);
        } catch (error) {
          // 检查是否是单元格编辑模式错误
          if (error instanceof Error && error.message.includes('单元格编辑模式')) {
            console.debug(
              '[OfficeHelper](isInCellEditMode)',
              'Excel is in cell edit mode'
            );
            resolve(true);
          } else {
            // 其他错误，假定不在编辑模式
            console.warn(
              '[OfficeHelper](isInCellEditMode)',
              'Error during cell edit mode check:',
              error
            );
            resolve(false);
          }
        }
      }).catch((error) => {
        // 检查是否是单元格编辑模式错误
        if (error instanceof Error && error.message.includes('单元格编辑模式')) {
          console.debug(
            '[OfficeHelper](isInCellEditMode)',
            'Excel is in cell edit mode'
          );
          resolve(true);
        } else {
          console.error(
            '[OfficeHelper](isInCellEditMode)',
            'Uncaught error during cell edit mode check:',
            error
          );
          resolve(false);
        }
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

        context.workbook.onActivated.add(async () => {
          console.debug(
            '[OfficeHelper](_registryEvents)',
            'Workbook activated - Excel file opened',
          );
          await useCompletionStore().initCompletionStore();
        });

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
