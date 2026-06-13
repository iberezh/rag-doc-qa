'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateBot } from '@/lib/bots';
import type { Bot } from '@/lib/types';

export function EmbedPanel({ bot }: { bot: Bot }) {
  const [domains, setDomains] = useState(bot.allowedDomains.join('\n'));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const snippet = `<script src="${origin}/widget.js" data-bot="${bot.publicKey}" defer></script>`;

  const save = async (): Promise<void> => {
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      const list = domains
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      await updateBot(bot.id, { allowedDomains: list });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save domains');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">Paste this on any page to embed the chat:</p>
      <pre className="overflow-x-auto rounded-md border border-border bg-card p-3 text-[11px] leading-relaxed">
        {snippet}
      </pre>
      <Button
        size="sm"
        variant="outline"
        onClick={() => void navigator.clipboard?.writeText(snippet)}
      >
        Copy snippet
      </Button>
      <div>
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Allowed domains
        </p>
        <Textarea
          value={domains}
          onChange={(event) => setDomains(event.target.value)}
          rows={3}
          placeholder="example.com — one per line. Leave empty to allow any site."
        />
        <div className="mt-2 flex items-center gap-2">
          <Button size="sm" onClick={() => void save()} disabled={busy}>
            Save domains
          </Button>
          {saved ? <span className="text-xs text-muted-foreground">Saved</span> : null}
          {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </div>
      </div>
    </div>
  );
}
