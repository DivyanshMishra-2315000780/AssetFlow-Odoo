import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.js';
import { getDashboardStats } from './analytics.controller.js';

const router = Router();

// GET /api/dashboard/stats — Role-specific dashboard stats card metrics
router.get('/stats', authenticate, getDashboardStats);

export default router;
