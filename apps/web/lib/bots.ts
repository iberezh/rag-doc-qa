import { API_BASE, errorMessage, jsonOf } from './api';
import type { Bot } from './types';

export type BotPatch = Partial<
  Pick<
    Bot,
    'name' | 'allowedDomains' | 'greeting' | 'color' | 'launcherIcon' | 'iconColor' | 'showBadge'
  >
>;

async function asBot(res: Response): Promise<Bot> {
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return jsonOf<Bot>(res);
}

export async function listBots(): Promise<Bot[]> {
  const res = await fetch(`${API_BASE}/bots`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return jsonOf<Bot[]>(res);
}

export const getBot = (botId: string): Promise<Bot> =>
  fetch(`${API_BASE}/bots/${botId}`, { credentials: 'include' }).then(asBot);

export const createBot = (name: string): Promise<Bot> =>
  fetch(`${API_BASE}/bots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name }),
  }).then(asBot);

export const updateBot = (botId: string, patch: BotPatch): Promise<Bot> =>
  fetch(`${API_BASE}/bots/${botId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(patch),
  }).then(asBot);

export async function deleteBot(botId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/bots/${botId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
}
