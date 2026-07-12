import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../common/utils/response.js';
import { CategoryService } from './category.service.js';

/**
 * POST / — Create a new category (Admin & Asset Manager only)
 */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.create(req.body, req.user!._id);
  sendCreated(res, category, 'Category created successfully');
});

/**
 * GET / — List categories (Any authenticated user)
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const { data, total, page, limit } = await CategoryService.getAll(req.query as any);
  sendPaginated(res, data, total, page, limit, 'Categories retrieved successfully');
});

/**
 * GET /:id — Get a single category by ID (Any authenticated user)
 */
export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.getById(req.params.id as string);
  sendSuccess(res, category, 'Category retrieved successfully');
});

/**
 * PUT /:id — Update category details (Admin & Asset Manager only)
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.update(req.params.id as string, req.body, req.user!._id);
  sendSuccess(res, category, 'Category updated successfully');
});

/**
 * DELETE /:id — Delete a category (Admin & Asset Manager only)
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.delete(req.params.id as string, req.user!._id);
  sendSuccess(res, category, 'Category deleted successfully');
});
