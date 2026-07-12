import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.js';
import { validate } from '../../common/middleware/validate.js';
import { queryNotificationsSchema } from './notification.schema.js';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './notification.controller.js';

const router = Router();

// GET / — Retrieve current user's notifications (paginated, with optional isRead filter)
router.get(
  '/',
  authenticate,
  validate(queryNotificationsSchema, 'query'),
  getNotifications
);

// POST /read-all — Mark all notifications of the user as read
router.post(
  '/read-all',
  authenticate,
  markAllNotificationsAsRead
);

// PATCH /:id/read — Mark a single notification as read
router.patch(
  '/:id/read',
  authenticate,
  markNotificationAsRead
);

export default router;
