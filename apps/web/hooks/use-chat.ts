import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChat } from '@/lib/api';
import type { ChatEvent, Exchange } from '@/lib/types';

export interface ChatState {
  exchanges: Exchange[];
  streaming: boolean;
  ask: (question: string) => Promise<void>;
}

export function useChat(botId: string): ChatState {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight stream when the workspace unmounts (e.g. navigating away).
  useEffect(() => () => abortRef.current?.abort(), []);

  const patch = useCallback((id: string, change: Partial<Exchange>) => {
    setExchanges((prev) => prev.map((x) => (x.id === id ? { ...x, ...change } : x)));
  }, []);

  const append = useCallback((id: string, text: string) => {
    setExchanges((prev) => prev.map((x) => (x.id === id ? { ...x, answer: x.answer + text } : x)));
  }, []);

  const handle = useCallback(
    (id: string, event: ChatEvent) => {
      switch (event.type) {
        case 'sources':
          return patch(id, { sources: event.sources });
        case 'token':
          return append(id, event.text);
        case 'error':
          return patch(id, { status: 'error' });
        case 'done':
          // Only set when defined — exactOptionalPropertyTypes rejects assigning `undefined`.
          if (event.answered !== undefined) patch(id, { answered: event.answered });
          return;
      }
    },
    [patch, append],
  );

  const ask = useCallback(
    async (question: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const id = crypto.randomUUID();
      setExchanges((prev) => [
        ...prev,
        { id, question, answer: '', sources: [], status: 'streaming' },
      ]);
      setStreaming(true);
      try {
        for await (const event of streamChat(botId, question, controller.signal)) {
          handle(id, event);
        }
        patch(id, { status: 'done' });
      } catch {
        if (!controller.signal.aborted) {
          patch(id, { status: 'error' });
        }
      } finally {
        setStreaming(false);
      }
    },
    [handle, patch, botId],
  );

  return { exchanges, streaming, ask };
}
