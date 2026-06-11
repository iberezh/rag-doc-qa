export const EMBEDDING_DIMENSION = 384;

/** DI token for the active Embedder implementation. */
export const EMBEDDER = Symbol('EMBEDDER');

export interface Embedder {
  readonly dimension: number;
  embed(texts: string[]): Promise<number[][]>;
}
