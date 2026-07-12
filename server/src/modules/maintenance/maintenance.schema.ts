import { z } from 'zod';
import { MaintenancePriority, MaintenanceStatus } from '../../config/constants.js';

// ── Create ─────────────────────────────────────────────────────
export const createMaintenanceSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.nativeEnum(MaintenancePriority).optional(),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;

// ── Approve ────────────────────────────────────────────────────
export const approveMaintenanceSchema = z.object({
  notes: z.string().optional(),
});

export type ApproveMaintenanceInput = z.infer<typeof approveMaintenanceSchema>;

// ── Assign Technician ──────────────────────────────────────────
export const assignTechnicianSchema = z.object({
  assignedToId: z.string().min(1, 'Technician user ID is required'),
});

export type AssignTechnicianInput = z.infer<typeof assignTechnicianSchema>;

// ── Update Progress ────────────────────────────────────────────
export const updateProgressSchema = z.object({
  diagnosis: z.string().optional(),
  status: z.literal(MaintenanceStatus.IN_PROGRESS),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

// ── Resolve ────────────────────────────────────────────────────
export const resolveMaintenanceSchema = z.object({
  resolution: z.string().min(1, 'Resolution is required'),
  cost: z.number().positive('Cost must be a positive number').optional(),
  diagnosis: z.string().optional(),
});

export type ResolveMaintenanceInput = z.infer<typeof resolveMaintenanceSchema>;

// ── Reject ─────────────────────────────────────────────────────
export const rejectMaintenanceSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

export type RejectMaintenanceInput = z.infer<typeof rejectMaintenanceSchema>;

// ── Query ──────────────────────────────────────────────────────
export const queryMaintenanceSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(MaintenanceStatus).optional(),
  priority: z.nativeEnum(MaintenancePriority).optional(),
  assetId: z.string().optional(),
  assignedToId: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryMaintenanceInput = z.infer<typeof queryMaintenanceSchema>;
