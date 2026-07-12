import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../../common/utils/response.js';
import { UserService } from './user.service.js';

/**
 * GET / — List all users (Admin/Asset Manager only)
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { data, total, page, limit } = await UserService.getAll(req.query as any);
  sendPaginated(res, data, total, page, limit, 'Users retrieved successfully');
});

/**
 * GET /directory — Employee Directory (Any authenticated user)
 */
export const getDirectory = asyncHandler(async (req: Request, res: Response) => {
  const { data, total, page, limit } = await UserService.getDirectory(req.query as any);
  sendPaginated(res, data, total, page, limit, 'Employee directory retrieved successfully');
});

/**
 * GET /:id — Get user by ID
 */
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.getById(req.params.id as string);
  sendSuccess(res, user, 'User retrieved successfully');
});

/**
 * PUT /:id — Update user profile
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const actor = { _id: req.user!._id, role: req.user!.role };
  const user = await UserService.update(req.params.id as string, req.body, actor);
  sendSuccess(res, user, 'User profile updated successfully');
});

/**
 * PATCH /:id/role — Change user role (Admin only)
 */
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.updateRole(req.params.id as string, req.body.role, req.user!._id);
  sendSuccess(res, user, 'User role updated successfully');
});

/**
 * PATCH /:id/status — Change user status (Admin only)
 */
export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.updateStatus(req.params.id as string, req.body.status, req.user!._id);
  sendSuccess(res, user, 'User status updated successfully');
});

/**
 * DELETE /:id — Delete user (Admin only)
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.delete(req.params.id as string, req.user!._id);
  sendSuccess(res, user, 'User deleted successfully');
});
