import type { RetrievedChunk } from '../documents/documents.types';

// Below this cosine score the best match is treated as "not relevant enough to answer".
// Tuned for all-MiniLM-L6-v2, where genuinely relevant short queries land around 0.2–0.5
// and unrelated ones sit well below; 0.25 over-deflected real questions.
export const CONFIDENCE_THRESHOLD = 0.15;

/** A bot is "confident" when its best-matching chunk clears the score threshold. */
export function isConfident(sources: RetrievedChunk[]): boolean {
  const top = sources[0];
  return top !== undefined && top.score >= CONFIDENCE_THRESHOLD;
}
