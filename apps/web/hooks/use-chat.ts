import { useCallback, useState } from 'react';
import { streamChat } from '@/lib/api';
import type { ChatEvent, Exchange } from '@/lib/types';

export interface ChatState {
  exchanges: Exchange[];
  streaming: boolean;
  ask: (question: string) => Promise<void>;
}

export function useChat(): ChatState {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [streaming, setStreaming] = useState(false);

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
          return;
      }
    },
    [patch, append],
  );

  const ask = useCallback(
    async (question: string) => {
      const id = crypto.randomUUID();
      setExchanges((prev) => [
        ...prev,
        { id, question, answer: '', sources: [], status: 'streaming' },
      ]);
      setStreaming(true);
      try {
        for await (const event of streamChat(question)) {
          handle(id, event);
        }
        patch(id, { status: 'done' });
      } catch {
        patch(id, { status: 'error' });
      } finally {
        setStreaming(false);
      }
    },
    [handle, patch],
  );

  return { exchanges, streaming, ask };
}
