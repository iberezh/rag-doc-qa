import { API_BASE, errorMessage, jsonOf } from './api';
import type { BillingStatus } from './types';

export async function getBilling(): Promise<BillingStatus> {
  const res = await fetch(`${API_BASE}/billing`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return jsonOf<BillingStatus>(res);
}

export async function startCheckout(plan: 'STARTER' | 'PRO'): Promise<{ url: string }> {
  const res = await fetch(`${API_BASE}/billing/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return jsonOf<{ url: string }>(res);
}

export async function openPortal(): Promise<{ url: string }> {
  const res = await fetch(`${API_BASE}/billing/portal`, { method: 'POST', credentials: 'include' });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return jsonOf<{ url: string }>(res);
}
