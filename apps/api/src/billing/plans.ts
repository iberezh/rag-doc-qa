import type { Plan } from '@prisma/client';

export interface PlanLimits {
  bots: number;
  messagesPerMonth: number;
  badgeRemoval: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: { bots: 1, messagesPerMonth: 100, badgeRemoval: false },
  STARTER: { bots: 3, messagesPerMonth: 2000, badgeRemoval: true },
  PRO: { bots: 10, messagesPerMonth: 20000, badgeRemoval: true },
};

export type PaidPlan = 'STARTER' | 'PRO';

export interface PriceMap {
  starter?: string | undefined;
  pro?: string | undefined;
}

export const limitsFor = (plan: Plan): PlanLimits => PLAN_LIMITS[plan];

export const priceIdForPlan = (plan: PaidPlan, prices: PriceMap): string | undefined =>
  plan === 'STARTER' ? prices.starter : prices.pro;

export function planForPriceId(priceId: string, prices: PriceMap): Plan {
  if (priceId === prices.pro) return 'PRO';
  if (priceId === prices.starter) return 'STARTER';
  return 'FREE';
}

/** Billing-month key ("YYYY-MM", UTC) for usage metering. */
export function usagePeriod(date: Date): string {
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}`;
}
