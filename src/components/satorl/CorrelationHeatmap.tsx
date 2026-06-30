import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import type { ParsedDataset } from './dataset.ts';
import { correlationMatrix } from './analysis.ts';
import { useDarkMode } from './useDarkMode.ts';

interface CorrelationHeatmapProps {
  dataset: ParsedDataset;
  onPair: (xCol: string, yCol: string) => void; // cell click → 2D pair
  onPickColumn: (col: string) => void;          // label click → 3D tray
}

export default function CorrelationHeatmap({ dataset, onPair, onPickColumn }: CorrelationHeatmapProps) {
  const cols = dataset.numericColumns;
  const dark = useDarkMode();
  const matrix = useMemo(() => correlationMatrix(cols, dataset.numericData), [cols, dataset]);

  const cell = Math.max(9, Math.min(30, Math.floor(440 / Math.max(1, cols.length))));
  const pad = 104; // room for labels
  const grid = cell * cols.length;

  const color = scaleLinear<string>()
    .domain([-1, 0, 1])
    .range(dark ? ['#60a5fa', '#1f2937', '#f87171'] : ['#1e4f9c', '#eef2f7', '#b91c1c'])
    .clamp(true);

  return (
    <div className="space-y-2">
      <p className="text-xs text-ink/60 dark:text-ink-dark/60">
        Click a cell to plot that pair in 2D · click a row/column label to add it to the 3D tray.
      </p>
      <div className="overflow-auto border border-muted dark:border-white/15 rounded-md p-2">
        <svg width={pad + grid} height={pad + grid} role="img" aria-label="Correlation heatmap">
          {/* column labels (rotated) */}
          {cols.map((c, j) => (
            <text
              key={`cl${c}`}
              transform={`translate(${pad + j * cell + cell / 2}, ${pad - 6}) rotate(-45)`}
              className="fill-ink/70 dark:fill-ink-dark/70 text-[10px] cursor-pointer hover:fill-accent"
              textAnchor="start"
              onClick={() => onPickColumn(c)}
            >{c}</text>
          ))}
          {/* row labels */}
          {cols.map((c, i) => (
            <text
              key={`rl${c}`}
              x={pad - 6}
              y={pad + i * cell + cell / 2}
              dy="0.32em"
              textAnchor="end"
              className="fill-ink/70 dark:fill-ink-dark/70 text-[10px] cursor-pointer hover:fill-accent"
              onClick={() => onPickColumn(c)}
            >{c}</text>
          ))}
          {/* cells */}
          {matrix.map((rowVals, i) =>
            rowVals.map((v, j) => (
              <rect
                key={`${i}-${j}`}
                x={pad + j * cell}
                y={pad + i * cell}
                width={cell - 1}
                height={cell - 1}
                fill={Number.isFinite(v) ? color(v) : 'transparent'}
                className={i === j ? '' : 'cursor-pointer'}
                onClick={i === j ? undefined : () => onPair(cols[i], cols[j])}
              >
                <title>{`${cols[i]} × ${cols[j]}: r = ${Number.isFinite(v) ? v.toFixed(2) : 'n/a'}`}</title>
              </rect>
            )),
          )}
        </svg>
      </div>
    </div>
  );
}
