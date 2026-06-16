import { z } from 'zod';

export const ConfirmSchema = z.object({
  sessionId: z.string().min(1),
});

export type ConfirmInput = z.infer<typeof ConfirmSchema>;
