import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { signup, type Session } from './e2e-utils';

describe('Bots (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let alice: Session;
  let bob: Session;
  let botId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.init();
    prisma = moduleRef.get(PrismaService);
    alice = await signup(app, 'bots-alice');
    bob = await signup(app, 'bots-bob');
  });

  afterAll(async () => {
    await prisma.account.deleteMany({ where: { id: { in: [alice.accountId, bob.accountId] } } });
    await app.close();
  });

  it('creates a bot with a generated public key', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/bots')
      .set('Cookie', alice.cookie)
      .send({ name: 'Support bot' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Support bot');
    expect(res.body.publicKey).toMatch(/^pub_/);
    botId = res.body.id;
  });

  it('lists only the account’s own bots', async () => {
    const mine = await request(app.getHttpServer()).get('/api/bots').set('Cookie', alice.cookie);
    expect(mine.body.some((b: { id: string }) => b.id === botId)).toBe(true);

    const others = await request(app.getHttpServer()).get('/api/bots').set('Cookie', bob.cookie);
    expect(others.body.some((b: { id: string }) => b.id === botId)).toBe(false);
  });

  it('hides another account’s bot (404)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/bots/${botId}`)
      .set('Cookie', bob.cookie);
    expect(res.status).toBe(404);
  });

  it('gates appearance fields to Pro, then allows them after upgrade', async () => {
    const appearance = { greeting: 'Hello there', color: '#123456' };

    const free = await request(app.getHttpServer())
      .patch(`/api/bots/${botId}`)
      .set('Cookie', alice.cookie)
      .send(appearance);
    expect(free.status).toBe(403);

    await prisma.account.update({ where: { id: alice.accountId }, data: { plan: 'PRO' } });

    const pro = await request(app.getHttpServer())
      .patch(`/api/bots/${botId}`)
      .set('Cookie', alice.cookie)
      .send(appearance);
    expect(pro.status).toBe(200);
    expect(pro.body.greeting).toBe('Hello there');
    expect(pro.body.color).toBe('#123456');
  });

  it('deletes a bot the account owns', async () => {
    const del = await request(app.getHttpServer())
      .delete(`/api/bots/${botId}`)
      .set('Cookie', alice.cookie);
    expect(del.status).toBe(204);

    const after = await request(app.getHttpServer())
      .get(`/api/bots/${botId}`)
      .set('Cookie', alice.cookie);
    expect(after.status).toBe(404);
  });
});
