'use client';

import { useEffect, useState } from 'react';
import { getAnalytics } from '@/lib/analytics';
import type { BotAnalytics, ConversationView } from '@/lib/types';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

function QuestionRow({ item }: { item: ConversationView }) {
  return (
    <li className="rounded-md border border-border bg-card px-3 py-2">
      <p className="text-sm">{item.question}</p>
      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
        {item.visitorEmail ?? 'no email'} · {new Date(item.createdAt).toLocaleString()}
      </p>
    </li>
  );
}

export function AnalyticsPanel({ botId }: { botId: string }) {
  const [data, setData] = useState<BotAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    getAnalytics(botId, controller.signal)
      .then((found) => active && setData(found))
      .catch((cause) => {
        if (!active || (cause instanceof Error && cause.name === 'AbortError')) return;
        setError(cause instanceof Error ? cause.message : 'Failed to load analytics');
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [botId]);

  if (error) return <p className="p-6 text-sm text-destructive">{error}</p>;
  if (!data) return <p className="p-6 text-sm italic text-muted-foreground">Loading analytics…</p>;

  return (
    <section className="h-full overflow-y-auto p-6">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Questions" value={data.totals.total} />
        <Stat label="Deflection" value={`${Math.round(data.totals.deflectionRate * 100)}%`} />
        <Stat label="Unanswered" value={data.totals.unanswered} />
      </div>

      <h3 className="mb-2 mt-8 font-display text-lg font-semibold">Unanswered questions</h3>
      {data.unanswered.length === 0 ? (
        <p className="font-body text-sm italic text-muted-foreground">
          Nothing unanswered yet — your docs are covering the questions.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.unanswered.map((item) => (
            <QuestionRow key={item.id} item={item} />
          ))}
        </ul>
      )}

      <h3 className="mb-2 mt-8 font-display text-lg font-semibold">Recent conversations</h3>
      {data.recent.length === 0 ? (
        <p className="font-body text-sm italic text-muted-foreground">No conversations yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.recent.map((item) => (
            <li key={item.id} className="rounded-md border border-border bg-card px-3 py-2">
              <p className="text-sm font-medium">{item.question}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.answer}</p>
              <span
                className={`mt-1 inline-block font-mono text-[10px] uppercase tracking-wider ${
                  item.answered ? 'text-muted-foreground' : 'text-destructive'
                }`}
              >
                {item.answered ? 'answered' : 'unanswered'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
