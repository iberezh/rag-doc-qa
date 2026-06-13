import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EMBEDDER } from '../src/embeddings/embedder';
import { FakeEmbedder } from '../src/embeddings/fake.embedder';
import { CHAT_MODEL } from '../src/chat/chat-model';
import { MockChatModel } from '../src/chat/mock-chat.model';
import { signup, type Session } from './e2e-utils';

describe('Chat (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let session: Session;

  beforeAll(async () => {
    // Force deterministic, offline implementations regardless of env.
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EMBEDDER)
      .useClass(FakeEmbedder)
      .overrideProvider(CHAT_MODEL)
      .useClass(MockChatModel)
      .compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.init();
    prisma = moduleRef.get(PrismaService);
    session = await signup(app, 'chat');

    await request(app.getHttpServer())
      .post('/api/documents/text')
      .set('Cookie', session.cookie)
      .send({ text: 'the mitochondria is the powerhouse of the cell', filename: 'bio.txt' });
  });

  afterAll(async () => {
    await prisma.account.deleteMany({ where: { id: session.accountId } });
    await app.close();
  });

  it('streams an SSE answer with sources, tokens, and done', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/chat')
      .set('Cookie', session.cookie)
      .send({ query: 'what is the powerhouse of the cell?' })
      .buffer(true);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.text).toContain('"type":"sources"');
    expect(res.text).toContain('"type":"token"');
    expect(res.text).toContain('"type":"done"');
  });
});
