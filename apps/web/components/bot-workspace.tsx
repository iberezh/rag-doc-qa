'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useLibrary } from '@/hooks/use-library';
import { getBot } from '@/lib/bots';
import type { Bot } from '@/lib/types';
import { AccountMenu } from './account-menu';
import { ChatPanel } from './chat-panel';
import { EmbedPanel } from './embed-panel';
import { LibraryPanel } from './library-panel';

export function BotWorkspace({ botId }: { botId: string }) {
  const library = useLibrary(botId);
  const chat = useChat(botId);
  const [bot, setBot] = useState<Bot | null>(null);

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

  return (
    <div className="relative z-[2] flex h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Back to bots"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="inline-block h-3 w-3 rotate-45 bg-primary" aria-hidden />
          <h1 className="font-display text-xl font-semibold tracking-tight">{bot?.name ?? 'Bot'}</h1>
        </div>
        <AccountMenu />
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(300px,380px)_1fr]">
        <LibraryPanel library={library} embed={bot ? <EmbedPanel bot={bot} /> : undefined} />
        <ChatPanel
          exchanges={chat.exchanges}
          streaming={chat.streaming}
          hasDocs={library.docs.length > 0}
          onAsk={chat.ask}
        />
      </main>
    </div>
  );
}
