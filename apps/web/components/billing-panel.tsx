'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { confirmCheckout, getBilling, openPortal, startCheckout } from '@/lib/billing';
import type { BillingStatus, Plan } from '@/lib/types';

const PLAN_LABEL: Record<Plan, string> = {
  FREE: 'Free',
  STARTER: 'Starter · $29/mo',
  PRO: 'Pro · $99/mo',
};

// Reads (and clears) the Checkout return params so the plan syncs without waiting on a webhook.
// `returned` flags that we came back from Checkout, so callers can re-sync the rest of the UI.
function consumeCheckoutReturn(): { sessionId: string | null; returned: boolean } {
  if (typeof window === 'undefined') return { sessionId: null, returned: false };
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  const returned = Boolean(sessionId) || params.has('checkout') || params.has('upgraded');
  if (returned) {
    window.history.replaceState({}, '', window.location.pathname);
  }
  return { sessionId, returned };
}

export function BillingPanel({ flat = false }: { flat?: boolean }) {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const { sessionId, returned } = consumeCheckoutReturn();
    const load = sessionId ? confirmCheckout(sessionId) : getBilling();
    load
      .then((found) => {
        if (!active) return;
        setStatus(found);
        // The plan is only persisted here (on the Checkout return). The header chip and the
        // widget-appearance panel read the plan independently via me(), so a one-time reload
        // re-syncs them to the new tier instead of leaving them stale until the next visit.
        if (returned) window.location.reload();
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!status) return null;

  const go = async (action: () => Promise<{ url: string }>): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      window.location.href = (await action()).url;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Billing failed');
      setBusy(false);
    }
  };

  const body = (
    <>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Plan
        </p>
        <p className="font-display text-lg font-semibold">{PLAN_LABEL[status.plan]}</p>
        <p className="text-sm text-muted-foreground">
          {status.bots}/{status.limits.bots} bots · {status.messagesUsed}/
          {status.limits.messagesPerMonth} messages this month
        </p>
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {status.plan === 'FREE' ? (
          <Button size="sm" disabled={busy} onClick={() => void go(() => startCheckout('STARTER'))}>
            Upgrade to Starter
          </Button>
        ) : null}
        {status.plan !== 'PRO' ? (
          <Button
            size="sm"
            variant={status.plan === 'FREE' ? 'outline' : 'default'}
            disabled={busy}
            onClick={() => void go(() => startCheckout('PRO'))}
          >
            Upgrade to Pro
          </Button>
        ) : null}
        {status.stripeEnabled && status.plan !== 'FREE' ? (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void go(openPortal)}>
            Manage billing
          </Button>
        ) : null}
      </div>
    </>
  );

  if (flat) {
    return <div className="flex flex-col gap-4">{body}</div>;
  }
  return (
    <Card className="mb-6">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">{body}</CardContent>
    </Card>
  );
}
