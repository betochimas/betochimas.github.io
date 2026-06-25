import { useMemo } from 'react';
import { bin as d3bin, max as d3max, extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';

interface HistogramProps {
  name: string;
  values: number[];
  width?: number;
  height?: number;
  bins?: number;
}

export default function Histogram({ name, values, width = 240, height = 130, bins = 20 }: HistogramProps) {
  const margin = { top: 6, right: 8, bottom: 18, left: 8 };
  const w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;

  const bars = useMemo(() => {
    const data = values.filter((v) => Number.isFinite(v));
    if (data.length === 0) return [];
    const [lo, hi] = extent(data) as [number, number];
    const x = scaleLinear().domain([lo, hi]).nice().range([0, w]);
    const buckets = d3bin().domain(x.domain() as [number, number]).thresholds(bins)(data);
    const y = scaleLinear().domain([0, d3max(buckets, (b) => b.length) ?? 0]).range([h, 0]);
    return buckets.map((b) => {
      const x0 = x(b.x0 ?? 0);
      const x1 = x(b.x1 ?? 0);
      return { x: x0, y: y(b.length), width: Math.max(0, x1 - x0 - 1), height: h - y(b.length) };
    });
  }, [values, w, h, bins]);

  return (
    <div className="border border-muted dark:border-white/15 rounded-md p-2">
      <p className="text-xs font-medium truncate mb-1" title={name}>{name}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-accent">
        <g transform={`translate(${margin.left},${margin.top})`} fill="currentColor" fillOpacity={0.75}>
          {bars.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.width} height={b.height} />)}
        </g>
      </svg>
    </div>
  );
}
