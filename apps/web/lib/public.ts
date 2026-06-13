import { API_BASE, errorMessage, jsonOf } from './api';
import { parseSse } from './sse';
import type { ChatEvent } from './types';

export interface PublicBotConfig {
  name: string;
  greeting: string;
  color: string;
  showBadge: boolean;
}

export async function getPublicBot(publicKey: string): Promise<PublicBotConfig> {
  const res = await fetch(`${API_BASE}/public/bots/${publicKey}`);
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return jsonOf<PublicBotConfig>(res);
}

export async function* streamPublicChat(
  publicKey: string,
  query: string,
  host: string | null,
  signal?: AbortSignal,
): AsyncGenerator<ChatEvent> {
  const suffix = host ? `?o=${encodeURIComponent(host)}` : '';
  const res = await fetch(`${API_BASE}/public/bots/${publicKey}/chat${suffix}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal: signal ?? null,
  });
  if (!res.ok || !res.body) {
    throw new Error(await errorMessage(res));
  }
  yield* parseSse(res.body);
}
