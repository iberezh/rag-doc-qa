import type { ChatEvent, IngestSummary } from './types';
import { parseSse } from './sse';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function errorMessage(res: Response): Promise<string> {
  const fallback = `Request failed (${res.status})`;
  try {
    const data = (await res.json()) as { message?: string | string[] };
    const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    return message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function ingestText(text: string, filename?: string): Promise<IngestSummary> {
  const body = filename ? { text, filename } : { text };
  const res = await fetch(`${API_BASE}/documents/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return res.json() as Promise<IngestSummary>;
}

export async function ingestFile(file: File): Promise<IngestSummary> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/documents`, { method: 'POST', body: form });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return res.json() as Promise<IngestSummary>;
}

export async function* streamChat(query: string): AsyncGenerator<ChatEvent> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok || !res.body) {
    throw new Error(await errorMessage(res));
  }
  yield* parseSse(res.body);
}
