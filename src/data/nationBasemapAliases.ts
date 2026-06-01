// Maps the API's participant nation names onto the historical-basemaps GeoJSON
// (aourednik/historical-basemaps), which keys features on a `NAME` property using
// period names. Most of our nationNames match a `NAME` exactly; the few that
// don't are aliased here. A basemap feature is "ours" if its NAME equals the
// participant's nationName OR any alias listed for it.
//
// Verified against the vendored files for the two seeded conflicts:
//   WWI (world_1914):  United Kingdom -> "United Kingdom of Great Britain and Ireland",
//                      Austria-Hungary -> "Austro-Hungarian Empire"; the rest are exact
//                      (France, German Empire, Russian Empire, Ottoman Empire, United States).
//   Russo-Japanese (world_1900): Russian Empire is exact; Empire of Japan -> "Imperial Japan".
import type { AtlasParticipant } from './conflictsApi';

export const NATION_BASEMAP_ALIASES: Record<string, string[]> = {
  'United Kingdom': ['United Kingdom of Great Britain and Ireland'],
  'Austria-Hungary': ['Austro-Hungarian Empire'],
  'Empire of Japan': ['Imperial Japan'], // 1900 map; the 1914 map uses "Empire of Japan"
};

// Years vendored under public/geo/world_<year>.geojson.
export const VENDORED_BORDER_YEARS = [1900, 1914] as const;

// Borders are static "as of the day before war breaks out": snap the conflict's
// start year to the latest vendored basemap at or before it (else the earliest).
export function borderYearFor(startDate: string | null | undefined): number | null {
  if (!startDate) return null;
  const year = Number(startDate.slice(0, 4));
  if (!Number.isFinite(year)) return null;
  const atOrBefore = VENDORED_BORDER_YEARS.filter((y) => y <= year);
  return atOrBefore.length ? Math.max(...atOrBefore) : Math.min(...VENDORED_BORDER_YEARS);
}

// The set of basemap NAME values to highlight for a conflict's participants.
export function basemapNamesFor(participants: AtlasParticipant[]): string[] {
  const names = new Set<string>();
  for (const p of participants) {
    names.add(p.nationName);
    for (const alias of NATION_BASEMAP_ALIASES[p.nationName] ?? []) names.add(alias);
  }
  return [...names];
}
