import { API_BASE, errorMessage, jsonOf } from './api';
import type { BotAnalytics } from './types';

export async function getAnalytics(botId: string, signal?: AbortSignal): Promise<BotAnalytics> {
  const res = await fetch(`${API_BASE}/bots/${botId}/analytics`, {
    credentials: 'include',
    signal: signal ?? null,
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return jsonOf<BotAnalytics>(res);
}
