'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createBot, listBots } from '@/lib/bots';
import type { Bot } from '@/lib/types';
import { Logo } from '@/components/landing/logo';
import { AccountMenu } from './account-menu';

export function BotsDashboard() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listBots()
      .then((found) => {
        if (active) setBots(found);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Failed to load bots');
      });
    return () => {
      active = false;
    };
  }, []);

  const create = async (): Promise<void> => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const bot = await createBot(name.trim());
      setBots((prev) => [bot, ...prev]);
      setName('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to create bot');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative z-[2] flex min-h-screen flex-col">
      <header className="flex items-center justify-center gap-2 border-b border-border px-6 py-4 relative">
        <div className="flex items-center gap-1.5">
          <Logo className="h-7 w-auto" />
          <span className="font-display text-2xl font-semibold tracking-tight">Helpbase</span>
        </div>
        <div className="absolute right-6">
          <AccountMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="font-display text-3xl font-semibold">Your chatbots</h1>
        <p className="mt-1 font-body italic text-muted-foreground">
          Each bot answers from its own documents and embeds on your site.
        </p>

        <div className="mt-6 flex gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && void create()}
            placeholder="New bot name, e.g. Acme Docs"
          />
          <Button onClick={() => void create()} disabled={busy || name.trim().length === 0}>
            <Plus /> Create bot
          </Button>
        </div>
        {error ? <p className="mt-2 font-mono text-xs text-destructive">{error}</p> : null}

        {bots.length === 0 ? (
          <p className="mt-10 text-center font-body italic text-muted-foreground">
            No bots yet — create your first one above.
          </p>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {bots.map((bot) => (
              <li key={bot.id}>
                <Link href={`/app/bots/${bot.id}`}>
                  <Card className="transition-colors hover:border-primary">
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="inline-block h-2.5 w-2.5 rotate-45 bg-primary" aria-hidden />
                      <span className="flex-1 truncate font-display font-medium">{bot.name}</span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        {bot.publicKey.slice(0, 11)}…
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
