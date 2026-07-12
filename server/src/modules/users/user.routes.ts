import { Router } from 'express';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { validate } from '../../common/middleware/validate.js';
import { UserRole } from '../../config/constants.js';
import {
  queryUsersSchema,
  adminUpdateUserSchema,
  updateRoleSchema,
  updateStatusSchema,
} from './user.schema.js';
import {
  getUsers,
  getDirectory,
  getUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from './user.controller.js';

const router = Router();

// GET /directory — Public employee directory (Any authenticated user)
router.get(
  '/directory',
  authenticate,
  validate(queryUsersSchema, 'query'),
  getDirectory
);

// GET / — List all users (Admin & Asset Manager only)
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  validate(queryUsersSchema, 'query'),
  getUsers
);

// GET /:id — Get single user details
router.get('/:id', authenticate, getUser);

// PUT /:id — Update user profile (Self or Admin)
router.put(
  '/:id',
  authenticate,
  validate(adminUpdateUserSchema),
  updateUser
);

// PATCH /:id/role — Change user role (Admin only)
router.patch(
  '/:id/role',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateRoleSchema),
  updateUserRole
);

// PATCH /:id/status — Change user status (Admin only)
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateStatusSchema),
  updateUserStatus
);

// DELETE /:id — Delete user (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteUser
);

export default router;
