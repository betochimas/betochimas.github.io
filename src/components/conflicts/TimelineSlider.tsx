import type { AtlasBattle } from '../../data/conflictsApi';

// Horizontal date scrubber spanning a conflict's start→end. Controlled: the page
// owns `currentDate`; dragging fires `onChange`. The map highlights battles whose
// date has passed. Tick marks sit above the slider at each battle's date and
// brighten once that battle is active.

interface TimelineSliderProps {
  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
  currentDate: string; // YYYY-MM-DD (controlled)
  onChange: (date: string) => void;
  battles: AtlasBattle[];
}

const DAY_MS = 86_400_000;

// YYYY-MM-DD parses as UTC midnight; keep everything in UTC so positions and
// labels don't drift by a day across timezones.
const toMs = (d: string): number => Date.parse(d);
const toISODate = (ms: number): string => new Date(ms).toISOString().slice(0, 10);
const fmt = (d: string): string =>
  new Date(toMs(d)).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });

function TimelineSlider({ startDate, endDate, currentDate, onChange, battles }: TimelineSliderProps) {
  const startMs = toMs(startDate);
  const endMs = toMs(endDate);
  const span = Math.max(endMs - startMs, DAY_MS);
  const currentMs = Math.min(Math.max(toMs(currentDate), startMs), endMs);

  const ticks = battles
    .filter((b) => b.date != null)
    .map((b) => ({ id: b.id, name: b.name as string, ms: toMs(b.date as string) }))
    .filter((t) => t.ms >= startMs && t.ms <= endMs)
    .map((t) => ({ ...t, pct: ((t.ms - startMs) / span) * 100, active: t.ms <= currentMs }));

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between text-xs mb-1">
        <span className="text-ink/60 dark:text-ink-dark/60">{fmt(startDate)}</span>
        <span className="font-semibold text-accent">{fmt(toISODate(currentMs))}</span>
        <span className="text-ink/60 dark:text-ink-dark/60">{fmt(endDate)}</span>
      </div>

      {/* Battle ticks, aligned above the scrubber. */}
      <div className="relative h-3 mb-1">
        {ticks.map((t) => (
          <span
            key={t.id}
            title={`${t.name} — ${fmt(toISODate(t.ms))}`}
            className={`absolute top-0 h-3 w-0.5 -translate-x-1/2 rounded ${
              t.active ? 'bg-accent' : 'bg-ink/25 dark:bg-ink-dark/25'
            }`}
            style={{ left: `${t.pct}%` }}
          />
        ))}
      </div>

      <input
        type="range"
        min={startMs}
        max={endMs}
        step={DAY_MS}
        value={currentMs}
        onChange={(e) => onChange(toISODate(Number(e.target.value)))}
        aria-label="Timeline date"
        className="w-full accent-accent cursor-pointer"
      />
    </div>
  );
}

export default TimelineSlider;
