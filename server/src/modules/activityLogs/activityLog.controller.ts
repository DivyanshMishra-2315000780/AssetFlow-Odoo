import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { sendPaginated } from '../../common/utils/response.js';
import { ActivityLogService } from './activityLog.service.js';

/**
 * GET / — Get paginated activity logs (Admin only)
 */
export const getActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const { data, total, page, limit } = await ActivityLogService.getAll(req.query as any);
  sendPaginated(res, data, total, page, limit, 'Activity logs retrieved successfully');
});
