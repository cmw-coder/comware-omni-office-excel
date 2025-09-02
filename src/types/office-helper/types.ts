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

export interface OfficeInfo {
  host: Office.HostType | null;
  platform: Office.PlatformType | null;
}

export type SheetChangedHandler = (
  context: Excel.RequestContext,
  worksheet: Excel.Worksheet,
  eventArgs: Excel.WorksheetChangedEventArgs,
) => Promise<void>;
