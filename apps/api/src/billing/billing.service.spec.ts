import { ForbiddenException } from '@nestjs/common';
import type { Plan } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { AppConfigService } from '../config/app-config.service';
import { BillingRepository } from './billing.repository';
import { BillingService } from './billing.service';
import type { BillingAccount } from './billing.types';
import { StripeService } from './stripe.service';

function account(overrides: Partial<BillingAccount> = {}): BillingAccount {
  return { id: 'a1', plan: 'FREE', stripeCustomerId: null, email: 'owner@acme.com', ...overrides };
}

function build() {
  const stripe = mockDeep<StripeService>();
  const repo = mockDeep<BillingRepository>();
  const config = mockDeep<AppConfigService>();
  Object.defineProperty(config, 'stripePriceStarter', { get: () => 'price_s' });
  Object.defineProperty(config, 'stripePricePro', { get: () => 'price_p' });
  return { stripe, repo, config, service: new BillingService(stripe, repo, config) };
}

describe('BillingService', () => {
  it('mock checkout (Stripe disabled) flips the plan locally', async () => {
    const { stripe, repo, service } = build();
    stripe.isEnabled.mockReturnValue(false);
    repo.loadAccount.mockResolvedValue(account());

    const result = await service.checkout('a1', 'STARTER', 'http://web/app');

    expect(result.mock).toBe(true);
    expect(repo.setPlan).toHaveBeenCalledWith('a1', 'STARTER');
  });

  it('real checkout creates a Stripe session for the plan price', async () => {
    const { stripe, repo, service } = build();
    stripe.isEnabled.mockReturnValue(true);
    repo.loadAccount.mockResolvedValue(account());
    stripe.ensureCustomer.mockResolvedValue('cus_1');
    stripe.createCheckout.mockResolvedValue('https://checkout.stripe/session');

    const result = await service.checkout('a1', 'PRO', 'http://web/app');

    expect(stripe.createCheckout).toHaveBeenCalledWith(expect.objectContaining({ priceId: 'price_p' }));
    expect(repo.setStripeCustomer).toHaveBeenCalledWith('a1', 'cus_1');
    expect(result).toEqual({ url: 'https://checkout.stripe/session', mock: false });
  });

  it('confirmCheckout syncs the plan from a returning session for the matching customer', async () => {
    const { stripe, repo, service } = build();
    stripe.isEnabled.mockReturnValue(true);
    repo.loadAccount.mockResolvedValue(account({ stripeCustomerId: 'cus_1' }));
    stripe.retrieveCheckoutPlan.mockResolvedValue({ customerId: 'cus_1', priceId: 'price_p' });
    repo.countBots.mockResolvedValue(0);
    repo.getUsage.mockResolvedValue(0);

    await service.confirmCheckout('a1', 'cs_test_1');

    expect(repo.setPlan).toHaveBeenCalledWith('a1', 'PRO');
  });

  it('confirmCheckout ignores a session belonging to a different customer', async () => {
    const { stripe, repo, service } = build();
    stripe.isEnabled.mockReturnValue(true);
    repo.loadAccount.mockResolvedValue(account({ stripeCustomerId: 'cus_1' }));
    stripe.retrieveCheckoutPlan.mockResolvedValue({ customerId: 'cus_other', priceId: 'price_p' });
    repo.countBots.mockResolvedValue(0);
    repo.getUsage.mockResolvedValue(0);

    await service.confirmCheckout('a1', 'cs_test_1');

    expect(repo.setPlan).not.toHaveBeenCalled();
  });

  it('a subscription event maps the price to a plan for that customer', async () => {
    const { repo, service } = build();
    const event = {
      type: 'customer.subscription.updated',
      data: { object: { customer: 'cus_9', items: { data: [{ price: { id: 'price_p' } }] } } },
    } as unknown as Parameters<BillingService["applyEvent"]>[0];

    await service.applyEvent(event);

    expect(repo.setPlanByCustomer).toHaveBeenCalledWith('cus_9', 'PRO');
  });

  it('a canceled subscription downgrades the customer to FREE', async () => {
    const { repo, service } = build();
    const event = {
      type: 'customer.subscription.deleted',
      data: { object: { customer: 'cus_9', items: { data: [] } } },
    } as unknown as Parameters<BillingService["applyEvent"]>[0];

    await service.applyEvent(event);

    expect(repo.setPlanByCustomer).toHaveBeenCalledWith('cus_9', 'FREE');
  });

  it('blocks creating a bot beyond the plan limit', async () => {
    const { repo, service } = build();
    repo.loadAccount.mockResolvedValue(account({ plan: 'FREE' }));
    repo.countBots.mockResolvedValue(1); // FREE allows 1

    await expect(service.assertCanCreateBot('a1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('consumeMessage allows under the cap and increments, blocks at the cap', async () => {
    const { repo, service } = build();
    repo.loadAccount.mockResolvedValue(account({ plan: 'FREE' }));
    repo.getUsage.mockResolvedValueOnce(5);
    await expect(service.consumeMessage('a1')).resolves.toBe(true);
    expect(repo.incrementUsage).toHaveBeenCalled();

    const atCap: Plan = 'FREE';
    repo.loadAccount.mockResolvedValue(account({ plan: atCap }));
    repo.getUsage.mockResolvedValueOnce(100); // FREE cap
    await expect(service.consumeMessage('a1')).resolves.toBe(false);
  });
});
