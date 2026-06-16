import { z } from 'zod';

const DEFAULT_PORT = 4000;
const DEFAULT_CORS_ORIGIN = 'http://localhost:3000';

// An empty env value ("VAR=") is treated as unset, so blank optional vars don't fail validation.
const optionalSecret = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
);

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
  CORS_ORIGIN: z.string().url().default(DEFAULT_CORS_ORIGIN),
  DATABASE_URL: z.string().url(),
  // Signs the auth JWT. Required: the app refuses to start without it (no insecure default).
  JWT_SECRET: z.string().min(16),
  // Optional: absent means the mock LLM is used (default in tests/CI).
  GROQ_API_KEY: optionalSecret,
  // Billing (all optional): absent STRIPE_SECRET_KEY → mock upgrades, no real charges.
  STRIPE_SECRET_KEY: optionalSecret,
  STRIPE_WEBHOOK_SECRET: optionalSecret,
  STRIPE_PRICE_STARTER: optionalSecret,
  STRIPE_PRICE_PRO: optionalSecret,
});

export type Env = z.infer<typeof EnvSchema>;

export const validateEnv = (config: Record<string, unknown>): Env => EnvSchema.parse(config);
