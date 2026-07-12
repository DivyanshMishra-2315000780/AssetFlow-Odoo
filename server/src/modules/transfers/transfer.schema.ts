import { z } from 'zod';
import { TransferStatus, AllocatedToType } from '../../config/constants.js';

// ── Create Transfer Request ────────────────────────────────
export const createTransferSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  toUserId: z.string().min(1, 'Target user ID is required'),
  toType: z.enum(Object.values(AllocatedToType) as [string, ...string[]]),
  reason: z.string().min(1, 'Reason is required').max(2000),
});
export type CreateTransferInput = z.infer<typeof createTransferSchema>;

// ── Approve Transfer ───────────────────────────────────────
export const approveTransferSchema = z.object({
  approvalNotes: z.string().max(1000).optional(),
});
export type ApproveTransferInput = z.infer<typeof approveTransferSchema>;

// ── Reject Transfer ────────────────────────────────────────
export const rejectTransferSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required').max(2000),
});
export type RejectTransferInput = z.infer<typeof rejectTransferSchema>;

// ── Query Transfers ────────────────────────────────────────
export const queryTransfersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(Object.values(TransferStatus) as [string, ...string[]])
    .optional(),
  assetId: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'completedAt', 'status'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type QueryTransfersInput = z.infer<typeof queryTransfersSchema>;
