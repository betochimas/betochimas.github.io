interface AxisPickerProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

export default function AxisPicker({ label, value, options, onChange }: AxisPickerProps) {
  return (
    <label className="inline-flex items-center gap-1.5">
      <span className="text-ink/60 dark:text-ink-dark/60">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 bg-transparent border border-muted dark:border-white/20 rounded-md focus:outline-none focus:border-accent"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
