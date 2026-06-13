import { API_BASE, errorMessage, jsonOf } from './api';
import type { Profile } from './types';

export interface SignupInput {
  accountName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function post(path: string, body?: unknown): Promise<Response> {
  const init: RequestInit = { method: 'POST', credentials: 'include' };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  return fetch(`${API_BASE}${path}`, init);
}

async function profileOrThrow(res: Response): Promise<Profile> {
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return jsonOf<Profile>(res);
}

export const signup = (input: SignupInput): Promise<Profile> =>
  post('/auth/signup', input).then(profileOrThrow);

export const login = (input: LoginInput): Promise<Profile> =>
  post('/auth/login', input).then(profileOrThrow);

export const logout = async (): Promise<void> => {
  await post('/auth/logout');
};

export async function me(): Promise<Profile | null> {
  const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
  return res.ok ? jsonOf<Profile>(res) : null;
}
