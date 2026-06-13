import { BadRequestException } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';
import { DocumentStatus, type Document } from '@prisma/client';
import { IngestionService } from './ingestion.service';
import { DocumentsRepository } from './documents.repository';
import { TextExtractorService } from './text-extractor.service';
import { FakeEmbedder } from '../embeddings/fake.embedder';
import { EMBEDDING_DIMENSION } from '../embeddings/embedder';

function setup() {
  const repo = mockDeep<DocumentsRepository>();
  const extractor = mockDeep<TextExtractorService>();
  const service = new IngestionService(repo, extractor, new FakeEmbedder());
  const doc: Document = {
    id: 'd1',
    accountId: 'a1',
    botId: 'b1',
    filename: 'a.txt',
    contentType: 'text/plain',
    status: DocumentStatus.PENDING,
    createdAt: new Date(),
  };
  repo.createDocument.mockResolvedValue(doc);
  return { repo, extractor, service };
}

describe('IngestionService', () => {
  it('ingests pasted text: creates a document, saves chunks, marks ready', async () => {
    const { repo, service } = setup();

    const result = await service.ingestText(
      { accountId: 'a1', botId: 'b1' },
      { text: 'some content to chunk' },
    );

    expect(repo.createDocument).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: 'a1', botId: 'b1' }),
    );
    expect(repo.setStatus).toHaveBeenCalledWith('d1', DocumentStatus.READY);
    expect(result.chunks).toBeGreaterThan(0);

    const saved = repo.saveChunks.mock.calls[0]?.[1];
    expect(saved?.[0]?.embedding).toHaveLength(EMBEDDING_DIMENSION);
  });

  it('extracts text from an uploaded file before persisting', async () => {
    const { repo, extractor, service } = setup();
    extractor.extract.mockResolvedValue('extracted file text');

    await service.ingestFile(
      { accountId: 'a1', botId: 'b1' },
      {
        originalname: 'f.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('x'),
      },
    );

    expect(extractor.extract).toHaveBeenCalledWith(expect.any(Buffer), 'application/pdf');
    expect(repo.createDocument).toHaveBeenCalledWith({
      accountId: 'a1',
      botId: 'b1',
      filename: 'f.pdf',
      contentType: 'application/pdf',
    });
  });

  it('rejects documents with no extractable text', async () => {
    const { service } = setup();
    await expect(
      service.ingestText({ accountId: 'a1', botId: 'b1' }, { text: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
