import { cn } from '@/lib/utils';

type LogoProps = { className?: string };

// The Helpbase mark (brand concept 24, "Baseline h"): a lowercase Bricolage "h" on a vermilion
// baseline — help + base. The glyph inherits currentColor so it themes to any background; the
// baseline is always the vermilion accent. Decorative — pair it with the "Helpbase" wordmark.
export function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="11 7 26 38" aria-hidden focusable="false" className={cn('h-6 w-auto', className)}>
      <text
        x="24"
        y="33"
        textAnchor="middle"
        fontSize="32"
        className="fill-current font-display font-bold"
      >
        h
      </text>
      <rect x="12" y="37.5" width="24" height="4.2" rx="2.1" className="fill-primary" />
    </svg>
  );
}
