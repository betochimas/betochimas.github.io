// API client + data-contract mirror for the satorl visualizer demo.
// Canonical client mirror named in Projects/Shared/satorl-integration.md: TS
// interfaces for the CSV sidecar (contract ①) and the POST /analyze response
// (contract ②), plus the fetch wrapper to the deployed FastAPI service.
//
// Base URL comes from VITE_SATORL_API_BASE_URL — deliberately SEPARATE from the
// conflicts demo's VITE_API_BASE_URL so the two demos don't share one endpoint.

const BASE_URL = import.meta.env.VITE_SATORL_API_BASE_URL ?? 'http://localhost:8000';

// ----- Contract ①: the optional *.meta.json sidecar satorl emits -----

export interface SatorlSidecar {
  satorl_version: string;
  schema_version: number;
  created_at: string; // ISO-8601 UTC
  generator: {
    name: string;
    params: Record<string, unknown>;
    seed: number | null;
  };
  data: {
    rows: number;
    columns: string[];
    dtypes: Record<string, string>;
  };
}

// ----- Contract ②: POST /analyze response -----

export interface ColumnSummary {
  count: number;
  mean: number;
  std: number;
  min: number;
  p25: number;
  p50: number;
  p75: number;
  max: number;
}

export type ProjectionMethod = 'pca' | 'umap' | 'tsne';

export interface Projection {
  method: ProjectionMethod;
  n_components: number;
  coords: number[][];                  // rows × n_components
  explained_variance_ratio?: number[]; // pca only; omitted for umap/tsne
}

export interface AnalyzeResponse {
  shape: { rows: number; cols: number };
  columns: string[];             // numeric columns only (axes / stats / corr)
  non_numeric_columns: string[]; // excluded from axes; offered as point color
  summary: Record<string, ColumnSummary>;
  correlation: number[][];       // cols × cols, order matches columns[]
  projection: Projection;
}

export interface AnalyzeOptions {
  projection?: ProjectionMethod; // default 'pca'
  n_components?: 2 | 3;          // default 3
  standardize?: boolean;         // default true
}

// ----- Errors -----

export class SatorlApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'SatorlApiError';
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'The CSV could not be parsed, or an unknown projection was requested.',
  413: 'That file is larger than the analysis API allows (5 MB limit). Use the in-browser view or a smaller file.',
  503: 'A server-side projection dependency (UMAP/t-SNE) is unavailable right now.',
};

// ----- Calls -----

// POST /analyze — options as query params, CSV as a multipart `file` field
// (contract ②). Used in slice W7 for UMAP/t-SNE + large files; the MVP computes
// the same shape in-browser, so this is a drop-in swap.
export async function analyze(file: File, opts: AnalyzeOptions = {}): Promise<AnalyzeResponse> {
  const params = new URLSearchParams();
  if (opts.projection) params.set('projection', opts.projection);
  if (opts.n_components) params.set('n_components', String(opts.n_components));
  if (opts.standardize !== undefined) params.set('standardize', String(opts.standardize));
  const qs = params.toString();

  const body = new FormData();
  body.append('file', file);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/analyze${qs ? `?${qs}` : ''}`, { method: 'POST', body });
  } catch {
    throw new SatorlApiError(0, 'Could not reach the satorl analysis API. It may be asleep or unreachable.');
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const detail = data && (data.detail || data.message);
    throw new SatorlApiError(res.status, detail || STATUS_MESSAGES[res.status] || `Request failed (${res.status})`);
  }
  return data as AnalyzeResponse;
}

// GET /health — liveness check. Service scales to zero, so the first call after
// idle may cold-start.
export async function health(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === 'ok';
  } catch {
    return false;
  }
}
