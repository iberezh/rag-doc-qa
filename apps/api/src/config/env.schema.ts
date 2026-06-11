import { z } from 'zod';

const DEFAULT_PORT = 4000;
const DEFAULT_CORS_ORIGIN = 'http://localhost:3000';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
  CORS_ORIGIN: z.string().url().default(DEFAULT_CORS_ORIGIN),
  // Required from Phase 1 (DB); optional now so the app boots during scaffold.
  DATABASE_URL: z.string().url().optional(),
  // Optional: absent means the mock LLM is used (default in tests/CI).
  GROQ_API_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const validateEnv = (config: Record<string, unknown>): Env => EnvSchema.parse(config);
