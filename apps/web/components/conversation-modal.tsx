'use client';

import type { ConversationView } from '@/lib/types';
import { Modal } from './ui/modal';

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

// The analytics list only previews replies; this shows the full question + answer.
export function ConversationModal({
  conversation,
  onClose,
}: {
  conversation: ConversationView;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose} label="Conversation detail">
      <div className="mb-3">
        <StatusTag answered={conversation.answered} />
      </div>
      <p className="pr-6 font-display text-lg font-medium">{conversation.question}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {conversation.answer}
      </p>
      <p className="mt-4 border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
        {metaLine(conversation)}
      </p>
    </Modal>
  );
}
