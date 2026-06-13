import type { RetrievedChunk } from '../documents/documents.types';

// ChatService yields sources/token/done; the public chat stream additionally frames a
// `conversation` event and an `answered` flag on `done` (see public.controller).
export type ChatEvent =
  | { type: 'sources'; sources: RetrievedChunk[] }
  | { type: 'token'; text: string }
  | { type: 'conversation'; conversationId: string }
  | { type: 'done'; answered?: boolean }
  | { type: 'error'; message: string };
