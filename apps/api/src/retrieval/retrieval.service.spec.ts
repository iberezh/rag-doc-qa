import { mockDeep } from 'jest-mock-extended';
import { RetrievalService } from './retrieval.service';
import { DocumentsRepository } from '../documents/documents.repository';
import { FakeEmbedder } from '../embeddings/fake.embedder';
import type { RetrievedChunk } from '../documents/documents.types';

describe('RetrievalService', () => {
  it('embeds the query and returns ranked sources with assembled context', async () => {
    const repo = mockDeep<DocumentsRepository>();
    const sources: RetrievedChunk[] = [
      { documentId: 'd1', filename: 'a.txt', chunkIndex: 0, content: 'relevant', score: 0.9 },
    ];
    repo.findSimilarChunks.mockResolvedValue(sources);
    const service = new RetrievalService(new FakeEmbedder(), repo);

    const result = await service.retrieve('a question', 5);

    expect(repo.findSimilarChunks).toHaveBeenCalledWith(expect.any(Array), 5);
    expect(result.sources).toEqual(sources);
    expect(result.context).toContain('[1] (a.txt) relevant');
  });
});
