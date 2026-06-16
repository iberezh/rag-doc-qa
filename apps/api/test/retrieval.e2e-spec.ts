import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { EMBEDDER } from '../src/embeddings/embedder';
import { FakeEmbedder } from '../src/embeddings/fake.embedder';
import { PrismaService } from '../src/prisma/prisma.service';
import { createBot, signup, type Session } from './e2e-utils';

describe('Retrieval (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let session: Session;
  let botA: string;
  let botB: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EMBEDDER)
      .useClass(FakeEmbedder)
      .compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.init();
    prisma = moduleRef.get(PrismaService);
    session = await signup(app, 'retrieval');
    // STARTER allows multiple bots (FREE caps at 1) — set directly, no Stripe needed.
    await prisma.account.update({ where: { id: session.accountId }, data: { plan: 'STARTER' } });
    botA = await createBot(app, session.cookie, 'Bot A');
    botB = await createBot(app, session.cookie, 'Bot B');
  });

  afterAll(async () => {
    await prisma.account.deleteMany({ where: { id: session.accountId } });
    await app.close();
  });

  async function ingest(botId: string, text: string, filename: string): Promise<void> {
    await request(app.getHttpServer())
      .post(`/api/bots/${botId}/documents/text`)
      .set('Cookie', session.cookie)
      .send({ text, filename });
  }

  it('ranks the exact-match chunk first and assembles cited context', async () => {
    await ingest(botA, 'the quick brown fox jumps', 'fox.txt');
    await ingest(botA, 'annual revenue and quarterly earnings', 'finance.txt');

    const res = await request(app.getHttpServer())
      .post(`/api/bots/${botA}/search`)
      .set('Cookie', session.cookie)
      .send({ query: 'the quick brown fox jumps', limit: 2 });

    expect(res.status).toBe(201);
    expect(res.body.sources[0].filename).toBe('fox.txt');
    expect(res.body.sources[0].score).toBeCloseTo(1, 5);
    expect(res.body.context).toContain('[1] (fox.txt)');
  });

  it('never returns another bot’s chunks, even within the same account', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/bots/${botB}/search`)
      .set('Cookie', session.cookie)
      .send({ query: 'the quick brown fox jumps', limit: 5 });

    expect(res.status).toBe(201);
    expect(res.body.sources).toHaveLength(0);
  });
});
