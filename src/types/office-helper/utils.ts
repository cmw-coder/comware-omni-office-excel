import type { CellAddress, RangeAddress } from 'src/types/common';
import { columnIndexToString, columnStringToIndex } from 'src/utils/excel';

export const parseCellAddressString = (address: string) => {
  const match = address.match(/^([A-Z]+)(\d+)$/);
  if (!match?.[1] || !match?.[2]) {
    throw new Error(`Invalid cell address: ${address}`);
  }
  const col = columnStringToIndex(match[1]);
  const row = parseInt(match[2], 10);
  if (isNaN(col) || isNaN(row)) {
    throw new Error(`Invalid cell address: ${address}`);
  }
  return { col, row };
};

export const parseRangeAddressString = (address: string) => {
  const match = address.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!match?.[1] || !match?.[2] || !match?.[3] || !match?.[4]) {
    throw new Error(`Invalid range address: ${address}`);
  }
  const startCol = columnStringToIndex(match[1]);
  const startRow = parseInt(match[2], 10);
  const endCol = columnStringToIndex(match[3]);
  const endRow = parseInt(match[4], 10);
  return {
    startCol,
    startRow,
    endCol,
    endRow,
  };
};

export const stringifyCellAddress = (cellAddress: CellAddress) => {
  return `${columnIndexToString(cellAddress.column)}${cellAddress.row}`;
};

export const stringifyRangeAddress = (rangeAddress: RangeAddress) => {
  return `${stringifyCellAddress(rangeAddress.begin)}:${stringifyCellAddress(rangeAddress.end ?? rangeAddress.begin)}`;
};

export const stringifyRangeAreaAddress = (rangeAreasAddress: RangeAddress[]) => {
  return rangeAreasAddress.map((rangeAddress) => stringifyRangeAddress(rangeAddress)).join(',');
};
