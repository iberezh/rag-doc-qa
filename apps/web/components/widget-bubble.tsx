import type { ReactNode } from 'react';

export function Bubble({
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
