'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useLibrary } from '@/hooks/use-library';
import { getBot } from '@/lib/bots';
import type { Bot } from '@/lib/types';
import { Logo } from '@/components/landing/logo';
import { AccountMenu } from './account-menu';
import { AnalyticsPanel } from './analytics-panel';
import { AppearancePanel } from './appearance-panel';
import { Button } from './ui/button';
import { ChatPanel } from './chat-panel';
import { EmbedPanel } from './embed-panel';
import { LibraryPanel } from './library-panel';

type View = 'chat' | 'analytics';

const isView = (value: string | null): value is View => value === 'chat' || value === 'analytics';

export function BotWorkspace({ botId }: { botId: string }) {
  const library = useLibrary(botId);
  const chat = useChat(botId);
  const [bot, setBot] = useState<Bot | null>(null);
  const [view, setView] = useState<View>('chat');

  useEffect(() => {
    let active = true;
    getBot(botId)
      .then((found) => {
        if (active) setBot(found);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [botId]);

  // Restore the active tab from the URL so a reload keeps you where you were.
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (isView(tab)) setView(tab);
  }, []);

  const changeView = (next: View): void => {
    setView(next);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    window.history.replaceState({}, '', url);
  };

  return (
    <div className="relative z-[2] flex h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            aria-label="Back to bots"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Logo className="h-6 w-auto" />
          <h1 className="font-display text-xl font-semibold tracking-tight">{bot?.name ?? 'Bot'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={view === 'chat' ? 'secondary' : 'ghost'}
            aria-pressed={view === 'chat'}
            onClick={() => changeView('chat')}
          >
            Test chat
          </Button>
          <Button
            size="sm"
            variant={view === 'analytics' ? 'secondary' : 'ghost'}
            aria-pressed={view === 'analytics'}
            onClick={() => changeView('analytics')}
          >
            Analytics
          </Button>
          <AccountMenu />
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(300px,380px)_1fr]">
        <LibraryPanel
          library={library}
          embed={bot ? <EmbedPanel bot={bot} /> : undefined}
          appearance={bot ? <AppearancePanel bot={bot} /> : undefined}
        />
        {view === 'chat' ? (
          <ChatPanel
            exchanges={chat.exchanges}
            streaming={chat.streaming}
            hasDocs={library.docs.length > 0}
            onAsk={chat.ask}
          />
        ) : (
          <AnalyticsPanel botId={botId} />
        )}
      </main>
    </div>
  );
}
