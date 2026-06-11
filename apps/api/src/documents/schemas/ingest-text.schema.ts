import { z } from 'zod';

const MAX_FILENAME_LENGTH = 255;

export const IngestTextSchema = z.object({
  text: z.string().min(1),
  filename: z.string().min(1).max(MAX_FILENAME_LENGTH).optional(),
});

export type IngestTextInput = z.infer<typeof IngestTextSchema>;
