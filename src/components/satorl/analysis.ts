import type { ColumnSummary, Projection } from '../../data/satorlApi.ts';

function finite(values: number[]): number[] {
  return values.filter((v) => Number.isFinite(v));
}

// Linear-interpolation quantile on a pre-sorted ascending array (numpy/pandas default).
function quantileSorted(sorted: number[], q: number): number {
  const n = sorted.length;
  if (n === 0) return NaN;
  if (n === 1) return sorted[0];
  const pos = (n - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base] + (sorted[base + 1] - sorted[base]) * rest;
}

// Per-column summary matching the API's ColumnSummary (sample std, ddof=1).
export function summaryStats(values: number[]): ColumnSummary {
  const v = finite(values).slice().sort((a, b) => a - b);
  const count = v.length;
  if (count === 0) {
    return { count: 0, mean: NaN, std: NaN, min: NaN, p25: NaN, p50: NaN, p75: NaN, max: NaN };
  }
  const mean = v.reduce((s, x) => s + x, 0) / count;
  const std = count > 1
    ? Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / (count - 1))
    : 0;
  return {
    count,
    mean,
    std,
    min: v[0],
    p25: quantileSorted(v, 0.25),
    p50: quantileSorted(v, 0.5),
    p75: quantileSorted(v, 0.75),
    max: v[count - 1],
  };
}

export function variance(values: number[]): number {
  const v = finite(values);
  const n = v.length;
  if (n < 2) return 0;
  const mean = v.reduce((s, x) => s + x, 0) / n;
  return v.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1);
}

// Numeric columns sorted by descending variance — drives the default axis picks.
export function rankByVariance(
  numericColumns: string[],
  numericData: Record<string, number[]>,
): string[] {
  return [...numericColumns].sort(
    (a, b) => variance(numericData[b]) - variance(numericData[a]),
  );
}

// ---- W5: Pearson correlation matrix (pairwise-complete, mirrors pandas .corr()) ----

function pearson(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let n = 0, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
  for (let i = 0; i < len; i++) {
    const x = a[i], y = b[i];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue; // pairwise-complete
    n++; sa += x; sb += y; saa += x * x; sbb += y * y; sab += x * y;
  }
  if (n < 2) return NaN;
  const cov = sab - (sa * sb) / n;
  const va = saa - (sa * sa) / n;
  const vb = sbb - (sb * sb) / n;
  const denom = Math.sqrt(va * vb);
  return denom === 0 ? NaN : cov / denom;
}

// cols × cols, row/col order == `columns` (the contract-② `correlation` shape).
export function correlationMatrix(
  columns: string[],
  data: Record<string, number[]>,
): number[][] {
  const k = columns.length;
  const m = columns.map(() => new Array<number>(k).fill(NaN));
  for (let i = 0; i < k; i++) {
    m[i][i] = 1;
    for (let j = i + 1; j < k; j++) {
      const r = pearson(data[columns[i]], data[columns[j]]);
      m[i][j] = r; m[j][i] = r;
    }
  }
  return m;
}

// ---- W6: PCA via covariance eigendecomposition (Jacobi) ----

// Symmetric eigendecomposition via cyclic Jacobi rotations. Returns eigenvalues +
// eigenvectors (vectors[k] = k-th eigenvector), sorted by descending eigenvalue.
// d is small here (≤ #numeric columns, ~50), so this is cheap and robust.
function jacobiEigen(
  A: number[][],
  maxSweeps = 100,
  eps = 1e-10,
): { values: number[]; vectors: number[][] } {
  const n = A.length;
  const a = A.map((row) => row.slice());
  const v = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) v[i][i] = 1;

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p][q] * a[p][q];
    if (off < eps) break;
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < eps) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const sgn = theta >= 0 ? 1 : -1;
        const t = sgn / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let i = 0; i < n; i++) { // A·J (column rotation)
          const aip = a[i][p], aiq = a[i][q];
          a[i][p] = c * aip - s * aiq;
          a[i][q] = s * aip + c * aiq;
        }
        for (let i = 0; i < n; i++) { // Jᵀ·(A·J) (row rotation)
          const api = a[p][i], aqi = a[q][i];
          a[p][i] = c * api - s * aqi;
          a[q][i] = s * api + c * aqi;
        }
        for (let i = 0; i < n; i++) { // V·J
          const vip = v[i][p], viq = v[i][q];
          v[i][p] = c * vip - s * viq;
          v[i][q] = s * vip + c * viq;
        }
      }
    }
  }
  const raw = a.map((_, i) => a[i][i]);
  const order = raw.map((_, i) => i).sort((x, y) => raw[y] - raw[x]);
  return {
    values: order.map((i) => raw[i]),
    vectors: order.map((i) => v.map((row) => row[i])),
  };
}

export interface PcaOptions { nComponents: 2 | 3; standardize?: boolean; }

// Returns the contract-② Projection shape (method 'pca'). Equivalent to numpy-SVD PCA
// up to component sign (PCA signs are arbitrary). Rows with any non-finite cell are
// dropped (listwise), so coords.length may be < the dataset row count.
export function pcaProjection(
  columns: string[],
  data: Record<string, number[]>,
  { nComponents, standardize = true }: PcaOptions,
): Projection {
  const d = columns.length;
  const rowCount = d ? data[columns[0]].length : 0;

  const rows: number[][] = [];
  for (let r = 0; r < rowCount; r++) {
    const row = new Array<number>(d);
    let ok = true;
    for (let c = 0; c < d; c++) {
      const val = data[columns[c]][r];
      if (!Number.isFinite(val)) { ok = false; break; }
      row[c] = val;
    }
    if (ok) rows.push(row);
  }
  const n = rows.length;
  const k = Math.min(nComponents, d) as 2 | 3;

  const mean = new Array<number>(d).fill(0);
  for (const row of rows) for (let c = 0; c < d; c++) mean[c] += row[c] / Math.max(1, n);
  const std = new Array<number>(d).fill(1);
  if (standardize) {
    const acc = new Array<number>(d).fill(0);
    for (const row of rows) for (let c = 0; c < d; c++) acc[c] += (row[c] - mean[c]) ** 2;
    for (let c = 0; c < d; c++) {
      const s = Math.sqrt(acc[c] / Math.max(1, n - 1));
      std[c] = s === 0 ? 1 : s;
    }
  }
  const X = rows.map((row) => row.map((val, c) => (val - mean[c]) / std[c]));

  // Covariance dxd = Xᵀ X / (n-1).
  const cov = Array.from({ length: d }, () => new Array<number>(d).fill(0));
  for (const row of X) for (let i = 0; i < d; i++) for (let j = i; j < d; j++) cov[i][j] += row[i] * row[j];
  const denom = Math.max(1, n - 1);
  for (let i = 0; i < d; i++) for (let j = i; j < d; j++) { cov[i][j] /= denom; cov[j][i] = cov[i][j]; }

  const { values, vectors } = jacobiEigen(cov);
  const totalVar = values.reduce((s, val) => s + Math.max(0, val), 0) || 1;

  const coords = X.map((row) => {
    const out = new Array<number>(k).fill(0);
    for (let comp = 0; comp < k; comp++) {
      const vec = vectors[comp];
      let acc = 0;
      for (let c = 0; c < d; c++) acc += row[c] * vec[c];
      out[comp] = acc;
    }
    return out;
  });

  return {
    method: 'pca',
    n_components: k,
    coords,
    explained_variance_ratio: values.slice(0, k).map((val) => Math.max(0, val) / totalVar),
  };
}
