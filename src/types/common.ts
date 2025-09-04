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
  fileName: string; // Excel file name
  sheetName: string; // Worksheet name
  projectId: string; // NV ID
  userId: string; // User ID
  timestamp: string; // Timestamp of the request
  cells: {
    current: CellData; // Current cell being edited
    related: CellData[]; // Cells related to the current cell (e.g., same row or column)
    static: CellData[]; // Static cells that provide context (e.g., headers)
  };
}

export enum CompletionStrategy {
  generic = 'generic',
  testCase = 'testCase',
}

export enum CompletionStrategyVersion {
  v1 = 'v1',
  v2 = 'v2',
}
