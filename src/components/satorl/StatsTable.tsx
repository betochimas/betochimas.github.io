import { useMemo } from 'react';
import type { ParsedDataset } from './dataset.ts';
import { summaryStats } from './analysis.ts';

const COLS = ['count', 'mean', 'std', 'min', 'p25', 'p50', 'p75', 'max'] as const;

function fmt(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e6 || abs < 1e-3) return n.toExponential(2);
  return n.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

export default function StatsTable({ dataset }: { dataset: ParsedDataset }) {
  const rows = useMemo(
    () => dataset.numericColumns.map((c) => ({ col: c, s: summaryStats(dataset.numericData[c]) })),
    [dataset],
  );

  return (
    <div className="overflow-x-auto border border-muted dark:border-white/15 rounded-md">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-muted dark:border-white/15 text-left">
            <th className="px-3 py-2 font-semibold">column</th>
            {COLS.map((c) => <th key={c} className="px-3 py-2 font-semibold text-right">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ col, s }) => (
            <tr key={col} className="border-b border-muted/50 dark:border-white/10 last:border-0">
              <td className="px-3 py-1.5 font-medium">{col}</td>
              {COLS.map((c) => (
                <td key={c} className="px-3 py-1.5 text-right tabular-nums">
                  {c === 'count' ? s[c] : fmt(s[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
