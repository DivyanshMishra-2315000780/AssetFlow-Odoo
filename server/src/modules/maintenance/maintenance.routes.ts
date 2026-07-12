import { Router } from 'express';
import { MaintenanceController } from './maintenance.controller.js';
import {
  createMaintenanceSchema,
  assignTechnicianSchema,
  resolveMaintenanceSchema,
  rejectMaintenanceSchema,
  queryMaintenanceSchema,
} from './maintenance.schema.js';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { UserRole } from '../../config/constants.js';

const router = Router();

// ── Asset sub-route (before /:id) ──────────────────────────────
router.get(
  '/asset/:assetId',
  authenticate,
  asyncHandler(MaintenanceController.getByAsset),
);

// ── CRUD & Workflow routes ─────────────────────────────────────
router.post(
  '/',
  authenticate,
  validate(createMaintenanceSchema),
  asyncHandler(MaintenanceController.createRequest),
);

router.get(
  '/',
  authenticate,
  validate(queryMaintenanceSchema, 'query'),
  asyncHandler(MaintenanceController.getAll),
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(MaintenanceController.getById),
);

router.patch(
  '/:id/approve',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  asyncHandler(MaintenanceController.approve),
);

router.patch(
  '/:id/reject',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  validate(rejectMaintenanceSchema),
  asyncHandler(MaintenanceController.reject),
);

router.patch(
  '/:id/assign',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  validate(assignTechnicianSchema),
  asyncHandler(MaintenanceController.assign),
);

router.patch(
  '/:id/start',
  authenticate,
  asyncHandler(MaintenanceController.startWork),
);

router.patch(
  '/:id/resolve',
  authenticate,
  validate(resolveMaintenanceSchema),
  asyncHandler(MaintenanceController.resolve),
);

export default router;
