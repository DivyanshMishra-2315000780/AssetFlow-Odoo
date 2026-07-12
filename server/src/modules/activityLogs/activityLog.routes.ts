import { Router } from 'express';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { validate } from '../../common/middleware/validate.js';
import { UserRole } from '../../config/constants.js';
import { queryActivityLogsSchema } from './activityLog.schema.js';
import { getActivityLogs } from './activityLog.controller.js';

const router = Router();

// GET / — List activity logs with query filter and pagination (Admin only)
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(queryActivityLogsSchema, 'query'),
  getActivityLogs
);

export default router;
