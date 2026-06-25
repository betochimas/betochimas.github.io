import type { ParsedDataset } from './dataset.ts';
import StatsTable from './StatsTable.tsx';
import Histogram from './Histogram.tsx';

export default function StatsPanel({ dataset }: { dataset: ParsedDataset }) {
  return (
    <div className="space-y-6">
      <StatsTable dataset={dataset} />
      <div>
        <p className="text-xs uppercase tracking-wide text-ink/50 dark:text-ink-dark/50 mb-2">
          Distributions
        </p>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {dataset.numericColumns.map((c) => (
            <Histogram key={c} name={c} values={dataset.numericData[c]} />
          ))}
        </div>
      </div>
    </div>
  );
}
