'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  ICON_STYLES,
  type IconResult,
  type IconStyle,
  iconDataUri,
  searchIcons,
} from '@/lib/icons';
import { Modal } from './ui/modal';

const STYLE_LABELS: Record<IconStyle, string> = {
  linear: 'Linear',
  bold: 'Bold',
  broken: 'Broken',
  outline: 'Outline',
  'line-duotone': 'Line duo',
  'bold-duotone': 'Bold duo',
};

export function IconPicker({
  onSelect,
  onClose,
}: {
  onSelect: (icon: { value: string; svg: string | null }) => void;
  onClose: () => void;
}) {
  const [style, setStyle] = useState<IconStyle>('linear');
  const [query, setQuery] = useState('');
  const [icons, setIcons] = useState<IconResult[]>([]);
  const [emoji, setEmoji] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    searchIcons(query, style, controller.signal)
      .then(setIcons)
      .catch(() => {});
    return () => controller.abort();
  }, [query, style]);

  const chip = (active: boolean): string =>
    `rounded px-2 py-1 text-xs transition ${
      active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
    }`;

  return (
    <Modal onClose={onClose} label="Choose launcher icon" width="max-w-lg">
      <h2 className="mb-3 font-display text-lg font-semibold">Launcher icon</h2>
      <div className="mb-3 flex flex-wrap gap-1">
        {ICON_STYLES.map((s) => (
          <button key={s} type="button" onClick={() => setStyle(s)} className={chip(s === style)}>
            {STYLE_LABELS[s]}
          </button>
        ))}
      </div>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search 1,200+ icons…"
      />
      <div className="mt-3 grid max-h-64 grid-cols-6 gap-1 overflow-y-auto sm:grid-cols-8">
        {icons.map((icon) => (
          <button
            key={icon.name}
            type="button"
            title={icon.name.replace('solar:', '')}
            onClick={() => {
              onSelect({ value: icon.name, svg: icon.svg });
              onClose();
            }}
            className="flex aspect-square items-center justify-center rounded border border-border text-foreground hover:border-foreground/40"
          >
            <span
              aria-hidden
              className="h-6 w-6 bg-center bg-no-repeat"
              style={{ backgroundImage: `url("${iconDataUri(icon.svg)}")`, backgroundSize: 'contain' }}
            />
          </button>
        ))}
        {icons.length === 0 ? (
          <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
            No icons — try another search.
          </p>
        ) : null}
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">or an emoji:</span>
        <Input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          maxLength={16}
          placeholder="💬"
          className="w-20"
        />
        <button
          type="button"
          disabled={!emoji.trim()}
          onClick={() => {
            onSelect({ value: emoji.trim(), svg: null });
            onClose();
          }}
          className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground disabled:opacity-40"
        >
          Use
        </button>
      </div>
    </Modal>
  );
}
