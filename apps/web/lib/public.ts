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

export async function captureLead(
  publicKey: string,
  conversationId: string,
  email: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/public/bots/${publicKey}/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, email }),
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
}

export interface PublicChatRequest {
  publicKey: string;
  query: string;
  host: string | null;
  signal?: AbortSignal;
}

export async function* streamPublicChat(req: PublicChatRequest): AsyncGenerator<ChatEvent> {
  const suffix = req.host ? `?o=${encodeURIComponent(req.host)}` : '';
  const res = await fetch(`${API_BASE}/public/bots/${req.publicKey}/chat${suffix}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: req.query }),
    signal: req.signal ?? null,
  });
  if (!res.ok || !res.body) {
    throw new Error(await errorMessage(res));
  }
  yield* parseSse(res.body);
}
