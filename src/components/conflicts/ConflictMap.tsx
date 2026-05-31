import { useEffect, useRef, useState } from 'react';
import {
  Map as MapLibreMap,
  NavigationControl,
  LngLatBounds,
} from 'maplibre-gl';
import type {
  StyleSpecification,
  GeoJSONSource,
  CircleLayerSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection, Point } from 'geojson';
import type { AtlasBattle } from '../../data/conflictsApi';

// ---------------------------------------------------------------------------
// Base style — CARTO raster basemaps. No API key, free with attribution.
// "Positron" (light) / "Dark Matter" (dark) are deliberately muted and grey,
// which reads as a restrained, almost-historical look and lets the battle pins
// carry the color. The map follows the site's light/dark theme.
// (Borders + theater hulls land in F3/F4; this slice is base + pins only.)
// ---------------------------------------------------------------------------

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
  '&copy; <a href="https://carto.com/attributions">CARTO</a>';

function basemapStyle(dark: boolean): StyleSpecification {
  const variant = dark ? 'dark_all' : 'light_all';
  return {
    version: 8,
    sources: {
      carto: {
        type: 'raster',
        // Sub-domains a–d spread tile requests; {z}/{x}/{y} only (MapLibre does
        // not substitute CARTO's retina {r} token, so request standard tiles).
        tiles: ['a', 'b', 'c', 'd'].map(
          (s) => `https://${s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}.png`,
        ),
        tileSize: 256,
        attribution: CARTO_ATTRIBUTION,
      },
    },
    layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
  };
}

// Battle pins live in one GeoJSON source so F4/F5 can drive styling from the
// feature properties (active/inactive, theater color) without touching the DOM.
const BATTLE_SOURCE = 'battles';
const BATTLE_LAYER = 'battle-pins';

const battleLayer: CircleLayerSpecification = {
  id: BATTLE_LAYER,
  type: 'circle',
  source: BATTLE_SOURCE,
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 5, 8, 9],
    'circle-color': '#DC2626',
    'circle-stroke-width': 2,
    'circle-stroke-color': '#FFFFFF',
    'circle-opacity': 0.9,
  },
};

function battlesToGeoJSON(battles: AtlasBattle[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: battles
      .filter((b) => b.latitude != null && b.longitude != null)
      .map((b) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [b.longitude as number, b.latitude as number] },
        properties: { id: b.id, name: b.name, seq: b.seq },
      })),
  };
}

function fitToBattles(map: MapLibreMap, fc: FeatureCollection<Point>): void {
  const coords = fc.features.map((f) => f.geometry.coordinates as [number, number]);
  if (coords.length === 0) return;
  if (coords.length === 1) {
    map.jumpTo({ center: coords[0], zoom: 5 });
    return;
  }
  const bounds = coords.reduce(
    (b, c) => b.extend(c),
    new LngLatBounds(coords[0], coords[0]),
  );
  map.fitBounds(bounds, { padding: 64, maxZoom: 6, duration: 0 });
}

function ConflictMap({ battles }: { battles: AtlasBattle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  // Follow the site theme (Tailwind `dark` class on <html>) so the basemap
  // never clashes with the page. Changing it rebuilds the map below.
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark')),
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Create / recreate the map. Recreates on theme change; the battle-layer
  // effect below re-runs in the same commit (it also depends on `dark`) and
  // re-adds the pins to the fresh map.
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: basemapStyle(dark),
      center: [10, 30],
      zoom: 1.4,
      attributionControl: { compact: true },
    });
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [dark]);

  // Add pins on first load, update them when `battles` changes, and re-add them
  // after a theme rebuild. Gated on the style being ready.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const data = battlesToGeoJSON(battles);
    const apply = () => {
      const src = map.getSource(BATTLE_SOURCE) as GeoJSONSource | undefined;
      if (src) {
        src.setData(data);
      } else {
        map.addSource(BATTLE_SOURCE, { type: 'geojson', data });
        map.addLayer(battleLayer);
        map.on('mouseenter', BATTLE_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', BATTLE_LAYER, () => { map.getCanvas().style.cursor = ''; });
      }
      fitToBattles(map, data);
    };
    if (map.isStyleLoaded()) {
      apply();
      return;
    }
    map.once('load', apply);
    return () => { map.off('load', apply); };
  }, [battles, dark]);

  return (
    <div className="w-full h-80 md:h-[28rem] rounded-md overflow-hidden border border-muted dark:border-white/15">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default ConflictMap;
