import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cookiesOf } from './e2e-utils';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const accountIds: string[] = [];
  const email = `owner+${Date.now()}@acme.test`;
  const password = 'longpassword';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.init();
    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.account.deleteMany({ where: { id: { in: accountIds } } });
    await app.close();
  });

  it('signup creates an account, sets an httpOnly cookie, and never leaks the token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ accountName: 'Acme', email, password });

    expect(res.status).toBe(201);
    expect(res.body.account.name).toBe('Acme');
    expect(res.body.account.plan).toBe('FREE');
    expect(res.body.user.email).toBe(email);
    expect(res.body.token).toBeUndefined();

    const setCookie = cookiesOf(res);
    expect(setCookie.join(';')).toContain('helpbase_token=');
    expect(setCookie.join(';')).toMatch(/HttpOnly/i);

    accountIds.push(res.body.account.id);
  });

  it('rejects a duplicate email with 409', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ accountName: 'Acme Two', email, password });

    expect(res.status).toBe(409);
  });

  it('rejects login with a wrong password (401)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  it('logs in with valid credentials and returns the profile', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
  });

  it('rejects GET /me without a cookie (401)', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the current profile for GET /me with the auth cookie', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });
    const cookie = cookiesOf(login);

    const res = await request(app.getHttpServer()).get('/api/auth/me').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
    expect(res.body.account.plan).toBe('FREE');
  });
});
