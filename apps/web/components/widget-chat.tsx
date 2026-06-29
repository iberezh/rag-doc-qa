'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';
import { getPublicBot, type PublicBotConfig, streamPublicChat } from '@/lib/public';
import type { ChatEvent } from '@/lib/types';
import { Bubble } from './widget-bubble';
import { LeadForm } from './widget-lead-form';
import { stripCitations } from '@/lib/citations';

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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [needsEmail, setNeedsEmail] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    let active = true;
    getPublicBot(publicKey)
      .then((found) => active && setConfig(found))
      .catch(() => active && setConfig(FALLBACK_CONFIG));
    return () => {
      active = false;
    };
  }, [publicKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const append = (id: string, text: string) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: m.text + text } : m)));

  const consume = (id: string, event: ChatEvent): void => {
    if (event.type === 'conversation') setConversationId(event.conversationId);
    if (event.type === 'token') append(id, event.text);
    if (event.type === 'done' && event.answered === false) setNeedsEmail(true);
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
    setNeedsEmail(false);
    setBusy(true);
    try {
      for await (const event of streamPublicChat({ publicKey, query, host, signal: controller.signal })) {
        consume(answerId, event);
      }
    } catch {
      if (!controller.signal.aborted) append(answerId, '\n\n⚠️ Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const accent = config && HEX_COLOR.test(config.color) ? config.color : FALLBACK_ACCENT;
  const inputClass =
    'w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40';

  return (
    <div className="flex h-screen flex-col bg-white text-[#1a1a1a]">
      <header className="px-4 py-3 text-white" style={{ backgroundColor: accent }}>
        <p className="font-display text-base font-semibold">{config?.name ?? 'Chat'}</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm" aria-live="polite">
        <Bubble role="assistant">{config?.greeting ?? 'Hi! How can I help?'}</Bubble>
        {messages.map((m) => {
          // Visitors can't open the source docs, so strip [n] citation markers from replies.
          const text = m.role === 'assistant' ? stripCitations(m.text) : m.text;
          return (
            <Bubble key={m.id} role={m.role} accent={accent}>
              {text || '…'}
            </Bubble>
          );
        })}
        {needsEmail && conversationId ? (
          <LeadForm publicKey={publicKey} conversationId={conversationId} accent={accent} />
        ) : null}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => void send(e)} className="border-t border-black/10 p-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={busy}
          placeholder="Ask a question…"
          className={inputClass}
        />
      </form>

      {config?.showBadge ? (
        <a
          href="https://helpbase.iberezh.site"
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
