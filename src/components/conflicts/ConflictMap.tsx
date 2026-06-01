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
  FillLayerSpecification,
  LineLayerSpecification,
  FilterSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection, Point } from 'geojson';
import type { AtlasBattle, AtlasParticipant, AtlasTheater } from '../../data/conflictsApi';
import { basemapNamesFor } from '../../data/nationBasemapAliases';
import { theaterHullsGeoJSON } from './theaterHulls';

// ---------------------------------------------------------------------------
// Base style — CARTO raster basemaps. No API key, free with attribution.
// "Positron" (light) / "Dark Matter" (dark) are deliberately muted and grey,
// which reads as a restrained, almost-historical look and lets the battle pins
// carry the color. The map follows the site's light/dark theme.
//
// Layers, bottom to top: CARTO basemap -> participant nation borders (F3) ->
// theater hulls (F4) -> battle pins. The time-slider (F5) drives an `active`
// flag baked into the pin/hull features: active battles render bright + larger,
// inactive ones dim; a theater's hull is hidden until one of its battles is active.
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

// --- Battle pins -----------------------------------------------------------
// One GeoJSON source so F4/F5 can drive styling from the feature properties
// (active/inactive, theater color) without touching the DOM.
const BATTLE_SOURCE = 'battles';
const BATTLE_LAYER = 'battle-pins';

const battleLayer: CircleLayerSpecification = {
  id: BATTLE_LAYER,
  type: 'circle',
  source: BATTLE_SOURCE,
  paint: {
    'circle-radius': ['case', ['get', 'active'],
      ['interpolate', ['linear'], ['zoom'], 3, 6, 8, 10],
      ['interpolate', ['linear'], ['zoom'], 3, 3, 8, 5],
    ],
    'circle-color': '#DC2626',
    'circle-stroke-width': ['case', ['get', 'active'], 2.5, 1],
    'circle-stroke-color': '#FFFFFF',
    'circle-opacity': ['case', ['get', 'active'], 0.95, 0.3],
    'circle-stroke-opacity': ['case', ['get', 'active'], 1, 0.4],
  },
};

function battlesToGeoJSON(battles: AtlasBattle[], activeBattleIds?: Set<number>): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: battles
      .filter((b) => b.latitude != null && b.longitude != null)
      .map((b) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [b.longitude as number, b.latitude as number] },
        properties: {
          id: b.id, name: b.name, seq: b.seq,
          active: activeBattleIds ? activeBattleIds.has(b.id) : true,
        },
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

// --- Nation borders (F3) ---------------------------------------------------
// Static, period-correct borders from aourednik/historical-basemaps, vendored
// under public/geo/world_<year>.geojson. Fetched lazily and cached across the
// component lifetime (so a theme rebuild or conflict switch doesn't refetch).
const BORDER_SOURCE = 'borders';
const BORDER_FILL = 'border-fill';
const BORDER_LINE = 'border-line';

const borderCache = new Map<number, Promise<FeatureCollection>>();

function loadBorders(year: number): Promise<FeatureCollection> {
  let p = borderCache.get(year);
  if (!p) {
    p = fetch(`/geo/world_${year}.geojson`)
      .then((r) => {
        if (!r.ok) throw new Error(`borders ${year}: HTTP ${r.status}`);
        return r.json() as Promise<FeatureCollection>;
      })
      .catch((e) => {
        borderCache.delete(year); // allow a later retry
        throw e;
      });
    borderCache.set(year, p);
  }
  return p;
}

// --- Theater hulls (F4) ----------------------------------------------------
// One convex hull per theater (>=3 coord battles), above the borders and below
// the pins. A single fill+line pair, colored per-feature via the hull's `color`.
const THEATER_SOURCE = 'theaters';
const THEATER_FILL = 'theater-fill';
const THEATER_LINE = 'theater-line';

const theaterFillLayer: FillLayerSpecification = {
  id: THEATER_FILL,
  type: 'fill',
  source: THEATER_SOURCE,
  paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['case', ['get', 'active'], 0.13, 0] },
};

const theaterLineLayer: LineLayerSpecification = {
  id: THEATER_LINE,
  type: 'line',
  source: THEATER_SOURCE,
  paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-opacity': ['case', ['get', 'active'], 0.85, 0] },
};

interface ConflictMapProps {
  battles: AtlasBattle[];
  participants: AtlasParticipant[];
  borderYear: number | null;
  theaters: AtlasTheater[];
  activeBattleIds: Set<number>;
}

function ConflictMap({ battles, participants, borderYear, theaters, activeBattleIds }: ConflictMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  // Latest active-battle set, read by the data effects when they (re)bake the
  // pin/hull features. Kept in a ref so those effects don't re-run — and re-fit
  // the map — every time the slider moves; the dedicated effect below handles
  // live active-state updates without refitting.
  const activeRef = useRef(activeBattleIds);
  activeRef.current = activeBattleIds;
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

  // Create / recreate the map. Recreates on theme change; the data effects below
  // also depend on `dark`, so they re-run in the same commit and re-add their
  // layers to the fresh map.
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

  // Battle pins: add on first load, update on change, re-add after a rebuild.
  // Bakes current active-state from the ref; live slider updates are handled by
  // the active-state effect (which doesn't refit), so active changes aren't a dep.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const data = battlesToGeoJSON(battles, activeRef.current);
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

  // Participant nation borders, beneath the pins. Decorative: if the GeoJSON
  // fails to load the pins still render. Re-filters when participants change,
  // swaps the source when the border year changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || borderYear == null) return;
    let cancelled = false;
    const filter = ['in', ['get', 'NAME'], ['literal', basemapNamesFor(participants)]] as FilterSpecification;
    const lineColor = dark ? '#9DB8E6' : '#1E3F7A';

    const apply = async () => {
      let fc: FeatureCollection;
      try {
        fc = await loadBorders(borderYear);
      } catch {
        return;
      }
      if (cancelled || mapRef.current !== map) return;
      const src = map.getSource(BORDER_SOURCE) as GeoJSONSource | undefined;
      if (src) {
        src.setData(fc);
        map.setFilter(BORDER_FILL, filter);
        map.setFilter(BORDER_LINE, filter);
      } else {
        // Sit beneath the theater hulls (else beneath the pins, else on top for now).
        const beforeId = map.getLayer(THEATER_FILL)
          ? THEATER_FILL
          : map.getLayer(BATTLE_LAYER) ? BATTLE_LAYER : undefined;
        map.addSource(BORDER_SOURCE, { type: 'geojson', data: fc });
        map.addLayer({
          id: BORDER_FILL, type: 'fill', source: BORDER_SOURCE, filter,
          paint: { 'fill-color': '#1E3F7A', 'fill-opacity': 0.18 },
        }, beforeId);
        map.addLayer({
          id: BORDER_LINE, type: 'line', source: BORDER_SOURCE, filter,
          paint: { 'line-color': lineColor, 'line-width': 1.2, 'line-opacity': 0.7 },
        }, beforeId);
      }
    };

    const run = () => { void apply(); };
    if (map.isStyleLoaded()) run();
    else map.once('load', run);
    return () => { cancelled = true; map.off('load', run); };
  }, [participants, borderYear, dark]);

  // Theater convex hulls (turf.js), above the borders and below the pins.
  // Recomputed when theaters/battles change; re-added after a theme rebuild.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const data = theaterHullsGeoJSON(theaters, battles, activeRef.current);
    const apply = () => {
      const src = map.getSource(THEATER_SOURCE) as GeoJSONSource | undefined;
      if (src) {
        src.setData(data);
      } else {
        const beforeId = map.getLayer(BATTLE_LAYER) ? BATTLE_LAYER : undefined;
        map.addSource(THEATER_SOURCE, { type: 'geojson', data });
        map.addLayer(theaterFillLayer, beforeId);
        map.addLayer(theaterLineLayer, beforeId);
      }
    };
    if (map.isStyleLoaded()) {
      apply();
      return;
    }
    map.once('load', apply);
    return () => { map.off('load', apply); };
  }, [theaters, battles, dark]);

  // Active-state updates as the time-slider moves: re-bake the `active` flag into
  // the pin + hull features (no map refit). The data effects above own creating
  // the sources; here we only setData on whichever already exist.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const bsrc = map.getSource(BATTLE_SOURCE) as GeoJSONSource | undefined;
      if (bsrc) bsrc.setData(battlesToGeoJSON(battles, activeBattleIds));
      const tsrc = map.getSource(THEATER_SOURCE) as GeoJSONSource | undefined;
      if (tsrc) tsrc.setData(theaterHullsGeoJSON(theaters, battles, activeBattleIds));
    };
    if (map.isStyleLoaded()) {
      apply();
      return;
    }
    map.once('load', apply);
    return () => { map.off('load', apply); };
  }, [activeBattleIds, battles, theaters]);

  return (
    <div className="w-full h-80 md:h-[28rem] rounded-md overflow-hidden border border-muted dark:border-white/15">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default ConflictMap;
