import type { RetrievedChunk } from '../documents/documents.types';
import { CONTEXT_CHAR_BUDGET } from './retrieval.constants';

/** Joins retrieved chunks into a citation-numbered context block within a char budget. */
export function assembleContext(
  sources: RetrievedChunk[],
  budget: number = CONTEXT_CHAR_BUDGET,
): string {
  const parts: string[] = [];
  let used = 0;

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    if (source === undefined) {
      continue;
    }
    const block = `[${i + 1}] (${source.filename}) ${source.content}`;
    if (used + block.length > budget) {
      break;
    }
    parts.push(block);
    used += block.length;
  }

  return parts.join('\n\n');
}
