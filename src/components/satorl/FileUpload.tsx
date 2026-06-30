import { useRef, useState } from 'react';
import Papa from 'papaparse';
import type { SatorlSidecar } from '../../data/satorlApi.ts';
import type { ParsedDataset } from './dataset.ts';

interface FileUploadProps {
  onData: (dataset: ParsedDataset) => void;
  onError: (message: string) => void;
}

function isCsv(file: File): boolean {
  return /\.csv$/i.test(file.name) || file.type === 'text/csv';
}

function isJson(file: File): boolean {
  return /\.json$/i.test(file.name) || file.type === 'application/json';
}

async function readSidecar(file: File): Promise<SatorlSidecar | null> {
  try {
    const json = JSON.parse(await file.text());
    if (json && typeof json === 'object' && 'schema_version' in json && 'data' in json) {
      return json as SatorlSidecar;
    }
    return null;
  } catch {
    return null;
  }
}

function buildDataset(
  file: File,
  columns: string[],
  rows: Record<string, unknown>[],
  meta: SatorlSidecar | null,
): ParsedDataset | string {
  if (columns.length === 0) return 'That CSV has no header row the parser could read.';

  const numericColumns: string[] = [];
  const numericData: Record<string, number[]> = {};
  for (const col of columns) {
    const vals: number[] = [];
    let numeric = true;
    let seen = 0;
    for (const row of rows) {
      const v = row[col];
      if (v === null || v === undefined || v === '') { vals.push(NaN); continue; }
      if (typeof v === 'number' && Number.isFinite(v)) { vals.push(v); seen++; }
      else { numeric = false; break; }
    }
    if (numeric && seen > 0) { numericColumns.push(col); numericData[col] = vals; }
  }

  if (numericColumns.length === 0) {
    return 'No numeric columns found — the visualizer needs at least one numeric column to plot.';
  }
  const nonNumericColumns = columns.filter((c) => !numericColumns.includes(c));
  return { fileName: file.name, file, columns, numericColumns, nonNumericColumns, rowCount: rows.length, numericData, meta };
}

export default function FileUpload({ onData, onError }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const csv = list.find(isCsv);
    if (!csv) {
      onError('Please provide a .csv file (you can also include its .meta.json sidecar).');
      return;
    }
    const sidecarFile = list.find(isJson);
    setBusy(true);
    const meta = sidecarFile ? await readSidecar(sidecarFile) : null;
    Papa.parse<Record<string, unknown>>(csv, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        setBusy(false);
        const built = buildDataset(csv, result.meta.fields ?? [], result.data, meta);
        if (typeof built === 'string') onError(built);
        else onData(built);
      },
      error: (err) => {
        setBusy(false);
        onError(`Could not parse the CSV: ${err.message}`);
      },
    });
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); void handleFiles(e.dataTransfer.files); }}
      className={`rounded-md border-2 border-dashed px-6 py-10 text-center transition-colors ${
        dragging ? 'border-accent bg-accent/5' : 'border-muted dark:border-white/20'
      }`}
    >
      <p className="text-sm text-ink/70 dark:text-ink-dark/70">
        {busy ? 'Parsing…' : 'Drag a satorl CSV here, or'}
      </p>
      {!busy && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 px-3 py-1 font-semibold border border-accent text-accent rounded-md hover:bg-accent hover:text-white transition-colors"
        >
          Choose a file
        </button>
      )}
      <p className="mt-3 text-xs text-ink/50 dark:text-ink-dark/50">
        CSV up to ~50k rows. An optional <code>.meta.json</code> sidecar adds axis labels and provenance.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv,.json,application/json"
        multiple
        className="hidden"
        onChange={(e) => { void handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}
