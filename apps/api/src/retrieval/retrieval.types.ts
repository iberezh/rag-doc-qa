import type { RetrievedChunk } from '../documents/documents.types';

export interface RetrievalResult {
  context: string;
  sources: RetrievedChunk[];
}
