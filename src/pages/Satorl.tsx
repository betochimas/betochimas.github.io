import { useState } from 'react';
import Footer from '../components/Footer';
import FileUpload from '../components/satorl/FileUpload.tsx';
import type { ParsedDataset } from '../components/satorl/dataset.ts';

const chip = 'inline-block px-2 py-0.5 text-xs font-semibold bg-accent/10 text-accent border border-accent/30 rounded';
const chipMuted = 'inline-block px-2 py-0.5 text-xs font-medium border border-muted dark:border-white/20 rounded text-ink/70 dark:text-ink-dark/70';
const label = 'text-xs uppercase tracking-wide text-ink/50 dark:text-ink-dark/50 mb-1';

function sidecarCaption(meta: NonNullable<ParsedDataset['meta']>): string {
  const parts: string[] = [];
  const gen = meta.generator?.name;
  const seed = meta.generator?.seed;
  if (gen) parts.push(gen.charAt(0).toUpperCase() + gen.slice(1));
  if (seed !== null && seed !== undefined) parts.push(`seed ${seed}`);
  return parts.length ? parts.join(', ') : 'sidecar present';
}

function ParsedSummary({ dataset }: { dataset: ParsedDataset }) {
  const { fileName, numericColumns, nonNumericColumns, rowCount, meta } = dataset;
  return (
    <div className="mt-6 border border-muted dark:border-white/15 rounded-md p-4 space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="font-semibold">{fileName}</h2>
        <span className="text-sm text-ink/60 dark:text-ink-dark/60">
          {rowCount.toLocaleString()} rows × {numericColumns.length + nonNumericColumns.length} columns
        </span>
      </div>

      <div>
        <p className={label}>Numeric ({numericColumns.length})</p>
        <div className="flex flex-wrap gap-1.5">
          {numericColumns.map((c) => <span key={c} className={chip}>{c}</span>)}
        </div>
      </div>

      {nonNumericColumns.length > 0 && (
        <div>
          <p className={label}>Non-numeric ({nonNumericColumns.length}) — excluded from plot axes</p>
          <div className="flex flex-wrap gap-1.5">
            {nonNumericColumns.map((c) => <span key={c} className={chipMuted}>{c}</span>)}
          </div>
        </div>
      )}

      <p className="text-sm text-ink/70 dark:text-ink-dark/70">
        {meta ? `Sidecar: ${sidecarCaption(meta)}.` : 'No sidecar — columns inferred from the CSV header.'}
        {' '}Charts arrive in the next slice.
      </p>
    </div>
  );
}

export default function Satorl() {
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <main className="max-w-5xl mx-auto px-6 py-10 min-h-[60vh]">
        <h1 className="text-2xl font-bold tracking-tight">satorl visualizer</h1>
        <p className="mt-2 text-sm text-ink/70 dark:text-ink-dark/70 max-w-2xl">
          Upload a satorl-generated CSV to explore the distribution of its points — per-dimension
          stats, 2D and 3D scatter, correlation, and dimensionality reduction. Everything runs in
          your browser; nothing is uploaded until you opt into a server-side projection.
        </p>

        <div className="mt-6">
          <FileUpload
            onData={(d) => { setDataset(d); setError(null); }}
            onError={(m) => { setError(m); setDataset(null); }}
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {dataset && <ParsedSummary dataset={dataset} />}
      </main>
      <Footer />
    </>
  );
}
