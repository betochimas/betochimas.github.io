import { lazy, Suspense, useEffect, useState } from 'react';
import Footer from '../components/Footer';
import FileUpload from '../components/satorl/FileUpload.tsx';
import StatsPanel from '../components/satorl/StatsPanel.tsx';
import Scatter2D from '../components/satorl/Scatter2D.tsx';
import CorrelationHeatmap from '../components/satorl/CorrelationHeatmap.tsx';
import ProjectionView from '../components/satorl/ProjectionView.tsx';
import { useAxes } from '../components/satorl/useAxes.ts';
import type { ParsedDataset } from '../components/satorl/dataset.ts';

// Nested-lazy: three.js downloads only when a 3D view is opened.
const Scatter3D = lazy(() => import('../components/satorl/Scatter3D.tsx'));

const chip = 'inline-block px-2 py-0.5 text-xs font-semibold bg-accent/10 text-accent border border-accent/30 rounded';
const chipMuted = 'inline-block px-2 py-0.5 text-xs font-medium border border-muted dark:border-white/20 rounded text-ink/70 dark:text-ink-dark/70';
const label = 'text-xs uppercase tracking-wide text-ink/50 dark:text-ink-dark/50 mb-1';

type View = 'stats' | 'corr' | '2d' | '3d' | 'projection';
const VIEWS: { id: View; label: string }[] = [
  { id: 'stats', label: 'Stats' },
  { id: 'corr', label: 'Correlation' },
  { id: '2d', label: '2D scatter' },
  { id: '3d', label: '3D scatter' },
  { id: 'projection', label: 'Projection' },
];

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
      </p>
    </div>
  );
}

// The data-bearing portion. Split into its own component (keyed on the dataset in the
// parent) so `useAxes`/tray hooks stay unconditional and reset cleanly on a new upload.
function Workspace({ dataset }: { dataset: ParsedDataset }) {
  const [view, setView] = useState<View>('stats');
  const axes = useAxes(dataset);
  const [tray, setTray] = useState<string[]>([]);

  // Reset the 3D tray when a new dataset loads.
  useEffect(() => { setTray([]); }, [dataset]);

  const plotPair = (x: string, y: string) => { axes.setX2d(x); axes.setY2d(y); setView('2d'); };
  const pickColumn = (c: string) => setTray((t) => (t.includes(c) ? t : [...t, c].slice(-3)));
  const plotTrayIn3D = () => {
    if (tray.length < 3) return;
    axes.setX3d(tray[0]); axes.setY3d(tray[1]); axes.setZ3d(tray[2]);
    setView('3d');
  };

  return (
    <>
      <ParsedSummary dataset={dataset} />

      <div className="mt-6 flex flex-wrap gap-1.5">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={`px-3 py-1 text-sm font-semibold rounded-md border transition-colors ${
              view === v.id
                ? 'border-accent bg-accent text-white'
                : 'border-muted dark:border-white/20 text-ink/70 dark:text-ink-dark/70 hover:border-accent'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {view === 'stats' && <StatsPanel dataset={dataset} />}

        {view === 'corr' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-ink/60 dark:text-ink-dark/60">3D tray:</span>
              {[0, 1, 2].map((i) => (
                <span key={i} className="px-2 py-0.5 min-w-[3rem] text-center border border-muted dark:border-white/20 rounded">
                  {tray[i] ?? '—'}
                </span>
              ))}
              <button
                type="button"
                onClick={plotTrayIn3D}
                disabled={tray.length < 3}
                className="px-2.5 py-1 rounded-md border border-accent text-accent text-xs font-semibold disabled:opacity-40 hover:bg-accent hover:text-white transition-colors"
              >
                Plot in 3D
              </button>
              {tray.length > 0 && (
                <button type="button" onClick={() => setTray([])} className="text-xs text-ink/50 dark:text-ink-dark/50 underline">
                  clear
                </button>
              )}
            </div>
            <CorrelationHeatmap dataset={dataset} onPair={plotPair} onPickColumn={pickColumn} />
          </div>
        )}

        {view === '2d' && (
          <Scatter2D dataset={dataset} xCol={axes.x2d} yCol={axes.y2d}
            onXChange={axes.setX2d} onYChange={axes.setY2d} />
        )}

        {view === '3d' && (
          <Suspense fallback={<p className="text-sm italic">Loading 3D view…</p>}>
            <Scatter3D dataset={dataset} xCol={axes.x3d} yCol={axes.y3d} zCol={axes.z3d}
              onXChange={axes.setX3d} onYChange={axes.setY3d} onZChange={axes.setZ3d} />
          </Suspense>
        )}

        {view === 'projection' && <ProjectionView dataset={dataset} />}
      </div>
    </>
  );
}

export default function Satorl() {
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full">
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

        {dataset && <Workspace key={dataset.fileName} dataset={dataset} />}
      </main>
      <Footer />
    </div>
  );
}
