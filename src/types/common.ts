export interface CellAddress {
  column: number;
  row: number;
}

export interface CellData {
  address: CellAddress;
  content: string;
}

export interface RangeAddress {
  begin: CellAddress;
  end?: CellAddress;
}

export interface ContentContext {
  fileName: string;
  sheetName: string;
  cells: {
    current: CellData;
    related: CellData[];
    static: CellData[];
  }
}
