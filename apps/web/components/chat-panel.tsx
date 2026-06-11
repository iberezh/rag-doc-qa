import { useState, type FormEvent } from 'react';
import { ArrowUp } from 'lucide-react';
import { ExchangeView } from './exchange-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Exchange } from '@/lib/types';

interface ChatPanelProps {
  exchanges: Exchange[];
  streaming: boolean;
  hasDocs: boolean;
  onAsk: (question: string) => void;
}

function EmptyState({ hasDocs }: { hasDocs: boolean }) {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
      <span className="mb-5 inline-block h-4 w-4 rotate-45 bg-primary/30" aria-hidden />
      <h2 className="font-display text-2xl">{hasDocs ? 'Ask your first question' : 'Build your library'}</h2>
      <p className="mt-2 font-body italic text-muted-foreground">
        {hasDocs
          ? 'Type below — answers stream in with citations to the source passages.'
          : 'Add a document on the left, then ask anything about it.'}
      </p>
    </div>
  );
}

export function ChatPanel({ exchanges, streaming, hasDocs, onAsk }: ChatPanelProps) {
  const [value, setValue] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    const question = value.trim();
    if (!question || streaming) {
      return;
    }
    onAsk(question);
    setValue('');
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {exchanges.length === 0 ? (
          <EmptyState hasDocs={hasDocs} />
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-12">
            {exchanges.map((exchange) => (
              <ExchangeView key={exchange.id} exchange={exchange} />
            ))}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-border px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={hasDocs ? 'Ask a question about your documents…' : 'Add a document first…'}
            disabled={streaming}
          />
          <Button
            type="submit"
            size="icon"
            disabled={streaming || value.trim().length === 0}
            aria-label="Ask"
          >
            <ArrowUp />
          </Button>
        </div>
      </form>
    </section>
  );
}
