import { z } from 'zod';
import { AuditStatus, AuditItemResult, AssetStatus } from '../../config/constants.js';

export const createAuditSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  scheduledDate: z.string().datetime(),
  departmentId: z.string().optional(),
  assignedAuditorIds: z.array(z.string()).min(1),
});

export const addAuditItemsSchema = z.object({
  items: z.array(
    z.object({
      assetId: z.string(),
      expectedStatus: z.nativeEnum(AssetStatus),
      expectedLocation: z.string().optional(),
    })
  ).min(1),
});

export const verifyAuditItemSchema = z.object({
  result: z.nativeEnum(AuditItemResult),
  actualStatus: z.nativeEnum(AssetStatus).optional(),
  actualLocation: z.string().optional(),
  notes: z.string().optional(),
});

export const queryAuditsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.nativeEnum(AuditStatus).optional(),
  departmentId: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
