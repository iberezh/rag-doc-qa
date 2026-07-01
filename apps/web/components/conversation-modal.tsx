'use client';

import { useEffect, useRef } from 'react';
import type { ConversationView } from '@/lib/types';

export function StatusTag({ answered }: { answered: boolean }) {
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-wider ${
        answered ? 'text-muted-foreground' : 'text-destructive'
      }`}
    >
      {answered ? 'answered' : 'unanswered'}
    </span>
  );
}

export const metaLine = (item: ConversationView): string =>
  `${item.visitorEmail ?? 'no email'} · ${new Date(item.createdAt).toLocaleString()}`;

// Dependency-free modal: a real <button> backdrop (keyboard-accessible), Escape to close,
// and focus moved to the close control on open.
export function ConversationModal({
  conversation,
  onClose,
}: {
  conversation: ConversationView;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Conversation detail"
        className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-xl"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <StatusTag answered={conversation.answered} />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-2 text-xl leading-none text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            ×
          </button>
        </div>
        <p className="font-display text-lg font-medium">{conversation.question}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {conversation.answer}
        </p>
        <p className="mt-4 border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
          {metaLine(conversation)}
        </p>
      </div>
    </div>
  );
}
