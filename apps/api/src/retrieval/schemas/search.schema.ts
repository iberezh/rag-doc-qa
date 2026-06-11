import { z } from 'zod';
import { DEFAULT_TOP_K, MAX_TOP_K } from '../retrieval.constants';

export const SearchSchema = z.object({
  query: z.string().min(1),
  limit: z.coerce.number().int().positive().max(MAX_TOP_K).default(DEFAULT_TOP_K),
});

export type SearchInput = z.infer<typeof SearchSchema>;
