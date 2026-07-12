import { z } from 'zod';
import { AllocationStatus, AllocatedToType, AssetCondition } from '../../config/constants.js';

// ── Create Allocation ──────────────────────────────────────
export const createAllocationSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  allocatedToId: z.string().min(1, 'Allocated-to ID is required'),
  allocatedToType: z.enum(
    Object.values(AllocatedToType) as [string, ...string[]],
  ),
  expectedReturnDate: z
    .string()
    .datetime({ message: 'Expected return date must be a valid ISO date' })
    .optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateAllocationInput = z.infer<typeof createAllocationSchema>;

// ── Return Request (by holder) ─────────────────────────────
export const returnRequestSchema = z.object({
  returnNotes: z.string().max(1000).optional(),
});
export type ReturnRequestInput = z.infer<typeof returnRequestSchema>;

// ── Process Return (by admin/manager) ──────────────────────
export const processReturnSchema = z.object({
  returnCondition: z.enum(
    Object.values(AssetCondition) as [string, ...string[]],
  ),
  returnNotes: z.string().max(1000).optional(),
});
export type ProcessReturnInput = z.infer<typeof processReturnSchema>;

// ── Query Allocations ──────────────────────────────────────
export const queryAllocationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(Object.values(AllocationStatus) as [string, ...string[]])
    .optional(),
  assetId: z.string().optional(),
  allocatedToId: z.string().optional(),
  sortBy: z
    .enum(['allocatedAt', 'expectedReturnDate', 'createdAt', 'status'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type QueryAllocationsInput = z.infer<typeof queryAllocationsSchema>;
