'use client';

import { iconDataUri, isSolarIcon } from '@/lib/icons';

// The current launcher icon as a color-picker-sized swatch; click to open the picker.
export function IconSwatch({
  icon,
  iconSvg,
  iconColor,
  onClick,
}: {
  icon: string;
  iconSvg: string | null;
  iconColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Choose launcher icon"
      className="flex h-9 w-14 items-center justify-center rounded border border-border bg-card hover:border-foreground/40"
    >
      {isSolarIcon(icon) && iconSvg ? (
        <span
          aria-hidden
          className="h-5 w-5 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${iconDataUri(iconSvg, iconColor)}")`,
            backgroundSize: 'contain',
          }}
        />
      ) : (
        <span className="text-lg leading-none">{isSolarIcon(icon) ? '…' : icon || '💬'}</span>
      )}
    </button>
  );
}
