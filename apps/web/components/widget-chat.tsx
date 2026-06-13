'use client';

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { getPublicBot, type PublicBotConfig, streamPublicChat } from '@/lib/public';
import type { ChatEvent } from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const FALLBACK_ACCENT = '#c0492c';
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const FALLBACK_CONFIG: PublicBotConfig = {
  name: 'Support',
  greeting: 'Hi! How can I help?',
  color: FALLBACK_ACCENT,
  showBadge: true,
};

export function WidgetChat({ publicKey, host }: { publicKey: string; host: string | null }) {
  const [config, setConfig] = useState<PublicBotConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight stream when the widget unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    let active = true;
    getPublicBot(publicKey)
      .then((found) => {
        if (active) setConfig(found);
      })
      .catch(() => {
        if (active) setConfig(FALLBACK_CONFIG);
      });
    return () => {
      active = false;
    };
  }, [publicKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const append = (id: string, text: string) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: m.text + text } : m)));

  const consume = (id: string, event: ChatEvent) => {
    if (event.type === 'token') append(id, event.text);
  };

  const send = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const query = value.trim();
    if (!query || busy) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const answerId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text: query },
      { id: answerId, role: 'assistant', text: '' },
    ]);
    setValue('');
    setBusy(true);
    try {
      for await (const event of streamPublicChat(publicKey, query, host, controller.signal)) {
        consume(answerId, event);
      }
    } catch {
      if (!controller.signal.aborted) {
        append(answerId, '\n\n⚠️ Something went wrong. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  // Re-validate the server-provided color before using it as a CSS value (defense in depth).
  const accent = config && HEX_COLOR.test(config.color) ? config.color : FALLBACK_ACCENT;

  return (
    <div className="flex h-screen flex-col bg-white text-[#1a1a1a]">
      <header className="px-4 py-3 text-white" style={{ backgroundColor: accent }}>
        <p className="font-display text-base font-semibold">{config?.name ?? 'Chat'}</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm" aria-live="polite">
        <Bubble role="assistant">{config?.greeting ?? 'Hi! How can I help?'}</Bubble>
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} accent={accent}>
            {m.text || '…'}
          </Bubble>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => void send(e)} className="border-t border-black/10 p-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={busy}
          placeholder="Ask a question…"
          className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
        />
      </form>

      {config?.showBadge ? (
        <a
          href="https://github.com/iberezh/rag-doc-qa"
          target="_blank"
          rel="noreferrer"
          className="pb-2 text-center text-[11px] text-black/40 hover:text-black/60"
        >
          Powered by Helpbase
        </a>
      ) : null}
    </div>
  );
}

function Bubble({
  role,
  accent,
  children,
}: {
  role: 'user' | 'assistant';
  accent?: string;
  children: ReactNode;
}) {
  const mine = role === 'user';
  return (
    <div className={mine ? 'flex justify-end' : 'flex justify-start'}>
      <span
        className="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2"
        style={mine ? { backgroundColor: accent, color: '#fff' } : { backgroundColor: '#f1efe9' }}
      >
        {children}
      </span>
    </div>
  );
}
