import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { EMBEDDER } from '../src/embeddings/embedder';
import { FakeEmbedder } from '../src/embeddings/fake.embedder';
import { DocumentsRepository } from '../src/documents/documents.repository';
import { PrismaService } from '../src/prisma/prisma.service';
import { createBot, signup, type Session } from './e2e-utils';

describe('Document ingestion (e2e)', () => {
  let app: INestApplication;
  let repo: DocumentsRepository;
  let prisma: PrismaService;
  let session: Session;
  let botId: string;

  beforeAll(async () => {
    // Use the deterministic embedder so e2e never downloads a model.
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EMBEDDER)
      .useClass(FakeEmbedder)
      .compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.init();
    repo = moduleRef.get(DocumentsRepository);
    prisma = moduleRef.get(PrismaService);
    session = await signup(app, 'documents');
    botId = await createBot(app, session.cookie, 'Docs bot');
  });

  afterAll(async () => {
    await prisma.account.deleteMany({ where: { id: session.accountId } });
    await app.close();
  });

  it('rejects ingestion without authentication (401)', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/bots/${botId}/documents/text`)
      .send({ text: 'lorem ipsum', filename: 'note.txt' });

    expect(response.status).toBe(401);
  });

  it('chunks and persists pasted text into the bot', async () => {
    const text = 'lorem ipsum '.repeat(300);
    const response = await request(app.getHttpServer())
      .post(`/api/bots/${botId}/documents/text`)
      .set('Cookie', session.cookie)
      .send({ text, filename: 'note.txt' });

    expect(response.status).toBe(201);
    expect(response.body.filename).toBe('note.txt');
    expect(response.body.chunks).toBeGreaterThan(1);

    const count = await repo.countChunks(response.body.id);
    expect(count).toBe(response.body.chunks);

    const listed = await request(app.getHttpServer())
      .get(`/api/bots/${botId}/documents`)
      .set('Cookie', session.cookie);
    expect(listed.body.some((d: { id: string }) => d.id === response.body.id)).toBe(true);
  });

  it('rejects empty text with 400', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/bots/${botId}/documents/text`)
      .set('Cookie', session.cookie)
      .send({ text: '' });

    expect(response.status).toBe(400);
  });
});
