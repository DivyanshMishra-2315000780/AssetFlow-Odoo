import { Router } from 'express';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { validate } from '../../common/middleware/validate.js';
import { UserRole } from '../../config/constants.js';
import {
  createAssetSchema,
  updateAssetSchema,
  queryAssetsSchema,
  changeStatusSchema,
} from './asset.schema.js';
import {
  createAsset,
  getAssets,
  getAsset,
  updateAsset,
  changeAssetStatus,
  deleteAsset,
  getAssetLifecycle,
} from './asset.controller.js';

const router = Router();

// POST / — Create a new asset (Admin & Asset Manager only)
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  validate(createAssetSchema),
  createAsset,
);

// GET / — List assets with pagination & filters (any authenticated user)
router.get(
  '/',
  authenticate,
  validate(queryAssetsSchema, 'query'),
  getAssets,
);

// GET /:id — Get a single asset (any authenticated user)
router.get(
  '/:id',
  authenticate,
  getAsset,
);

// PUT /:id — Update asset fields (Admin & Asset Manager only)
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  validate(updateAssetSchema),
  updateAsset,
);

// PATCH /:id/status — Change asset status (Admin & Asset Manager only)
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  validate(changeStatusSchema),
  changeAssetStatus,
);

// DELETE /:id — Delete an asset (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteAsset,
);

// GET /:id/lifecycle — Get asset lifecycle timeline (any authenticated user)
router.get(
  '/:id/lifecycle',
  authenticate,
  getAssetLifecycle,
);

export default router;
