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
  FilterSpecification,
  ExpressionSpecification,
  DataDrivenPropertyValueSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection, Point } from 'geojson';
import type { AtlasBattle, AtlasParticipant } from '../../data/conflictsApi';
import { basemapNamesFor } from '../../data/nationBasemapAliases';
import { coalitionColorMap, COALITION_FALLBACK } from './coalitionColors';

// ---------------------------------------------------------------------------
// OpenFreeMap vector basemap (https://openfreemap.org) — free, no API key,
// MapLibre-native. We fetch their published style JSON then strip the two
// source-layers that carry modern political content so the historical GeoJSON
// overlay is the sole source of political context on the map.
//
// Stripped (verified against the live positron/dark style JSON):
//   source-layer=boundary  boundary_2 (country), boundary_3 (state/province),
//                          boundary_disputed — all admin boundary line layers
//   source-layer=place     label_country_{1,2,3}, label_state, label_city,
//                          label_city_capital, label_town, label_village,
//                          label_other — every modern political name label
//
// Kept: ne2_shaded raster (physical shaded relief, positron only), landcover,
// landuse, water, waterway, water_name (ocean/sea/river labels — timeless),
// transportation, building, park.
//
// Attribution is embedded in the fetched style's sources (© OpenStreetMap
// contributors, © OpenMapTiles) and surfaced automatically by MapLibre's
// attributionControl — no manual attribution string needed.
//
// Layers, bottom to top: OFM base (terrain/water, no modern politics) →
// historical-context borders (all ~177 nations, very dim; G2) →
// participant nation borders (shaded by coalition side; G4) → battle pins.
// The time-slider (F5) drives an `active` flag on the pins.
// ---------------------------------------------------------------------------

const OFM_STYLE_CACHE = new Map<string, Promise<StyleSpecification>>();

function fetchOFMStyle(dark: boolean): Promise<StyleSpecification> {
  const variant = dark ? 'dark' : 'positron';
  let p = OFM_STYLE_CACHE.get(variant);
  if (!p) {
    p = fetch(`https://tiles.openfreemap.org/styles/${variant}`)
      .then((r) => {
        if (!r.ok) throw new Error(`OFM style: HTTP ${r.status}`);
        return r.json() as Promise<StyleSpecification>;
      })
      .then((style) => {
        // Drop every layer whose source-layer is 'boundary' (country/state admin
        // lines) or 'place' (all political name labels, country down to village).
        // Everything else — physical relief, water, roads, ocean names — is kept.
        style.layers = style.layers.filter(
          (layer) =>
            (layer as { 'source-layer'?: string })['source-layer'] !== 'boundary' &&
            (layer as { 'source-layer'?: string })['source-layer'] !== 'place',
        );
        return style;
      })
      .catch((e) => {
        OFM_STYLE_CACHE.delete(variant); // allow a later retry
        throw e;
      });
    OFM_STYLE_CACHE.set(variant, p);
  }
  return p;
}

// --- Battle pins -----------------------------------------------------------
// One GeoJSON source so the time-slider (F5) can drive styling from the feature
// properties (active/inactive) without touching the DOM.
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
const BORDER_FILL_CTX = 'border-fill-ctx'; // all nations, dim historical context (G2)
const BORDER_LINE_CTX = 'border-line-ctx'; // all nations, dim historical context (G2)
const BORDER_FILL = 'border-fill';          // participant nations, highlighted
const BORDER_LINE = 'border-line';          // participant nations, highlighted

// Participant fill/line color: a MapLibre `match` on the basemap NAME → the
// nation's coalition color (G4). Built from the same coalitionColorMap the
// legend chips use, so map and legend never disagree. Each side's basemap NAMEs
// (incl. aliases) map to its color; participants with a null `side` — and any
// non-participant that slips through the layer filter — fall to the navy
// fallback. Returns a flat color string when no participant carries a side.
function coalitionColorExpr(
  participants: AtlasParticipant[],
): DataDrivenPropertyValueSpecification<string> {
  const colorMap = coalitionColorMap(participants);
  const sides = [...colorMap.keys()];
  if (sides.length === 0) return COALITION_FALLBACK;
  const branches = sides.flatMap((side) => [
    basemapNamesFor(participants.filter((p) => p.side === side)),
    colorMap.get(side) as string,
  ]);
  // The `match` tuple type can't be expressed from a spread-built array, so cast
  // through unknown — the runtime shape (['match', input, label, out, …, default])
  // is a valid MapLibre expression.
  return ['match', ['get', 'NAME'], ...branches, COALITION_FALLBACK] as unknown as ExpressionSpecification;
}

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

interface ConflictMapProps {
  battles: AtlasBattle[];
  participants: AtlasParticipant[];
  borderYear: number | null;
  activeBattleIds: Set<number>;
}

function ConflictMap({ battles, participants, borderYear, activeBattleIds }: ConflictMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  // Latest active-battle set, read by the battle-pins effect when it (re)bakes
  // the pin features. Kept in a ref so that effect doesn't re-run — and re-fit
  // the map — every time the slider moves; the dedicated effect below handles
  // live active-state updates without refitting.
  const activeRef = useRef(activeBattleIds);
  activeRef.current = activeBattleIds;
  // Follow the site theme (Tailwind `dark` class on <html>) so the basemap
  // never clashes with the page. Changing it rebuilds the map below.
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  // Incremented each time a new MapLibre instance is ready. fetchOFMStyle() is
  // async so data effects (battle, border) run with a null mapRef if they fire
  // before the style resolves; mapKey going up signals them to re-run once the
  // map is live. Data effects include mapKey in their dep arrays.
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark')),
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Create / recreate the map. Recreates on theme change. fetchOFMStyle() is
  // cached after first load so subsequent calls (theme toggle) resolve quickly.
  // Once the map is ready, setMapKey() fires so the data effects below re-run.
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    void fetchOFMStyle(dark).then((style) => {
      if (cancelled || !containerRef.current) return;
      const m = new MapLibreMap({
        container: containerRef.current,
        style,
        center: [10, 30],
        zoom: 1.4,
        attributionControl: { compact: true },
      });
      m.addControl(new NavigationControl({ showCompass: false }), 'top-right');
      mapRef.current = m;
      setMapKey((k) => k + 1);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
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
  }, [battles, dark, mapKey]);

  // Nation borders — two tiers:
  //   1. Context (G2): all ~177 world_YYYY nations rendered at very low opacity
  //      so every historical border is visible as geographic background.
  //   2. Participant highlight (F3/G1): conflict nations rendered on top at
  //      stronger opacity. (Will become coalition-colored in G4 once the API
  //      supplies a `side` field on each participant.)
  // Decorative: if the GeoJSON fails to load, the pins still render.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || borderYear == null) return;
    let cancelled = false;
    const filter = ['in', ['get', 'NAME'], ['literal', basemapNamesFor(participants)]] as FilterSpecification;
    // Per-coalition fill/line color (G4), shared with the legend via coalitionColorMap.
    const coalitionColor = coalitionColorExpr(participants);

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
        // Source already exists (conflict/participant change, no map rebuild).
        // Context layers cover all features with no filter; setData refreshes them.
        // Re-apply the participant filter AND coalition colors (the new conflict's
        // participants/sides differ).
        src.setData(fc);
        map.setFilter(BORDER_FILL, filter);
        map.setFilter(BORDER_LINE, filter);
        map.setPaintProperty(BORDER_FILL, 'fill-color', coalitionColor);
        map.setPaintProperty(BORDER_LINE, 'line-color', coalitionColor);
      } else {
        // Sit beneath the battle pins (else on top if the pins aren't added yet).
        const beforeId = map.getLayer(BATTLE_LAYER) ? BATTLE_LAYER : undefined;
        map.addSource(BORDER_SOURCE, { type: 'geojson', data: fc });
        // 1. Context fill — all nations, very dim (G2).
        map.addLayer({
          id: BORDER_FILL_CTX, type: 'fill', source: BORDER_SOURCE,
          paint: { 'fill-color': '#64748B', 'fill-opacity': dark ? 0.10 : 0.07 },
        }, beforeId);
        // 2. Context line — all nations, faint border (G2).
        map.addLayer({
          id: BORDER_LINE_CTX, type: 'line', source: BORDER_SOURCE,
          paint: { 'line-color': '#64748B', 'line-width': 0.5, 'line-opacity': dark ? 0.35 : 0.28 },
        }, beforeId);
        // 3. Participant fill — conflict nations, shaded by coalition side (G4).
        map.addLayer({
          id: BORDER_FILL, type: 'fill', source: BORDER_SOURCE, filter,
          paint: { 'fill-color': coalitionColor, 'fill-opacity': 0.30 },
        }, beforeId);
        // 4. Participant line — conflict nations, outlined in the same coalition color.
        map.addLayer({
          id: BORDER_LINE, type: 'line', source: BORDER_SOURCE, filter,
          paint: { 'line-color': coalitionColor, 'line-width': 1.4, 'line-opacity': 0.85 },
        }, beforeId);
      }
    };

    const run = () => { void apply(); };
    if (map.isStyleLoaded()) run();
    else map.once('load', run);
    return () => { cancelled = true; map.off('load', run); };
  }, [participants, borderYear, dark, mapKey]);

  // Active-state updates as the time-slider moves: re-bake the `active` flag into
  // the pin features (no map refit). The data effects above own creating the
  // source; here we only setData on it if it already exists.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const bsrc = map.getSource(BATTLE_SOURCE) as GeoJSONSource | undefined;
      if (bsrc) bsrc.setData(battlesToGeoJSON(battles, activeBattleIds));
    };
    if (map.isStyleLoaded()) {
      apply();
      return;
    }
    map.once('load', apply);
    return () => { map.off('load', apply); };
  }, [activeBattleIds, battles]);

  return (
    <div className="w-full h-80 md:h-[28rem] rounded-md overflow-hidden border border-muted dark:border-white/15">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default ConflictMap;
