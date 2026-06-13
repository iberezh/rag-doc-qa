import type { RetrievedChunk } from '../documents/documents.types';

// Below this cosine score the best match is treated as "not relevant enough to answer".
export const CONFIDENCE_THRESHOLD = 0.25;

/** A bot is "confident" when its best-matching chunk clears the score threshold. */
export function isConfident(sources: RetrievedChunk[]): boolean {
  const top = sources[0];
  return top !== undefined && top.score >= CONFIDENCE_THRESHOLD;
}
