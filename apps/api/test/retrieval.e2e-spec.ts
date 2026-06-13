import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { EMBEDDER } from '../src/embeddings/embedder';
import { FakeEmbedder } from '../src/embeddings/fake.embedder';
import { PrismaService } from '../src/prisma/prisma.service';
import { signup, type Session } from './e2e-utils';

describe('Retrieval (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let acme: Session;
  let other: Session;

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
    acme = await signup(app, 'retrieval-acme');
    other = await signup(app, 'retrieval-other');
  });

  afterAll(async () => {
    await prisma.account.deleteMany({ where: { id: { in: [acme.accountId, other.accountId] } } });
    await app.close();
  });

  async function ingest(session: Session, text: string, filename: string): Promise<void> {
    await request(app.getHttpServer())
      .post('/api/documents/text')
      .set('Cookie', session.cookie)
      .send({ text, filename });
  }

  it('ranks the exact-match chunk first and assembles cited context', async () => {
    await ingest(acme, 'the quick brown fox jumps', 'fox.txt');
    await ingest(acme, 'annual revenue and quarterly earnings', 'finance.txt');

    const res = await request(app.getHttpServer())
      .post('/api/search')
      .set('Cookie', acme.cookie)
      .send({ query: 'the quick brown fox jumps', limit: 2 });

    expect(res.status).toBe(201);
    expect(res.body.sources[0].filename).toBe('fox.txt');
    expect(res.body.sources[0].score).toBeCloseTo(1, 5);
    expect(res.body.context).toContain('[1] (fox.txt)');
  });

  it('never returns another account’s chunks (tenant isolation)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/search')
      .set('Cookie', other.cookie)
      .send({ query: 'the quick brown fox jumps', limit: 5 });

    expect(res.status).toBe(201);
    expect(res.body.sources).toHaveLength(0);
  });
});
