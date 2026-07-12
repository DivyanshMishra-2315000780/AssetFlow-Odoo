import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../../common/utils/response.js';
import { NotificationService } from './notification.service.js';

/**
 * GET / — Retrieve notifications for the current authenticated user
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { data, total, page, limit } = await NotificationService.getAll(userId, req.query as any);
  sendPaginated(res, data, total, page, limit, 'Notifications retrieved successfully');
});

/**
 * PATCH /:id/read — Mark a specific notification as read
 */
export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const notification = await NotificationService.markAsRead(req.params.id as string, userId);
  sendSuccess(res, notification, 'Notification marked as read');
});

/**
 * POST /read-all — Mark all notifications of the user as read
 */
export const markAllNotificationsAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  await NotificationService.markAllAsRead(userId);
  sendSuccess(res, null, 'All notifications marked as read');
});
