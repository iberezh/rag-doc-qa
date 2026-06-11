'use client';

import { useLibrary } from '@/hooks/use-library';
import { useChat } from '@/hooks/use-chat';
import { LibraryPanel } from './library-panel';
import { ChatPanel } from './chat-panel';

export function Workspace() {
  const library = useLibrary();
  const chat = useChat();

  return (
    <div className="relative z-[2] flex h-screen flex-col">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-6 py-4">
        <div className="flex items-baseline gap-3">
          <span className="inline-block h-3 w-3 rotate-45 bg-primary" aria-hidden />
          <h1 className="font-display text-2xl font-semibold tracking-tight">RAG&nbsp;Doc&nbsp;Q&amp;A</h1>
          <span className="hidden font-body italic text-muted-foreground sm:inline">
            ask your documents
          </span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          retrieval · citations · streaming
        </span>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(300px,380px)_1fr]">
        <LibraryPanel library={library} />
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
