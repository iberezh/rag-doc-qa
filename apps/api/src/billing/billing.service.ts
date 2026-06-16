import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Plan } from '@prisma/client';
import { AppConfigService } from '../config/app-config.service';
import { BillingRepository } from './billing.repository';
import { StripeService } from './stripe.service';
import type { BillingAccount, BillingStatus, CheckoutResult } from './billing.types';
import { limitsFor, type PaidPlan, planForPriceId, priceIdForPlan, usagePeriod } from './plans';

// The Stripe.Event union, sourced from the SDK without naming its `export =` namespace.
type StripeEvent = ReturnType<StripeService['constructEvent']>;

@Injectable()
export class BillingService {
  constructor(
    private readonly stripe: StripeService,
    private readonly repo: BillingRepository,
    private readonly config: AppConfigService,
  ) {}

  async status(accountId: string): Promise<BillingStatus> {
    const acct = await this.requireAccount(accountId);
    const [bots, messagesUsed] = await Promise.all([
      this.repo.countBots(accountId),
      this.repo.getUsage(accountId, usagePeriod(new Date())),
    ]);
    return {
      plan: acct.plan,
      limits: limitsFor(acct.plan),
      bots,
      messagesUsed,
      stripeEnabled: this.stripe.isEnabled(),
    };
  }

  async checkout(accountId: string, plan: PaidPlan, appUrl: string): Promise<CheckoutResult> {
    const acct = await this.requireAccount(accountId);
    if (!this.stripe.isEnabled()) {
      await this.repo.setPlan(accountId, plan); // mock upgrade — no real charge
      return { url: `${appUrl}?upgraded=${plan}`, mock: true };
    }
    const priceId = priceIdForPlan(plan, this.prices());
    if (!priceId) {
      throw new BadRequestException(`No Stripe price configured for ${plan}`);
    }
    const customerId = await this.stripe.ensureCustomer(acct.email, accountId, acct.stripeCustomerId);
    if (customerId !== acct.stripeCustomerId) {
      await this.repo.setStripeCustomer(accountId, customerId);
    }
    const url = await this.stripe.createCheckout({
      customerId,
      priceId,
      successUrl: `${appUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}?checkout=cancel`,
    });
    return { url, mock: false };
  }

  /** Syncs the plan from a returning Checkout Session, so upgrades land without a webhook. */
  async confirmCheckout(accountId: string, sessionId: string): Promise<BillingStatus> {
    if (this.stripe.isEnabled()) {
      const result = await this.stripe.retrieveCheckoutPlan(sessionId);
      const acct = await this.requireAccount(accountId);
      if (result && result.customerId === acct.stripeCustomerId) {
        await this.repo.setPlan(accountId, planForPriceId(result.priceId, this.prices()));
      }
    }
    return this.status(accountId);
  }

  async portal(accountId: string, returnUrl: string): Promise<string> {
    const acct = await this.requireAccount(accountId);
    if (!this.stripe.isEnabled() || !acct.stripeCustomerId) {
      throw new BadRequestException('Billing portal is not available');
    }
    return this.stripe.createPortal(acct.stripeCustomerId, returnUrl);
  }

  async applyEvent(event: StripeEvent): Promise<void> {
    if (event.type === 'customer.subscription.deleted') {
      await this.repo.setPlanByCustomer(customerId(event.data.object.customer), 'FREE');
      return;
    }
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const priceId = sub.items.data[0]?.price.id ?? '';
      await this.repo.setPlanByCustomer(customerId(sub.customer), planForPriceId(priceId, this.prices()));
    }
  }

  async assertCanCreateBot(accountId: string): Promise<void> {
    const acct = await this.requireAccount(accountId);
    const { bots } = limitsFor(acct.plan);
    if ((await this.repo.countBots(accountId)) >= bots) {
      throw new ForbiddenException(`Your ${acct.plan} plan allows ${bots} bot(s). Upgrade to add more.`);
    }
  }

  /** Returns true (and counts the message) if under the monthly cap, false if at it. */
  async consumeMessage(accountId: string): Promise<boolean> {
    const acct = await this.requireAccount(accountId);
    const period = usagePeriod(new Date());
    if ((await this.repo.getUsage(accountId, period)) >= limitsFor(acct.plan).messagesPerMonth) {
      return false;
    }
    await this.repo.incrementUsage(accountId, period);
    return true;
  }

  async accountPlan(accountId: string): Promise<Plan> {
    return (await this.requireAccount(accountId)).plan;
  }

  private prices(): { starter: string | undefined; pro: string | undefined } {
    return { starter: this.config.stripePriceStarter, pro: this.config.stripePricePro };
  }

  private async requireAccount(accountId: string): Promise<BillingAccount> {
    const acct = await this.repo.loadAccount(accountId);
    if (!acct) {
      throw new NotFoundException('Account not found');
    }
    return acct;
  }
}

function customerId(customer: string | { id: string }): string {
  return typeof customer === 'string' ? customer : customer.id;
}
