import { z } from 'zod';

export const ChatSchema = z.object({
  query: z.string().min(1),
});

export type ChatInput = z.infer<typeof ChatSchema>;
