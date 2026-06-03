import type { AtlasParticipant } from '../../data/conflictsApi';

// Coalition fill colors for participant nations (G4). Assigned to a conflict's
// distinct `side` values in sorted order, so a side keeps its color across
// re-renders. Chosen to stand apart from the red battle pins (#DC2626) and the
// grey historical-context borders (#64748B):
//   0  green  — Allied Powers (WWI) / first side alphabetically
//   1  tan    — Central Powers (WWI)
//   2+ navy / brown — headroom for 3- and 4-way conflicts
// Both the map's fill/line `match` expressions and the page's legend chips read
// from the SAME mapping (coalitionColorMap), so colors never drift between them.
export const COALITION_COLORS = ['#15803D', '#B45309', '#1E4F9C', '#7A4A00'];

// Fallback for a participant whose `side` is null (un-grouped) — a neutral navy
// so it still highlights without claiming a coalition.
export const COALITION_FALLBACK = '#1E3F7A';

// Distinct, non-null side names for a conflict, sorted for deterministic color
// assignment (alphabetical — "Allied Powers" < "Central Powers").
export function coalitionSides(participants: AtlasParticipant[]): string[] {
  return [...new Set(participants.map((p) => p.side).filter((s): s is string => !!s))].sort();
}

// side name -> color. Empty when no participant carries a side.
export function coalitionColorMap(participants: AtlasParticipant[]): Map<string, string> {
  const sides = coalitionSides(participants);
  return new Map(sides.map((side, i) => [side, COALITION_COLORS[i % COALITION_COLORS.length]]));
}
