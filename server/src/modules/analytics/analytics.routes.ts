import { Router } from 'express';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { UserRole } from '../../config/constants.js';
import {
  getAssetAnalytics,
  getMaintenanceAnalytics,
  getBookingAnalytics,
} from './analytics.controller.js';

const router = Router();

// GET /api/analytics/assets — Asset inventory and valuation breakdown (Admin & Asset Manager)
router.get(
  '/assets',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  getAssetAnalytics
);

// GET /api/analytics/maintenance — Maintenance priorities and cost metrics (Admin & Asset Manager)
router.get(
  '/maintenance',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  getMaintenanceAnalytics
);

// GET /api/analytics/bookings — Resource bookings and utilization statistics (Admin & Asset Manager)
router.get(
  '/bookings',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  getBookingAnalytics
);

export default router;
