import { z } from 'zod';

const MAX_QUERY_LENGTH = 2000;

export const ChatSchema = z.object({
  query: z.string().min(1).max(MAX_QUERY_LENGTH),
});

export type ChatInput = z.infer<typeof ChatSchema>;
