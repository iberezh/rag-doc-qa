'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getBilling, openPortal, startCheckout } from '@/lib/billing';
import type { BillingStatus, Plan } from '@/lib/types';

const PLAN_LABEL: Record<Plan, string> = {
  FREE: 'Free',
  STARTER: 'Starter · $29/mo',
  PRO: 'Pro · $99/mo',
};

export function BillingPanel() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getBilling()
      .then((found) => active && setStatus(found))
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

  return (
    <Card className="mb-6">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
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
      </CardContent>
    </Card>
  );
}
