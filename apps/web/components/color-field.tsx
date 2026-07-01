'use client';

const HEX = /^#[0-9a-fA-F]{6}$/;

// Labeled native color picker; falls back to a valid hex if the stored value is malformed.
export function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <span className="mb-1 block whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        type="color"
        value={HEX.test(value) ? value : fallback}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-14 cursor-pointer rounded border border-border bg-card"
      />
    </div>
  );
}
