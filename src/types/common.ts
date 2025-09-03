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
  current: CellData;
  related: CellData[];
  static: CellData[];
}
