import { z } from 'zod';
import { AssetStatus, AssetCondition } from '../../config/constants.js';

// ── Reusable Enum Values ──

const assetStatusValues = Object.values(AssetStatus) as [AssetStatus, ...AssetStatus[]];
const assetConditionValues = Object.values(AssetCondition) as [AssetCondition, ...AssetCondition[]];

// ── Create Asset Schema ──

export const createAssetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Asset name cannot be empty')
    .max(200, 'Asset name cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  departmentId: z.string().min(1, 'Department ID is required'),
  condition: z.enum(assetConditionValues).optional(),
  purchaseDate: z.coerce.date().optional(),
  purchaseCost: z
    .number()
    .positive('Purchase cost must be a positive number')
    .optional(),
  warrantyExpiry: z.coerce.date().optional(),
  serialNumber: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
  model: z.string().trim().optional(),
  location: z.string().trim().optional(),
  imageUrl: z.string().trim().url('Image URL must be a valid URL').optional(),
  notes: z
    .string()
    .trim()
    .max(5000, 'Notes cannot exceed 5000 characters')
    .optional(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;

// ── Update Asset Schema ──

export const updateAssetSchema = createAssetSchema.partial();

export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

// ── Query Assets Schema ──

export const queryAssetsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(assetStatusValues).optional(),
  condition: z.enum(assetConditionValues).optional(),
  departmentId: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().trim().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryAssetsInput = z.infer<typeof queryAssetsSchema>;

// ── Change Status Schema ──

export const changeStatusSchema = z.object({
  status: z.enum(assetStatusValues),
});

export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
