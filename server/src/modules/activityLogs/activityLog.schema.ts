import { z } from 'zod';

export const queryActivityLogsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional(),
  action: z.string().optional(),
  module: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type QueryActivityLogsInput = z.infer<typeof queryActivityLogsSchema>;
