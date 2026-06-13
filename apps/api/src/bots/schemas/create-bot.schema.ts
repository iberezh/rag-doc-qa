import { z } from 'zod';

export const CreateBotSchema = z.object({
  name: z.string().min(1).max(80),
});

export type CreateBotInput = z.infer<typeof CreateBotSchema>;
