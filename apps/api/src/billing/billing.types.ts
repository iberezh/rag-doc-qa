import type { Plan } from '@prisma/client';
import type { PlanLimits } from './plans';

export interface BillingAccount {
  id: string;
  plan: Plan;
  stripeCustomerId: string | null;
  email: string;
}

export interface BillingStatus {
  plan: Plan;
  limits: PlanLimits;
  bots: number;
  messagesUsed: number;
  stripeEnabled: boolean;
}

export interface CheckoutResult {
  url: string;
  mock: boolean;
}
