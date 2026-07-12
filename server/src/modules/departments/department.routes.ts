import { Router } from 'express';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { validate } from '../../common/middleware/validate.js';
import { UserRole } from '../../config/constants.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  queryDepartmentsSchema,
} from './department.schema.js';
import {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from './department.controller.js';

const router = Router();

// POST / — Create a new department (Admin only)
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createDepartmentSchema),
  createDepartment
);

// GET / — List departments (Any authenticated user)
router.get(
  '/',
  authenticate,
  validate(queryDepartmentsSchema, 'query'),
  getDepartments
);

// GET /:id — Get single department details (Any authenticated user)
router.get('/:id', authenticate, getDepartment);

// PUT /:id — Update department details (Admin only)
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateDepartmentSchema),
  updateDepartment
);

// DELETE /:id — Delete department (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteDepartment
);

export default router;
