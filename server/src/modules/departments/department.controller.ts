import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../common/utils/response.js';
import { DepartmentService } from './department.service.js';

/**
 * POST / — Create a new department (Admin only)
 */
export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const department = await DepartmentService.create(req.body, req.user!._id);
  sendCreated(res, department, 'Department created successfully');
});

/**
 * GET / — List departments (Any authenticated user)
 */
export const getDepartments = asyncHandler(async (req: Request, res: Response) => {
  const { data, total, page, limit } = await DepartmentService.getAll(req.query as any);
  sendPaginated(res, data, total, page, limit, 'Departments retrieved successfully');
});

/**
 * GET /:id — Get a single department by ID (Any authenticated user)
 */
export const getDepartment = asyncHandler(async (req: Request, res: Response) => {
  const department = await DepartmentService.getById(req.params.id as string);
  sendSuccess(res, department, 'Department retrieved successfully');
});

/**
 * PUT /:id — Update department details (Admin only)
 */
export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const department = await DepartmentService.update(req.params.id as string, req.body, req.user!._id);
  sendSuccess(res, department, 'Department updated successfully');
});

/**
 * DELETE /:id — Delete a department (Admin only)
 */
export const deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
  const department = await DepartmentService.delete(req.params.id as string, req.user!._id);
  sendSuccess(res, department, 'Department deleted successfully');
});
