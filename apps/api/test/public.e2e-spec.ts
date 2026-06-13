import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { EMBEDDER } from '../src/embeddings/embedder';
import { FakeEmbedder } from '../src/embeddings/fake.embedder';
import { CHAT_MODEL } from '../src/chat/chat-model';
import { MockChatModel } from '../src/chat/mock-chat.model';
import { PrismaService } from '../src/prisma/prisma.service';
import { createBot, signup, type Session } from './e2e-utils';

describe('Public widget API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let session: Session;
  let botId: string;
  let publicKey: string;

  beforeAll(async () => {
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

    session = await signup(app, 'public');
    botId = await createBot(app, session.cookie, 'Public Bot');
    await request(app.getHttpServer())
      .post(`/api/bots/${botId}/documents/text`)
      .set('Cookie', session.cookie)
      .send({ text: 'the mitochondria is the powerhouse of the cell', filename: 'bio.txt' });
    publicKey = (
      await request(app.getHttpServer()).get(`/api/bots/${botId}`).set('Cookie', session.cookie)
    ).body.publicKey;
  });

  afterAll(async () => {
    await prisma.account.deleteMany({ where: { id: session.accountId } });
    await app.close();
  });

  it('serves public bot config by public key', async () => {
    const res = await request(app.getHttpServer()).get(`/api/public/bots/${publicKey}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Public Bot');
    expect(res.body.showBadge).toBe(true);
    expect(res.body.publicKey).toBeUndefined();
  });

  it('returns 404 for an unknown public key', async () => {
    const res = await request(app.getHttpServer()).get('/api/public/bots/pub_does_not_exist');
    expect(res.status).toBe(404);
  });

  it('streams a public answer when the allowlist is open', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/public/bots/${publicKey}/chat`)
      .send({ query: 'what is the powerhouse of the cell?' })
      .buffer(true);
    expect(res.status).toBe(200);
    expect(res.text).toContain('"type":"sources"');
    expect(res.text).toContain('"type":"done"');
  });

  it('enforces the domain allowlist once set', async () => {
    await request(app.getHttpServer())
      .patch(`/api/bots/${botId}`)
      .set('Cookie', session.cookie)
      .send({ allowedDomains: ['example.com'] });

    const denied = await request(app.getHttpServer())
      .post(`/api/public/bots/${publicKey}/chat?o=https://evil.com`)
      .send({ query: 'hi' })
      .buffer(true);
    expect(denied.status).toBe(403);

    const allowed = await request(app.getHttpServer())
      .post(`/api/public/bots/${publicKey}/chat?o=https://example.com`)
      .send({ query: 'what is the powerhouse of the cell?' })
      .buffer(true);
    expect(allowed.status).toBe(200);
  });

  it('rate-limits a burst of public requests', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 40; i += 1) {
      const res = await request(app.getHttpServer()).get(`/api/public/bots/${publicKey}`);
      statuses.push(res.status);
    }
    expect(statuses).toContain(429);
  });
});
