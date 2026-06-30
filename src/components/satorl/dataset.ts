import type { SatorlSidecar } from '../../data/satorlApi.ts';

// The browser-side parsed dataset that drives the visualizer. Numeric data is
// column-major (one array per numeric column; NaN for blank cells).
export interface ParsedDataset {
  fileName: string;
  file: File;                  // the original CSV, for the /analyze upload (W7)
  columns: string[];           // all columns, CSV order
  numericColumns: string[];    // columns that parsed as finite numbers
  nonNumericColumns: string[]; // excluded from axes; offered as point color later
  rowCount: number;
  numericData: Record<string, number[]>;
  meta: SatorlSidecar | null;  // sidecar enrichment; null when absent
}
