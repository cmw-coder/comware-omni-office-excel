export interface OfficeInfo {
  host: Office.HostType | null;
  platform: Office.PlatformType | null;
}

export type SheetChangedHandler = (
  event: Excel.WorksheetChangedEventArgs,
  worksheet: Excel.Worksheet,
  context: Excel.RequestContext,
) => Promise<void>;

export type SheetSelectionChangedHandler = (
  event:  Excel.WorksheetSelectionChangedEventArgs,
  worksheet: Excel.Worksheet,
  context: Excel.RequestContext,
) => Promise<void>;
