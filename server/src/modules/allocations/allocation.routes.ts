import { Router } from 'express';
import { AllocationController } from './allocation.controller.js';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { UserRole } from '../../config/constants.js';
import {
  createAllocationSchema,
  returnRequestSchema,
  processReturnSchema,
  queryAllocationsSchema,
} from './allocation.schema.js';

const router = Router();

// ── Routes ─────────────────────────────────────────────────

// Specific paths must be defined BEFORE /:id to avoid route conflicts
router.get(
  '/asset/:assetId',
  authenticate,
  asyncHandler(AllocationController.getByAsset),
);

router.get(
  '/user/:userId',
  authenticate,
  asyncHandler(AllocationController.getByUser),
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  validate(createAllocationSchema),
  asyncHandler(AllocationController.allocate),
);

router.get(
  '/',
  authenticate,
  validate(queryAllocationsSchema, 'query'),
  asyncHandler(AllocationController.getAll),
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(AllocationController.getById),
);

router.patch(
  '/:id/request-return',
  authenticate,
  validate(returnRequestSchema),
  asyncHandler(AllocationController.requestReturn),
);

router.patch(
  '/:id/process-return',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  validate(processReturnSchema),
  asyncHandler(AllocationController.processReturn),
);

export default router;
