import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ParsedDataset } from './dataset.ts';
import { rankByVariance } from './analysis.ts';
import { useDarkMode } from './useDarkMode.ts';
import AxisPicker from './AxisPicker.tsx';

const SIZE = 460;

// Normalize finite values to [-1, 1]; NaN / zero-span → 0 (centered).
function normalize(values: number[]): number[] {
  let lo = Infinity, hi = -Infinity;
  for (const v of values) {
    if (Number.isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; }
  }
  const span = hi - lo;
  return values.map((v) => (!Number.isFinite(v) || span === 0 ? 0 : ((v - lo) / span) * 2 - 1));
}

export default function Scatter3D({ dataset }: { dataset: ParsedDataset }) {
  const ranked = useMemo(
    () => rankByVariance(dataset.numericColumns, dataset.numericData),
    [dataset],
  );
  const [xCol, setXCol] = useState(ranked[0]);
  const [yCol, setYCol] = useState(ranked[1] ?? ranked[0]);
  const [zCol, setZCol] = useState(ranked[2] ?? ranked[0]);
  useEffect(() => {
    setXCol(ranked[0]); setYCol(ranked[1] ?? ranked[0]); setZCol(ranked[2] ?? ranked[0]);
  }, [ranked]);

  const dark = useDarkMode();
  const mountRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<THREE.Points | null>(null);

  // Scene lifecycle (once).
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(2.4, 2.0, 2.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AxesHelper(1.2));

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({ size: 0.04, sizeAttenuation: true });
    const points = new THREE.Points(geometry, material);
    pointsRef.current = points;
    scene.add(points);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      pointsRef.current = null;
    };
  }, []);

  // Positions update on axis / dataset change.
  useEffect(() => {
    const points = pointsRef.current;
    if (!points) return;
    const xs = normalize(dataset.numericData[xCol] ?? []);
    const ys = normalize(dataset.numericData[yCol] ?? []);
    const zs = normalize(dataset.numericData[zCol] ?? []);
    const n = Math.min(xs.length, ys.length, zs.length);
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = xs[i];
      arr[i * 3 + 1] = ys[i];
      arr[i * 3 + 2] = zs[i];
    }
    points.geometry.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    points.geometry.computeBoundingSphere();
  }, [dataset, xCol, yCol, zCol]);

  // Recolor on theme change.
  useEffect(() => {
    const points = pointsRef.current;
    if (!points) return;
    (points.material as THREE.PointsMaterial).color.set(dark ? 0x93c5fd : 0x1e4f9c);
  }, [dark]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-sm">
        <AxisPicker label="X" value={xCol} options={dataset.numericColumns} onChange={setXCol} />
        <AxisPicker label="Y" value={yCol} options={dataset.numericColumns} onChange={setYCol} />
        <AxisPicker label="Z" value={zCol} options={dataset.numericColumns} onChange={setZCol} />
      </div>
      <div
        ref={mountRef}
        className="border border-muted dark:border-white/15 rounded-md overflow-hidden"
        style={{ width: SIZE, maxWidth: '100%', height: SIZE }}
      />
      <p className="text-xs text-ink/50 dark:text-ink-dark/50">
        Drag to rotate · scroll to zoom · right-drag to pan. Axes normalized to a unit cube
        (red = X, green = Y, blue = Z).
      </p>
    </div>
  );
}
