import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { AppConfigService } from '../config/app-config.service';

interface CheckoutInput {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

/** Thin wrapper over the Stripe SDK. Null client when no key — callers fall back to mock. */
type StripeClient = InstanceType<typeof Stripe>;

@Injectable()
export class StripeService {
  private readonly client: StripeClient | null;

  constructor(private readonly config: AppConfigService) {
    const key = config.stripeSecretKey;
    this.client = key ? new Stripe(key) : null;
  }

  isEnabled(): boolean {
    return this.client !== null;
  }

  private require(): StripeClient {
    if (!this.client) {
      throw new Error('Stripe is not configured');
    }
    return this.client;
  }

  async ensureCustomer(email: string, accountId: string, existing: string | null): Promise<string> {
    if (existing) {
      return existing;
    }
    const customer = await this.require().customers.create({ email, metadata: { accountId } });
    return customer.id;
  }

  async createCheckout(input: CheckoutInput): Promise<string> {
    const session = await this.require().checkout.sessions.create({
      mode: 'subscription',
      customer: input.customerId,
      line_items: [{ price: input.priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    });
    return session.url ?? input.successUrl;
  }

  // Reads a completed Checkout Session so the app can sync the plan on return (no webhook needed).
  async retrieveCheckoutPlan(
    sessionId: string,
  ): Promise<{ customerId: string; priceId: string } | null> {
    const session = await this.require().checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });
    const sub = session.subscription;
    if (session.status !== 'complete' || !sub || typeof sub === 'string') {
      return null;
    }
    const priceId = sub.items.data[0]?.price.id;
    const customer = session.customer;
    const customerId = typeof customer === 'string' ? customer : (customer?.id ?? '');
    return priceId && customerId ? { customerId, priceId } : null;
  }

  async createPortal(customerId: string, returnUrl: string): Promise<string> {
    const session = await this.require().billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  }

  // Return type inferred as Stripe.Event (the SDK's `export =` namespace doesn't qualify cleanly).
  constructEvent(rawBody: Buffer, signature: string) {
    const secret = this.config.stripeWebhookSecret;
    if (!secret) {
      throw new Error('Stripe webhook secret is not configured');
    }
    return this.require().webhooks.constructEvent(rawBody, signature, secret);
  }
}
