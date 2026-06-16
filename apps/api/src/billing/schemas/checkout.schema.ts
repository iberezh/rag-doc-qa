import { z } from 'zod';

export const CheckoutSchema = z.object({
  plan: z.enum(['STARTER', 'PRO']),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
