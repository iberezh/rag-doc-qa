import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DocumentsRepository } from '../src/documents/documents.repository';
import { EMBEDDER } from '../src/embeddings/embedder';
import { FakeEmbedder } from '../src/embeddings/fake.embedder';
import { CHAT_MODEL } from '../src/chat/chat-model';
import { MockChatModel } from '../src/chat/mock-chat.model';

describe('Chat (e2e)', () => {
  let app: INestApplication;
  let repo: DocumentsRepository;
  let docId: string;

  beforeAll(async () => {
    // Force deterministic, offline implementations regardless of env.
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EMBEDDER)
      .useClass(FakeEmbedder)
      .overrideProvider(CHAT_MODEL)
      .useClass(MockChatModel)
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    repo = moduleRef.get(DocumentsRepository);

    const res = await request(app.getHttpServer())
      .post('/api/documents/text')
      .send({ text: 'the mitochondria is the powerhouse of the cell', filename: 'bio.txt' });
    docId = res.body.id;
  });

  afterAll(async () => {
    await repo.deleteDocument(docId);
    await app.close();
  });

  it('streams an SSE answer with sources, tokens, and done', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/chat')
      .send({ query: 'what is the powerhouse of the cell?' })
      .buffer(true);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.text).toContain('"type":"sources"');
    expect(res.text).toContain('"type":"token"');
    expect(res.text).toContain('"type":"done"');
  });
});
