import type { RetrievedChunk } from '../documents/documents.types';

export type ChatEvent =
  | { type: 'sources'; sources: RetrievedChunk[] }
  | { type: 'token'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };
