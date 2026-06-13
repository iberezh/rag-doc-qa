import { Inject, Injectable } from '@nestjs/common';
import { EMBEDDER, type Embedder } from '../embeddings/embedder';
import { DocumentsRepository } from '../documents/documents.repository';
import { assembleContext } from './context';
import { DEFAULT_TOP_K } from './retrieval.constants';
import type { RetrievalResult } from './retrieval.types';

@Injectable()
export class RetrievalService {
  constructor(
    @Inject(EMBEDDER) private readonly embedder: Embedder,
    private readonly repo: DocumentsRepository,
  ) {}

  async retrieve(
    botId: string,
    query: string,
    limit: number = DEFAULT_TOP_K,
  ): Promise<RetrievalResult> {
    const [embedding] = await this.embedder.embed([query]);
    if (embedding === undefined) {
      throw new Error('Failed to embed query');
    }
    const sources = await this.repo.findSimilarChunks(botId, embedding, limit);
    return { sources, context: assembleContext(sources) };
  }
}
