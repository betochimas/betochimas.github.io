import convex from '@turf/convex';
import { featureCollection, point } from '@turf/helpers';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import type { AtlasBattle, AtlasTheater } from '../../data/conflictsApi';

// Distinct hues for theater outlines — chosen to stand apart from the red battle
// pins and the navy nation borders. Assigned to theaters in sorted-id order so a
// theater keeps its color across re-renders regardless of which ones get a hull.
const THEATER_COLORS = [
  '#0D9488', // teal
  '#7C3AED', // violet
  '#D97706', // amber
  '#0891B2', // cyan
  '#65A30D', // lime
  '#DB2777', // pink
];

export interface TheaterHullProps {
  theaterId: number;
  name: string;
  color: string;
}

// One convex-hull polygon per theater that has >=3 coordinate-bearing battles.
// Theaters with fewer points (or collinear points, where convex() returns null)
// are omitted — their individual battle pins remain as the fallback.
export function theaterHullsGeoJSON(
  theaters: AtlasTheater[],
  battles: AtlasBattle[],
): FeatureCollection<Polygon, TheaterHullProps> {
  const coordById = new Map<number, [number, number]>();
  for (const b of battles) {
    if (b.latitude != null && b.longitude != null) {
      coordById.set(b.id, [b.longitude, b.latitude]);
    }
  }

  const features: Feature<Polygon, TheaterHullProps>[] = [];
  const ordered = [...theaters].sort((a, b) => a.id - b.id);
  ordered.forEach((theater, i) => {
    const pts = theater.battleIds
      .map((id) => coordById.get(id))
      .filter((c): c is [number, number] => c != null)
      .map((c) => point(c));
    if (pts.length < 3) return;
    const hull = convex(featureCollection(pts));
    if (!hull) return;
    features.push({
      type: 'Feature',
      geometry: hull.geometry,
      properties: {
        theaterId: theater.id,
        name: theater.name,
        color: THEATER_COLORS[i % THEATER_COLORS.length],
      },
    });
  });

  return { type: 'FeatureCollection', features };
}
