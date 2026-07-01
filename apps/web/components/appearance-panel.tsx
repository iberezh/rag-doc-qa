'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { me } from '@/lib/auth';
import { updateBot } from '@/lib/bots';
import { getIconSvg, isSolarIcon } from '@/lib/icons';
import type { Bot } from '@/lib/types';
import { ColorField } from './color-field';
import { IconPicker } from './icon-picker';
import { IconSwatch } from './icon-swatch';
import { LauncherPreview } from './launcher-preview';
import { UpgradeModal } from './upgrade-modal';

const label =
  'mb-1 block whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground';

export function AppearancePanel({ bot }: { bot: Bot }) {
  const [isPro, setIsPro] = useState(false);
  const [title, setTitle] = useState(bot.name);
  const [color, setColor] = useState(bot.color);
  const [greeting, setGreeting] = useState(bot.greeting);
  const [icon, setIcon] = useState(bot.launcherIcon);
  const [iconSvg, setIconSvg] = useState<string | null>(null);
  const [iconColor, setIconColor] = useState(bot.iconColor);
  const [hideBadge, setHideBadge] = useState(!bot.showBadge);
  const [picking, setPicking] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void me().then((profile) => active && setIsPro(profile?.account.plan === 'PRO'));
    if (isSolarIcon(bot.launcherIcon)) {
      getIconSvg(bot.launcherIcon)
        .then((svg) => active && setIconSvg(svg))
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [bot.launcherIcon]);

  const save = async (): Promise<void> => {
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      await updateBot(bot.id, {
        name: title.trim() || bot.name,
        color,
        greeting: greeting.trim() || bot.greeting,
        launcherIcon: icon.trim() || '💬',
        iconColor,
        showBadge: !hideBadge,
      });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-3">
      <fieldset
        disabled={!isPro}
        className={`flex flex-col gap-3 ${isPro ? '' : 'pointer-events-none opacity-40 blur-[1px]'}`}
      >
        <LauncherPreview
          color={color}
          iconColor={iconColor}
          iconSvg={isSolarIcon(icon) ? iconSvg : null}
          emoji={isSolarIcon(icon) ? '' : icon}
          title={title}
          greeting={greeting}
        />
        <div>
          <span className={label}>Header title</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
        </div>
        <div>
          <span className={label}>Greeting</span>
          <Textarea
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            rows={2}
            maxLength={280}
          />
        </div>
        <div className="flex items-start gap-4">
          <ColorField label="Accent" value={color} fallback="#c0492c" onChange={setColor} />
          <ColorField label="Icon color" value={iconColor} fallback="#ffffff" onChange={setIconColor} />
          <div>
            <span className={label}>Icon</span>
            <IconSwatch
              icon={icon}
              iconSvg={iconSvg}
              iconColor={iconColor}
              onClick={() => setPicking(true)}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={hideBadge}
            onChange={(e) => setHideBadge(e.target.checked)}
          />
          Hide “Powered by Helpbase” badge
        </label>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => void save()} disabled={busy}>
            Save appearance
          </Button>
          {saved ? <span className="text-xs text-muted-foreground">Saved</span> : null}
          {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </div>
      </fieldset>

      {!isPro ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-card/50 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Pro feature
          </p>
          <Button size="sm" onClick={() => setShowUpgrade(true)}>
            Upgrade to Pro
          </Button>
        </div>
      ) : null}

      {picking ? (
        <IconPicker
          onClose={() => setPicking(false)}
          onSelect={({ value, svg }) => {
            setIcon(value);
            setIconSvg(svg);
          }}
        />
      ) : null}
      {showUpgrade ? <UpgradeModal onClose={() => setShowUpgrade(false)} /> : null}
    </div>
  );
}
