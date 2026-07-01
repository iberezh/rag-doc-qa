'use client';

import { useEffect, useState } from 'react';
import { getAnalytics } from '@/lib/analytics';
import type { BotAnalytics, ConversationView } from '@/lib/types';
import { ConversationModal, StatusTag, metaLine } from './conversation-modal';

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

// A clickable conversation row; opens the full transcript in a modal (the list only previews it).
function ConversationRow({
  item,
  showAnswer,
  onOpen,
}: {
  item: ConversationView;
  showAnswer: boolean;
  onOpen: (c: ConversationView) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="w-full rounded-md border border-border bg-card px-3 py-2 text-left transition hover:border-foreground/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <p className="text-sm font-medium">{item.question}</p>
        {showAnswer ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.answer}</p>
        ) : null}
        <p className="mt-1 flex flex-wrap items-center gap-x-2">
          <StatusTag answered={item.answered} />
          <span className="font-mono text-[10px] text-muted-foreground/70">· click to view</span>
        </p>
        {showAnswer ? null : (
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{metaLine(item)}</p>
        )}
      </button>
    </li>
  );
}

export function AnalyticsPanel({ botId }: { botId: string }) {
  const [data, setData] = useState<BotAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ConversationView | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => {
      const controller = new AbortController();
      getAnalytics(botId, controller.signal)
        .then((found) => active && setData(found))
        .catch((cause) => {
          if (!active || (cause instanceof Error && cause.name === 'AbortError')) return;
          setError(cause instanceof Error ? cause.message : 'Failed to load analytics');
        });
      return controller;
    };
    let controller = load();
    // Live updates: re-poll every 5s so new conversations land without a reload.
    const timer = setInterval(() => {
      controller.abort();
      controller = load();
    }, 5000);
    return () => {
      active = false;
      controller.abort();
      clearInterval(timer);
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
            <ConversationRow key={item.id} item={item} showAnswer={false} onOpen={setSelected} />
          ))}
        </ul>
      )}

      <h3 className="mb-2 mt-8 font-display text-lg font-semibold">Recent conversations</h3>
      {data.recent.length === 0 ? (
        <p className="font-body text-sm italic text-muted-foreground">No conversations yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.recent.map((item) => (
            <ConversationRow key={item.id} item={item} showAnswer onOpen={setSelected} />
          ))}
        </ul>
      )}

      {selected ? (
        <ConversationModal conversation={selected} onClose={() => setSelected(null)} />
      ) : null}
    </section>
  );
}
