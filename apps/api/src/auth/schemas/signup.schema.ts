import { z } from 'zod';

export const SignupSchema = z.object({
  accountName: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export type SignupInput = z.infer<typeof SignupSchema>;
