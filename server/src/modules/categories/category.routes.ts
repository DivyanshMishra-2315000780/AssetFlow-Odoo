import { Router } from 'express';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { validate } from '../../common/middleware/validate.js';
import { UserRole } from '../../config/constants.js';
import {
  createCategorySchema,
  updateCategorySchema,
  queryCategoriesSchema,
} from './category.schema.js';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from './category.controller.js';

const router = Router();

// POST / — Create a new category (Admin & Asset Manager only)
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  validate(createCategorySchema),
  createCategory
);

// GET / — List categories (Any authenticated user)
router.get(
  '/',
  authenticate,
  validate(queryCategoriesSchema, 'query'),
  getCategories
);

// GET /:id — Get single category details (Any authenticated user)
router.get('/:id', authenticate, getCategory);

// PUT /:id — Update category details (Admin & Asset Manager only)
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  validate(updateCategorySchema),
  updateCategory
);

// DELETE /:id — Delete category (Admin & Asset Manager only)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  deleteCategory
);

export default router;
