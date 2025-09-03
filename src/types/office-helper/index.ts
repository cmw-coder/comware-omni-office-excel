import { uid } from 'quasar';

import { OFFICE_JS_SCRIPT_TAG } from 'src/constants/common';
import type { ContentContext } from 'src/types/common';

import type { CellData, OfficeInfo, RangeAddress, SheetChangedHandler } from './types';
import { columnIndexToString, columnStringToIndex, stringifyRangeAreaAddress } from './utils';

export class OfficeHelper {
  private _initialized = false;
  private _officeInfo?: OfficeInfo;
  private _onSheetChangedHandlerMap = new Map<string, SheetChangedHandler>();

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

  addOnSheetChanged(id: string, callback: SheetChangedHandler) {
    this._onSheetChangedHandlerMap.set(id, callback);
  }

  registerOnChange(callback: (contentContext: ContentContext) => Promise<void>) {
    if (!this._isAvailable) {
      return false;
    }

    Excel.run(async (context) => {
      const worksheet = context.workbook.worksheets.getActiveWorksheet();

      // 监听单元格内容变更事件
      worksheet.onChanged.add(async (eventArgs) => {
        if (
          eventArgs.changeType === Excel.DataChangeType.cellDeleted ||
          eventArgs.changeType === Excel.DataChangeType.cellInserted ||
          eventArgs.changeType === Excel.DataChangeType.rangeEdited
        ) {
          await callback(await this.retrieveContext());
        }
      });
      // 监听选择变更事件作为补充（当用户切换单元格时也可能表示编辑意图）
      worksheet.onSelectionChanged.add(async () => {
        await callback(await this.retrieveContext());
      });

      await context.sync();
      console.log('[OfficeHelper] Added multiple event handlers for Excel cell operations.');
    }).catch((error) => console.error(error));
  }

  // registerOnChange(callback: (contentContext: ContentContext) => Promise<void>) {
  //   if (!this._isAvailable) {
  //     return false;
  //   }
  //
  //   if (Office.context.requirements.isSetSupported('ExcelApi', '1.7')) {
  //     // 支持 ExcelApi 1.7，使用多种事件监听来捕获更多用户操作
  //     Excel.run(async (context) => {
  //       const worksheet = context.workbook.worksheets.getActiveWorksheet();
  //
  //       // 监听单元格内容变更事件
  //       worksheet.onChanged.add(async (eventArgs) => {
  //         if (
  //           eventArgs.changeType === Excel.DataChangeType.cellDeleted ||
  //           eventArgs.changeType === Excel.DataChangeType.cellInserted ||
  //           eventArgs.changeType === Excel.DataChangeType.rangeEdited
  //         ) {
  //           await callback(await this.retrieveContext());
  //         }
  //       });
  //       // 监听选择变更事件作为补充（当用户切换单元格时也可能表示编辑意图）
  //       worksheet.onSelectionChanged.add(async () => {
  //         await callback(await this.retrieveContext());
  //       });
  //
  //       await context.sync();
  //       console.log('[OfficeHelper] Added multiple event handlers for Excel cell operations.');
  //     }).catch((error) => console.error(error));
  //   } else {
  //     console.warn(
  //       '[OfficeHelper] ExcelApi 1.7 not supported, falling back to selection changed event',
  //     );
  //     Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, () => {
  //       void (async () => {
  //         await callback(await this.retrieveContext());
  //       })();
  //     });
  //   }
  //   return true;
  // }

  unregisterOnChange() {
    if (!this._isAvailable) {
      return false;
    }

    if (Office.context.requirements.isSetSupported('ExcelApi', '1.7')) {
      // ExcelApi 1.7 支持，移除 worksheet 事件处理器
      Excel.run(async (context) => {
        // TODO: 目前 Office.js 没有提供直接移除特定事件处理器的方法
        // const worksheet = context.workbook.worksheets.getActiveWorksheet();
        // worksheet.onChanged.remove();
        // worksheet.onSelectionChanged.remove();
        await context.sync();
        console.log('[OfficeHelper] Removed event handler for content changes in Excel cells.');
      }).catch((error) => console.error(error));
    } else {
      console.warn(
        '[OfficeHelper] ExcelApi 1.7 not supported, removing selection changed event handler',
      );
      Office.context.document.removeHandlerAsync(Office.EventType.DocumentSelectionChanged);
    }
  }

  async retrieveRanges(rangeAreasAddress: RangeAddress[]): Promise<CellData[]> {
    return this.retrieveRangesRaw(stringifyRangeAreaAddress(rangeAreasAddress));
  }

  async retrieveRangesRaw(address: string): Promise<CellData[]> {
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
                  content: cell?.toString() || '',
                })),
              );
            })
            .flat(2);

          console.log('[OfficeHelper] Retrieved ranges:', result);

          resolve(result);
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

  async retrieveContext(): Promise<ContentContext> {
    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const currentSheet = context.workbook.worksheets.getActiveWorksheet();
          const activeCell = context.workbook.getActiveCell();

          // 加载当前激活单元格的地址和内容
          activeCell.load(['address', 'columnIndex', 'rowIndex', 'values']);

          // 获取静态范围（仅当staticRanges不为空时）
          let usedRange;
          if (this.staticRanges) {
            usedRange = currentSheet.getRanges(this.staticRanges);
            usedRange.load(['address', 'values', 'areas']);
          }

          await context.sync();

          // 解析当前单元格地址获取行列信息
          console.log(`Active Cell: (${activeCell.columnIndex}, ${activeCell.rowIndex})`);
          const currentAddress = activeCell.address;
          const match = currentAddress.match(/([A-Z]+)(\d+)/);
          if (!match || !match[1] || !match[2]) {
            throw new Error('Invalid cell address format');
          }

          const currentCol = columnStringToIndex(match[1]);
          const currentRow = parseInt(match[2]);

          // 获取周围距离小于2的单元格内容
          const nearbyAddresses: string[] = [];
          for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
              if (dx === 0 && dy === 0) continue; // 排除当前单元格
              const newRow = currentRow + dy;
              const newCol = currentCol + dx;

              if (newRow > 0 && newCol > 0) {
                const newAddress = columnIndexToString(newCol) + newRow;
                nearbyAddresses.push(newAddress);
              }
            }
          }
          const nearbyCells = nearbyAddresses.map((addr) => {
            const cell = currentSheet.getRange(addr);
            cell.load(['address', 'values']);
            return cell;
          });

          await context.sync();

          // 构建返回结果
          const result: ContentContext = {
            current: {
              address: activeCell.address,
              content: activeCell.values?.[0]?.[0]?.toString() || '',
            },
            relative: [],
            static: [],
          };

          // 填充相对单元格数据
          nearbyCells.forEach((cell) => {
            const cellAddress = cell.address;
            const cellMatch = cellAddress.match(/([A-Z]+)(\d+)/);
            if (cellMatch && cellMatch[1] && cellMatch[2]) {
              const cellCol = columnStringToIndex(cellMatch[1]);
              const cellRow = parseInt(cellMatch[2]);

              result.relative.push({
                address: cellAddress,
                dx: cellCol - currentCol,
                dy: cellRow - currentRow,
                content: cell.values?.[0]?.[0]?.toString() || '',
              });
            }
          });

          // 填充静态范围数据
          if (usedRange) {
            usedRange.areas.load(['address', 'values']);
            await context.sync();

            const staticRangesArray = usedRange.areas.items;
            staticRangesArray.forEach((range) => {
              const rowCount = range.values?.length || 0;
              const colCount = range.values?.[0]?.length || 0;

              for (let row = 0; row < rowCount; row++) {
                for (let col = 0; col < colCount; col++) {
                  const cellValue = range.values?.[row]?.[col];
                  if (cellValue !== null && cellValue !== undefined) {
                    // 计算实际的单元格地址
                    const rangeAddress = range.address;
                    const rangeMatch = rangeAddress.match(/([A-Z]+)(\d+)/);
                    if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
                      const startCol = columnStringToIndex(rangeMatch[1]);
                      const startRow = parseInt(rangeMatch[2]);
                      const actualCol = startCol + col;
                      const actualRow = startRow + row;
                      const actualAddress = columnIndexToString(actualCol) + actualRow;

                      result.static.push({
                        address: actualAddress,
                        content: cellValue.toString(),
                      });
                    }
                  }
                }
              }
            });
          }

          console.log('[OfficeHelper] Retrieved context:', result);

          resolve(result);
        } catch (error) {
          console.warn('[OfficeHelper] Error in retrieveContext:', error);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch((error) => {
        console.warn('[OfficeHelper] Excel.run error:', error);
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
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

        context.workbook.worksheets.items.forEach((sheet) => {
          sheet.onChanged.add(async (eventArgs) => {
            console.log(`[OfficeHelper] Sheet "${sheet.name}" changed:`, { eventArgs });
            // for (const handler of this._onSheetChangedHandlerMap.values()) {
            //   await handler(context, sheet, eventArgs);
            // }
            await context.sync()
          });
        });
        await context.sync();
        resolve();
      }).catch((error) => reject(error instanceof Error ? error : new Error(String(error))));
    });
  }
}
