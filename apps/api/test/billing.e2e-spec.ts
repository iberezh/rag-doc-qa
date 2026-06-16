import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { StripeService } from '../src/billing/stripe.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { signup, type Session } from './e2e-utils';

// Force mock billing regardless of any STRIPE_SECRET_KEY in the environment.
const disabledStripe = { isEnabled: () => false } as unknown as StripeService;

describe('Billing (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let session: Session;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(StripeService)
      .useValue(disabledStripe)
      .compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.init();
    prisma = moduleRef.get(PrismaService);
    session = await signup(app, 'billing');
  });

  afterAll(async () => {
    await prisma.account.deleteMany({ where: { id: session.accountId } });
    await app.close();
  });

  const createBot = (name: string) =>
    request(app.getHttpServer()).post('/api/bots').set('Cookie', session.cookie).send({ name });

  it('starts on the Free plan with mock billing', async () => {
    const res = await request(app.getHttpServer()).get('/api/billing').set('Cookie', session.cookie);
    expect(res.status).toBe(200);
    expect(res.body.plan).toBe('FREE');
    expect(res.body.stripeEnabled).toBe(false);
    expect(res.body.limits.bots).toBe(1);
  });

  it('enforces the Free bot limit', async () => {
    expect((await createBot('Bot 1')).status).toBe(201);
    expect((await createBot('Bot 2')).status).toBe(403);
  });

  it('mock checkout upgrades the plan and lifts the limit', async () => {
    const checkout = await request(app.getHttpServer())
      .post('/api/billing/checkout')
      .set('Cookie', session.cookie)
      .send({ plan: 'STARTER' });
    expect(checkout.status).toBe(201);
    expect(checkout.body.mock).toBe(true);

    const status = await request(app.getHttpServer())
      .get('/api/billing')
      .set('Cookie', session.cookie);
    expect(status.body.plan).toBe('STARTER');

    expect((await createBot('Bot 2')).status).toBe(201);
  });

  it('rejects billing status without authentication', async () => {
    const res = await request(app.getHttpServer()).get('/api/billing');
    expect(res.status).toBe(401);
  });
});
