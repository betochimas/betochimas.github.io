import { useEffect, useMemo, useState } from 'react';
import type { ParsedDataset } from './dataset.ts';
import { rankByVariance } from './analysis.ts';

// Page-level axis selection for the 2D/3D scatters. Lifted out of the scatters so
// the correlation heatmap (click a cell → 2D pair) and the 3-slot tray (→ 3D) can
// drive them. Resets to the variance-ranked defaults whenever the dataset changes.
export interface Axes {
  x2d: string; y2d: string;
  x3d: string; y3d: string; z3d: string;
  setX2d: (c: string) => void; setY2d: (c: string) => void;
  setX3d: (c: string) => void; setY3d: (c: string) => void; setZ3d: (c: string) => void;
}

export function useAxes(dataset: ParsedDataset): Axes {
  const ranked = useMemo(
    () => rankByVariance(dataset.numericColumns, dataset.numericData),
    [dataset],
  );
  const [x2d, setX2d] = useState(ranked[0]);
  const [y2d, setY2d] = useState(ranked[1] ?? ranked[0]);
  const [x3d, setX3d] = useState(ranked[0]);
  const [y3d, setY3d] = useState(ranked[1] ?? ranked[0]);
  const [z3d, setZ3d] = useState(ranked[2] ?? ranked[0]);

  useEffect(() => {
    setX2d(ranked[0]); setY2d(ranked[1] ?? ranked[0]);
    setX3d(ranked[0]); setY3d(ranked[1] ?? ranked[0]); setZ3d(ranked[2] ?? ranked[0]);
  }, [ranked]);

  return { x2d, y2d, x3d, y3d, z3d, setX2d, setY2d, setX3d, setY3d, setZ3d };
}
