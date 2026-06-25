import { useEffect, useMemo, useRef, useState } from 'react';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import type { ParsedDataset } from './dataset.ts';
import { rankByVariance } from './analysis.ts';
import { useDarkMode } from './useDarkMode.ts';
import AxisPicker from './AxisPicker.tsx';

const WIDTH = 640;
const HEIGHT = 440;
const M = { top: 12, right: 16, bottom: 40, left: 52 };

export default function Scatter2D({ dataset }: { dataset: ParsedDataset }) {
  const ranked = useMemo(
    () => rankByVariance(dataset.numericColumns, dataset.numericData),
    [dataset],
  );
  const [xCol, setXCol] = useState(ranked[0]);
  const [yCol, setYCol] = useState(ranked[1] ?? ranked[0]);
  useEffect(() => { setXCol(ranked[0]); setYCol(ranked[1] ?? ranked[0]); }, [ranked]);

  const dark = useDarkMode();
  const innerW = WIDTH - M.left - M.right;
  const innerH = HEIGHT - M.top - M.bottom;

  const { xScale, yScale } = useMemo(() => {
    const xd = extent((dataset.numericData[xCol] ?? []).filter(Number.isFinite)) as [number, number];
    const yd = extent((dataset.numericData[yCol] ?? []).filter(Number.isFinite)) as [number, number];
    return {
      xScale: scaleLinear().domain(xd[0] === undefined ? [0, 1] : xd).nice().range([0, innerW]),
      yScale: scaleLinear().domain(yd[0] === undefined ? [0, 1] : yd).nice().range([innerH, 0]),
    };
  }, [dataset, xCol, yCol, innerW, innerH]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerW * dpr;
    canvas.height = innerH * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerW, innerH);
    ctx.fillStyle = dark ? 'rgba(147, 197, 253, 0.55)' : 'rgba(30, 79, 156, 0.5)';
    const xs = dataset.numericData[xCol] ?? [];
    const ys = dataset.numericData[yCol] ?? [];
    const n = Math.min(xs.length, ys.length);
    for (let i = 0; i < n; i++) {
      const xv = xs[i], yv = ys[i];
      if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
      ctx.beginPath();
      ctx.arc(xScale(xv), yScale(yv), 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [dataset, xCol, yCol, xScale, yScale, innerW, innerH, dark]);

  const xTicks = xScale.ticks(6);
  const yTicks = yScale.ticks(6);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-sm">
        <AxisPicker label="X" value={xCol} options={dataset.numericColumns} onChange={setXCol} />
        <AxisPicker label="Y" value={yCol} options={dataset.numericColumns} onChange={setYCol} />
      </div>
      <div className="overflow-x-auto">
        <div className="relative border border-muted dark:border-white/15 rounded-md" style={{ width: WIDTH, height: HEIGHT }}>
          <svg width={WIDTH} height={HEIGHT} className="block">
            <g transform={`translate(${M.left},${M.top})`}>
              <line x1={0} y1={innerH} x2={innerW} y2={innerH} className="stroke-muted dark:stroke-white/20" />
              <line x1={0} y1={0} x2={0} y2={innerH} className="stroke-muted dark:stroke-white/20" />
              {xTicks.map((t) => (
                <g key={`x${t}`} transform={`translate(${xScale(t)},${innerH})`}>
                  <line y2={5} className="stroke-muted dark:stroke-white/20" />
                  <text y={18} textAnchor="middle" className="fill-ink/60 dark:fill-ink-dark/60 text-[10px]">{t}</text>
                </g>
              ))}
              {yTicks.map((t) => (
                <g key={`y${t}`} transform={`translate(0,${yScale(t)})`}>
                  <line x2={-5} className="stroke-muted dark:stroke-white/20" />
                  <text x={-8} dy="0.32em" textAnchor="end" className="fill-ink/60 dark:fill-ink-dark/60 text-[10px]">{t}</text>
                </g>
              ))}
            </g>
          </svg>
          <canvas ref={canvasRef} className="absolute" style={{ left: M.left, top: M.top, width: innerW, height: innerH }} />
        </div>
      </div>
    </div>
  );
}
