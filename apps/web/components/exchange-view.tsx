import { useState } from 'react';
import { AnswerText } from './answer-text';
import { SourceCard } from './source-card';
import type { Exchange } from '@/lib/types';

export function ExchangeView({ exchange }: { exchange: Exchange }) {
  const [active, setActive] = useState<number | null>(null);
  const thinking = exchange.status === 'streaming' && exchange.answer.length === 0;
  const answerText = thinking ? 'Reading your documents' : exchange.answer;

  return (
    <article className="rise">
      <p className="mb-3 font-display text-xl font-medium italic leading-snug text-foreground">
        {exchange.question}
      </p>

      {exchange.status === 'error' ? (
        <p className="font-mono text-sm text-destructive">Something went wrong — please try again.</p>
      ) : (
        <AnswerText
          answer={answerText}
          streaming={exchange.status === 'streaming'}
          activeCitation={active}
          onCite={setActive}
        />
      )}

      {exchange.sources.length > 0 && (
        <div className="mt-5 grid gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Sources
          </p>
          {exchange.sources.map((source, i) => (
            <SourceCard
              key={`${source.documentId}-${source.chunkIndex}`}
              index={i + 1}
              source={source}
              active={active === i + 1}
            />
          ))}
        </div>
      )}
    </article>
  );
}
