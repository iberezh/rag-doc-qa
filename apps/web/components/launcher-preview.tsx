'use client';

import { iconDataUri } from '@/lib/icons';

// Live preview of how the embedded widget looks: a mini chat card + the floating launcher.
export function LauncherPreview({
  color,
  iconColor,
  iconSvg,
  emoji,
  title,
  greeting,
}: {
  color: string;
  iconColor: string;
  iconSvg: string | null;
  emoji: string;
  title: string;
  greeting: string;
}) {
  return (
    <div className="flex items-end gap-3 rounded-md border border-border bg-muted/40 p-3">
      <div className="w-44 overflow-hidden rounded-lg border border-border shadow-sm">
        <div className="px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: color }}>
          {title || 'Support'}
        </div>
        <div className="bg-white p-2">
          <span className="inline-block rounded-lg bg-[#f1efe9] px-2 py-1 text-xs text-[#1a1a1a]">
            {greeting || 'Hi! How can I help?'}
          </span>
        </div>
      </div>
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-md"
        style={{ backgroundColor: color }}
      >
        {iconSvg ? (
          <span
            aria-hidden
            className="h-7 w-7 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("${iconDataUri(iconSvg, iconColor)}")`,
              backgroundSize: 'contain',
            }}
          />
        ) : (
          <span className="text-2xl leading-none" style={{ color: iconColor }}>
            {emoji || '💬'}
          </span>
        )}
      </div>
    </div>
  );
}
