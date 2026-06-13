import type { INestApplication } from '@nestjs/common';
import request, { type Response } from 'supertest';

// superagent types set-cookie as a string, but Node delivers the cookie list as string[].
export const cookiesOf = (res: Response): string[] =>
  res.headers['set-cookie'] as unknown as string[];

export interface Session {
  cookie: string[];
  accountId: string;
}

/** Signs up a fresh tenant and returns its auth cookie + account id (for scoped e2e calls). */
export async function signup(app: INestApplication, label: string): Promise<Session> {
  const email = `${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@e2e.test`;
  const res = await request(app.getHttpServer())
    .post('/api/auth/signup')
    .send({ accountName: label, email, password: 'longpassword' });
  return { cookie: cookiesOf(res), accountId: res.body.account.id };
}

/** Creates a bot for the session and returns its id. */
export async function createBot(
  app: INestApplication,
  cookie: string[],
  name: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/api/bots')
    .set('Cookie', cookie)
    .send({ name });
  return res.body.id;
}
