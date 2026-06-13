import { z } from 'zod';

export const LeadSchema = z.object({
  conversationId: z.string().uuid(),
  email: z.string().email(),
});

export type LeadInput = z.infer<typeof LeadSchema>;
