import type { ColumnSummary } from '../../data/satorlApi.ts';

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
