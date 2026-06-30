import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { ParsedDataset } from './dataset.ts';
import { analyze, SatorlApiError } from '../../data/satorlApi.ts';
import type { Projection, ProjectionMethod } from '../../data/satorlApi.ts';
import { pcaProjection } from './analysis.ts';
import Scatter2D from './Scatter2D.tsx';

// Keep three.js lazy (preserves the W4 chunk split): the projected 3D view loads on demand.
const Scatter3D = lazy(() => import('./Scatter3D.tsx'));

const MAX_BYTES = 5 * 1024 * 1024; // contract ②: /analyze rejects > 5 MB with 413

const PREFIX: Record<ProjectionMethod, string> = { pca: 'PC', umap: 'UMAP', tsne: 'tSNE' };

// Wrap projection coords in a ParsedDataset so the existing scatters can render them.
function projectionToDataset(base: ParsedDataset, proj: Projection): ParsedDataset {
  const labels = Array.from({ length: proj.n_components }, (_, i) => `${PREFIX[proj.method]}${i + 1}`);
  const numericData: Record<string, number[]> = {};
  labels.forEach((label, i) => { numericData[label] = proj.coords.map((row) => row[i]); });
  return {
    ...base,
    columns: labels,
    numericColumns: labels,
    nonNumericColumns: [],
    rowCount: proj.coords.length,
    numericData,
  };
}

function ProjectedScatter({ dataset, proj }: { dataset: ParsedDataset; proj: Projection }) {
  const pd = useMemo(() => projectionToDataset(dataset, proj), [dataset, proj]);
  const labels = pd.numericColumns;
  if (proj.n_components === 3) {
    return (
      <Suspense fallback={<p className="text-sm italic">Loading 3D view…</p>}>
        <Scatter3D dataset={pd} xCol={labels[0]} yCol={labels[1]} zCol={labels[2]} />
      </Suspense>
    );
  }
  return <Scatter2D dataset={pd} xCol={labels[0]} yCol={labels[1]} />;
}

export default function ProjectionView({ dataset }: { dataset: ParsedDataset }) {
  const [method, setMethod] = useState<ProjectionMethod>('pca');
  const [nComponents, setNComponents] = useState<2 | 3>(2);
  const [standardize, setStandardize] = useState(true);

  const [remoteProj, setRemoteProj] = useState<Projection | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const d = dataset.numericColumns.length;
  const tooFewDims = d < 2;
  const isRemote = method === 'umap' || method === 'tsne';
  const tooBig = dataset.file.size > MAX_BYTES;

  // W6: local PCA.
  const localProj = useMemo(
    () => (method === 'pca' && !tooFewDims
      ? pcaProjection(dataset.numericColumns, dataset.numericData, { nComponents, standardize })
      : null),
    [method, dataset, nComponents, standardize, tooFewDims],
  );

  // W7: UMAP / t-SNE via the deployed /analyze service.
  useEffect(() => {
    if (!isRemote || tooFewDims) { setRemoteProj(null); setApiError(null); setLoading(false); return; }
    if (tooBig) {
      setRemoteProj(null); setLoading(false);
      setApiError('This file is larger than the analysis API allows (5 MB). Use PCA in-browser, or downsample.');
      return;
    }
    let cancelled = false;
    setLoading(true); setApiError(null);
    analyze(dataset.file, { projection: method, n_components: nComponents, standardize })
      .then((res) => { if (!cancelled) setRemoteProj(res.projection); })
      .catch((err) => {
        if (cancelled) return;
        setRemoteProj(null);
        setApiError(err instanceof SatorlApiError ? err.message : 'The analysis request failed.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isRemote, tooBig, tooFewDims, method, dataset, nComponents, standardize]);

  const proj = method === 'pca' ? localProj : remoteProj;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="inline-flex items-center gap-1.5">
          <span className="text-ink/60 dark:text-ink-dark/60">Method</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as ProjectionMethod)}
            className="px-2 py-1 bg-transparent border border-muted dark:border-white/20 rounded-md focus:outline-none focus:border-accent"
          >
            <option value="pca">PCA (in-browser)</option>
            <option value="umap">UMAP (API)</option>
            <option value="tsne">t-SNE (API)</option>
          </select>
        </label>
        <div className="inline-flex gap-1.5">
          {[2, 3].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setNComponents(k as 2 | 3)}
              className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${
                nComponents === k
                  ? 'border-accent bg-accent text-white'
                  : 'border-muted dark:border-white/20 text-ink/70 dark:text-ink-dark/70'
              }`}
            >{k}D</button>
          ))}
        </div>
        <label className="inline-flex items-center gap-1.5">
          <input type="checkbox" checked={standardize} onChange={(e) => setStandardize(e.target.checked)} />
          <span className="text-ink/70 dark:text-ink-dark/70">Standardize</span>
        </label>
      </div>

      {tooFewDims && <p className="text-sm text-ink/60 dark:text-ink-dark/60">Need ≥2 numeric columns to project.</p>}

      {loading && (
        <p className="text-sm italic text-ink/60 dark:text-ink-dark/60">
          Computing on the analysis API… it scales to zero, so the first request after idle can take a few seconds.
        </p>
      )}

      {apiError && <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>}

      {proj && !loading && (
        <>
          <ProjectedScatter dataset={dataset} proj={proj} />
          {proj.explained_variance_ratio && (
            <p className="text-xs text-ink/60 dark:text-ink-dark/60">
              Explained variance: {proj.explained_variance_ratio.map((r, i) => `PC${i + 1} ${(r * 100).toFixed(1)}%`).join(' · ')}
              {' '}(cumulative {(proj.explained_variance_ratio.reduce((s, r) => s + r, 0) * 100).toFixed(1)}%)
              {proj.coords.length < dataset.rowCount &&
                ` · ${dataset.rowCount - proj.coords.length} rows dropped (missing values)`}
            </p>
          )}
        </>
      )}
    </div>
  );
}
