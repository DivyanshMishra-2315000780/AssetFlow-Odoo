import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { sendSuccess } from '../../common/utils/response.js';
import { AnalyticsService } from './analytics.service.js';

/**
 * GET /api/dashboard/stats — Retrieve role-based dashboard quick metrics
 */
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const role = req.user!.role;
  const departmentId = req.user!.departmentId;

  const stats = await AnalyticsService.getDashboardStats(userId, role, departmentId);
  sendSuccess(res, stats, 'Dashboard stats retrieved successfully');
});

/**
 * GET /api/analytics/assets — Retrieve asset cost & distribution aggregates (Admin & Asset Manager)
 */
export const getAssetAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const analytics = await AnalyticsService.getAssetAnalytics();
  sendSuccess(res, analytics, 'Asset analytics retrieved successfully');
});

/**
 * GET /api/analytics/maintenance — Retrieve maintenance cost & issue status analytics (Admin & Asset Manager)
 */
export const getMaintenanceAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const analytics = await AnalyticsService.getMaintenanceAnalytics();
  sendSuccess(res, analytics, 'Maintenance analytics retrieved successfully');
});

/**
 * GET /api/analytics/bookings — Retrieve resource booking & utilization statistics (Admin & Asset Manager)
 */
export const getBookingAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const analytics = await AnalyticsService.getBookingAnalytics();
  sendSuccess(res, analytics, 'Booking analytics retrieved successfully');
});
