import { z } from 'zod';

export const UpdateBotSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  allowedDomains: z.array(z.string().max(253)).max(50).optional(),
  greeting: z.string().min(1).max(280).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  showBadge: z.boolean().optional(),
});

export type UpdateBotInput = z.infer<typeof UpdateBotSchema>;
