import { z } from 'zod';
import { DepartmentStatus } from '../../config/constants.js';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(20).toUpperCase(),
  description: z.string().max(500).optional(),
  headId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid head user ID').optional(),
  status: z.nativeEnum(DepartmentStatus).default(DepartmentStatus.ACTIVE),
  budget: z.number().nonnegative().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const queryDepartmentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(DepartmentStatus).optional(),
  search: z.string().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type QueryDepartmentsInput = z.infer<typeof queryDepartmentsSchema>;
