import { z } from 'zod';

export const queryNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isRead: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export type QueryNotificationsInput = z.infer<typeof queryNotificationsSchema>;
