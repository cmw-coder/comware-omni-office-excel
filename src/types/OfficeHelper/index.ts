import { OFFICE_JS_SCRIPT_TAG } from 'src/constants/common';
import type { ContentContext } from 'src/types/common';

import type { OfficeInfo } from './types';
import { columnNumberToString, columnStringToNumber } from './utils';

export class OfficeHelper {
  private _initialized = false;
  private _officeInfo?: OfficeInfo;

  onAcceptCandidate?: (() => void) | undefined;

  async init() {
    if (this._initialized) {
      console.warn('OfficeHelper is already initialized');
      return;
    }

    if (Office) {
      this._officeInfo = await Office.onReady();
      Office.actions.associate('ComwareOmniAcceptCandidate', () => {
        this.onAcceptCandidate?.();
      });
      Office.actions.associate('ComwareOmniHideTaskpane', () => {
        (async () => {
          try {
            await Office.addin.hide().catch((error) => console.log(error));
          } catch (error) {
            console.log(error);
          }
        })().catch((error) => console.log(error));
      });
      Office.actions.associate('ComwareOmniShowTaskpane', () => {
        (async () => {
          try {
            await Office.addin.showAsTaskpane();
          } catch (error) {
            console.log(error);
          }
        })().catch((error) => console.log(error));
      });
    } else {
      console.warn(
        'Office.js is not loaded.\n' +
          'Please make sure it is loaded before calling OfficeHelper.init()\n' +
          `By insert ${OFFICE_JS_SCRIPT_TAG} in your HTML head tag`,
      );
    }

    this._initialized = true;
  }

  get info(): OfficeInfo | undefined {
    return this._officeInfo;
  }

  async insertText(text: string) {
    if (!this._isAvailable()) {
      return false;
    }

    await Word.run(async (context) => {
      const range = context.document.getSelection();
      range.insertText(text, 'End');
      await context.sync();
    });
  }

  private _isAvailable(): boolean {
    return this._initialized && this._officeInfo !== undefined;
  }

  async registerParagraphChangedEvent(
    callback: (contentContext: ContentContext) => Promise<void>,
    staticRanges: string = '',
  ) {
    if (!this._isAvailable()) {
      return false;
    }

    await Word.run(async (context) => {
      context.document.onParagraphChanged.add(async () => {
        await callback(await this.retrieveContext(staticRanges));
      });
      await context.sync();

      console.log('Added event handler for when content is changed in paragraphs.');
    });
  }

  registerSelectionChangedEvent(
    callback: (contentContext: ContentContext) => Promise<void>,
    staticRanges: string = '',
  ) {
    if (!this._isAvailable()) {
      return false;
    }

    Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, () => {
      void (async () => {
        await callback(await this.retrieveContext(staticRanges));
      })();
    });
    return true;
  }

  unregisterSelectionChangedEvent() {
    if (!this._isAvailable()) {
      return false;
    }

    Office.context.document.removeHandlerAsync(Office.EventType.DocumentSelectionChanged);
  }

  async retrieveContext(staticRanges: string = ''): Promise<ContentContext> {
    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const currentSheet = context.workbook.worksheets.getActiveWorksheet();
          const activeCell = context.workbook.getActiveCell();

          // 加载当前激活单元格的地址和内容
          activeCell.load(['address', 'values']);

          // 获取静态范围（仅当staticRanges不为空时）
          let usedRange;
          if (staticRanges) {
            usedRange = currentSheet.getRanges(staticRanges);
            usedRange.load(['address', 'values']);
          }

          await context.sync();

          // 解析当前单元格地址获取行列信息
          const currentAddress = activeCell.address;
          const match = currentAddress.match(/([A-Z]+)(\d+)/);
          if (!match || !match[1] || !match[2]) {
            throw new Error('Invalid cell address format');
          }

          const currentCol = columnStringToNumber(match[1]);
          const currentRow = parseInt(match[2]);

          // 获取周围距离小于2的单元格内容
          const nearbyAddresses: string[] = [];
          for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
              if (dx === 0 && dy === 0) continue; // 排除当前单元格
              const newRow = currentRow + dy;
              const newCol = currentCol + dx;

              if (newRow > 0 && newCol > 0) {
                const newAddress = columnNumberToString(newCol) + newRow;
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
              const cellCol = columnStringToNumber(cellMatch[1]);
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
                      const startCol = columnStringToNumber(rangeMatch[1]);
                      const startRow = parseInt(rangeMatch[2]);
                      const actualCol = startCol + col;
                      const actualRow = startRow + row;
                      const actualAddress = columnNumberToString(actualCol) + actualRow;

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

          console.log('Retrieved context:', result);

          resolve(result);
        } catch (error) {
          console.log('Error in retrieveContext:', error);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }).catch((error) => {
        console.log('Excel.run error:', error);
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }
}
