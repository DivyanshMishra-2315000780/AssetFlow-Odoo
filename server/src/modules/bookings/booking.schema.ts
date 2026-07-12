import { z } from 'zod';
import { BookingStatus } from '../../config/constants.js';

// ── Create ─────────────────────────────────────────────────────
export const createBookingSchema = z
  .object({
    resourceId: z.string().min(1, 'Resource ID is required'),
    startTime: z.coerce
      .date()
      .refine((d) => d.getTime() > Date.now(), { message: 'Start time must be in the future' }),
    endTime: z.coerce.date(),
    purpose: z.string().min(3, 'Purpose must be at least 3 characters'),
    notes: z.string().optional(),
  })
  .refine((data) => data.endTime.getTime() > data.startTime.getTime(), {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ── Cancel ─────────────────────────────────────────────────────
export const cancelBookingSchema = z.object({
  cancellationReason: z.string().min(1, 'Cancellation reason is required'),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

// ── Query ──────────────────────────────────────────────────────
export const queryBookingsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  resourceId: z.string().optional(),
  bookedById: z.string().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.string().default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type QueryBookingsInput = z.infer<typeof queryBookingsSchema>;
