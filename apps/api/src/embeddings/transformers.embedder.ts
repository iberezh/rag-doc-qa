import { Injectable } from '@nestjs/common';
import type { FeatureExtractionPipeline } from '@xenova/transformers';
import { EMBEDDING_DIMENSION, type Embedder } from './embedder';

const MODEL = 'Xenova/all-MiniLM-L6-v2';

type TransformersModule = typeof import('@xenova/transformers');

// @xenova/transformers is ESM-only. This native dynamic import survives TypeScript's
// CommonJS downleveling so the package loads at runtime; keeping it lazy also means
// tests/CI (which use the fake embedder) never load it. `as unknown as` documents the shim.
const loadTransformers = new Function(
  'return import("@xenova/transformers")',
) as unknown as () => Promise<TransformersModule>;

/** Local, key-free embeddings via transformers.js. The model downloads on first use. */
@Injectable()
export class TransformersEmbedder implements Embedder {
  readonly dimension = EMBEDDING_DIMENSION;
  private pipe: FeatureExtractionPipeline | null = null;

  async embed(texts: string[]): Promise<number[][]> {
    const pipe = await this.getPipe();
    const output = await pipe(texts, { pooling: 'mean', normalize: true });
    return output.tolist();
  }

  private async getPipe(): Promise<FeatureExtractionPipeline> {
    if (this.pipe === null) {
      const { pipeline } = await loadTransformers();
      this.pipe = await pipeline('feature-extraction', MODEL);
    }
    return this.pipe;
  }
}
