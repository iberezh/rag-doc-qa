import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './env.schema';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get port(): number {
    return this.config.get('PORT', { infer: true });
  }

  get corsOrigin(): string {
    return this.config.get('CORS_ORIGIN', { infer: true });
  }

  get databaseUrl(): string {
    return this.config.get('DATABASE_URL', { infer: true });
  }

  get jwtSecret(): string {
    return this.config.get('JWT_SECRET', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get groqApiKey(): string | undefined {
    return this.config.get('GROQ_API_KEY', { infer: true });
  }

  get stripeSecretKey(): string | undefined {
    return this.config.get('STRIPE_SECRET_KEY', { infer: true });
  }

  get stripeWebhookSecret(): string | undefined {
    return this.config.get('STRIPE_WEBHOOK_SECRET', { infer: true });
  }

  get stripePriceStarter(): string | undefined {
    return this.config.get('STRIPE_PRICE_STARTER', { infer: true });
  }

  get stripePricePro(): string | undefined {
    return this.config.get('STRIPE_PRICE_PRO', { infer: true });
  }
}
