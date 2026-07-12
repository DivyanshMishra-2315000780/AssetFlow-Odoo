import { Router } from 'express';
import { TransferController } from './transfer.controller.js';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { UserRole } from '../../config/constants.js';
import {
  createTransferSchema,
  approveTransferSchema,
  rejectTransferSchema,
  queryTransfersSchema,
} from './transfer.schema.js';

const router = Router();

// ── Routes ─────────────────────────────────────────────────

router.post(
  '/',
  authenticate,
  validate(createTransferSchema),
  asyncHandler(TransferController.requestTransfer),
);

router.get(
  '/',
  authenticate,
  validate(queryTransfersSchema, 'query'),
  asyncHandler(TransferController.getAll),
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(TransferController.getById),
);

router.patch(
  '/:id/approve',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD),
  validate(approveTransferSchema),
  asyncHandler(TransferController.approve),
);

router.patch(
  '/:id/reject',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD),
  validate(rejectTransferSchema),
  asyncHandler(TransferController.reject),
);

router.patch(
  '/:id/complete',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  asyncHandler(TransferController.complete),
);

export default router;
