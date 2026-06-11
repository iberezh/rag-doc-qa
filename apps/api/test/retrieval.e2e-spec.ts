import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DocumentsRepository } from '../src/documents/documents.repository';
import { EMBEDDER } from '../src/embeddings/embedder';
import { FakeEmbedder } from '../src/embeddings/fake.embedder';

describe('Retrieval (e2e)', () => {
  let app: INestApplication;
  let repo: DocumentsRepository;
  const ids: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EMBEDDER)
      .useClass(FakeEmbedder)
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    repo = moduleRef.get(DocumentsRepository);
  });

  afterAll(async () => {
    await Promise.all(ids.map((id) => repo.deleteDocument(id)));
    await app.close();
  });

  async function ingest(text: string, filename: string): Promise<void> {
    const res = await request(app.getHttpServer())
      .post('/api/documents/text')
      .send({ text, filename });
    ids.push(res.body.id);
  }

  it('ranks the exact-match chunk first and assembles cited context', async () => {
    await ingest('the quick brown fox jumps', 'fox.txt');
    await ingest('annual revenue and quarterly earnings', 'finance.txt');

    const res = await request(app.getHttpServer())
      .post('/api/search')
      .send({ query: 'the quick brown fox jumps', limit: 2 });

    expect(res.status).toBe(201);
    expect(res.body.sources[0].filename).toBe('fox.txt');
    expect(res.body.sources[0].score).toBeCloseTo(1, 5);
    expect(res.body.context).toContain('[1] (fox.txt)');
  });
});
