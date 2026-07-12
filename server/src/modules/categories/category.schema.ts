import { z } from 'zod';
import { CategoryStatus, CustomFieldType } from '../../config/constants.js';

export const customFieldSchema = z.object({
  name: z.string().min(1, 'Custom field name is required'),
  fieldType: z.nativeEnum(CustomFieldType),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID').optional(),
  customFields: z.array(customFieldSchema).default([]),
  status: z.nativeEnum(CategoryStatus).default(CategoryStatus.ACTIVE),
});

export const updateCategorySchema = createCategorySchema.partial();

export const queryCategoriesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(CategoryStatus).optional(),
  search: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type QueryCategoriesInput = z.infer<typeof queryCategoriesSchema>;
