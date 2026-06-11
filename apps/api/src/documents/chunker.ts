import { CHUNK_OVERLAP, CHUNK_SIZE } from './documents.constants';

export interface ChunkOptions {
  size: number;
  overlap: number;
}

export const DEFAULT_CHUNK_OPTIONS: ChunkOptions = {
  size: CHUNK_SIZE,
  overlap: CHUNK_OVERLAP,
};

/** Splits text into overlapping fixed-size chunks. Returns [] for blank input. */
export function chunkText(text: string, options: ChunkOptions = DEFAULT_CHUNK_OPTIONS): string[] {
  const normalized = text.trim();
  if (normalized.length === 0) {
    return [];
  }

  const step = Math.max(1, options.size - options.overlap);
  const chunks: string[] = [];

  for (let start = 0; start < normalized.length; start += step) {
    chunks.push(normalized.slice(start, start + options.size));
    if (start + options.size >= normalized.length) {
      break;
    }
  }

  return chunks;
}
