import type { ChatMessage } from './chat-model';

const SYSTEM_PROMPT = [
  'You are a helpful assistant that answers questions strictly from the provided context.',
  'Cite the sources you use with bracketed numbers like [1], [2] matching the context blocks.',
  "If the answer is not in the context, say you don't have enough information.",
].join(' ');

export function buildMessages(query: string, context: string): ChatMessage[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` },
  ];
}
