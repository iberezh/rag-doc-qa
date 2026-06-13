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

const DOC = 'Helpbase costs 29 dollars per month on the Starter plan.';

describe('Analytics & conversations (e2e)', () => {
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
    session = await signup(app, 'analytics');
    botId = await createBot(app, session.cookie, 'Analytics Bot');
    await request(app.getHttpServer())
      .post(`/api/bots/${botId}/documents/text`)
      .set('Cookie', session.cookie)
      .send({ text: DOC, filename: 'pricing.txt' });
    publicKey = (
      await request(app.getHttpServer()).get(`/api/bots/${botId}`).set('Cookie', session.cookie)
    ).body.publicKey;
  });

  afterAll(async () => {
    await prisma.account.deleteMany({ where: { id: session.accountId } });
    await app.close();
  });

  const chat = (query: string) =>
    request(app.getHttpServer())
      .post(`/api/public/bots/${publicKey}/chat`)
      .send({ query })
      .buffer(true);

  const analytics = () =>
    request(app.getHttpServer()).get(`/api/bots/${botId}/analytics`).set('Cookie', session.cookie);

  it('persists a confident answer and counts it as answered', async () => {
    const res = await chat(DOC);
    expect(res.status).toBe(200);
    expect(res.text).toContain('"type":"conversation"');
    expect(res.text).toContain('"answered":true');

    const stats = await analytics();
    expect(stats.body.totals.answered).toBeGreaterThanOrEqual(1);
  });

  it('flags a low-confidence question as unanswered', async () => {
    const res = await chat('completely unrelated zebra inquiry about nothing');
    expect(res.text).toContain("I don't have a confident answer");
    expect(res.text).toContain('"answered":false');

    const stats = await analytics();
    expect(stats.body.totals.unanswered).toBeGreaterThanOrEqual(1);
    expect(stats.body.unanswered[0].question).toBeTruthy();
  });

  it('captures a visitor email against its conversation', async () => {
    const res = await chat('another unrelated zebra question');
    const conversationId = /"conversationId":"([^"]+)"/.exec(res.text)?.[1];
    expect(conversationId).toBeTruthy();

    const lead = await request(app.getHttpServer())
      .post(`/api/public/bots/${publicKey}/lead`)
      .send({ conversationId, email: 'visitor@acme.test' });
    expect(lead.status).toBe(200);

    const stats = await analytics();
    const found = stats.body.recent.find((c: { id: string }) => c.id === conversationId);
    expect(found?.visitorEmail).toBe('visitor@acme.test');
  });

  it('rejects analytics without authentication (401)', async () => {
    const res = await request(app.getHttpServer()).get(`/api/bots/${botId}/analytics`);
    expect(res.status).toBe(401);
  });
});
