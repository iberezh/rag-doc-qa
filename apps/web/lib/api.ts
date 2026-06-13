import type { ChatEvent, IngestSummary, LibraryDoc } from './types';
import { parseSse } from './sse';

// Same-origin by default: requests hit /api/* on the web origin and Next proxies them to the
// API (see next.config.mjs), keeping the httpOnly auth cookie first-party.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

// fetch() resolves JSON as unknown; the response shape is the server's Zod-validated API contract.
export const jsonOf = <T>(res: Response): Promise<T> => res.json() as Promise<T>;

export async function errorMessage(res: Response): Promise<string> {
  const fallback = `Request failed (${res.status})`;
  try {
    const data = await jsonOf<{ message?: string | string[] }>(res);
    const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    return message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function listDocuments(botId: string): Promise<LibraryDoc[]> {
  const res = await fetch(`${API_BASE}/bots/${botId}/documents`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return jsonOf<LibraryDoc[]>(res);
}

export async function ingestText(
  botId: string,
  text: string,
  filename?: string,
): Promise<IngestSummary> {
  const body = filename ? { text, filename } : { text };
  const res = await fetch(`${API_BASE}/bots/${botId}/documents/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return jsonOf<IngestSummary>(res);
}

export async function ingestFile(botId: string, file: File): Promise<IngestSummary> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/bots/${botId}/documents`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return jsonOf<IngestSummary>(res);
}

export async function deleteDocument(botId: string, docId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/bots/${botId}/documents/${docId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
}

export async function* streamChat(
  botId: string,
  query: string,
  signal?: AbortSignal,
): AsyncGenerator<ChatEvent> {
  const res = await fetch(`${API_BASE}/bots/${botId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ query }),
    signal: signal ?? null,
  });
  if (!res.ok || !res.body) {
    throw new Error(await errorMessage(res));
  }
  yield* parseSse(res.body);
}
