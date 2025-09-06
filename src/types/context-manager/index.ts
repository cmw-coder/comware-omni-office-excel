import { officeHelper } from 'boot/office';
import type { CellAddress, CellData } from 'src/types/common';
import { useCompletionStore } from 'stores/completion';

export class ContextManager {
  async getRelatedCellDataList(currentCellAddress: CellAddress): Promise<CellData[]> {
    // Exclude current cell
    return (await officeHelper.retrieveRangeByRectCenterAndAxes(currentCellAddress, 3, 3)).filter(
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
