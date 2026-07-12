import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './common/errors/errorHandler.js';
import assetRoutes from './modules/assets/asset.routes.js';
import allocationRoutes from './modules/allocations/allocation.routes.js';
import transferRoutes from './modules/transfers/transfer.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import maintenanceRoutes from './modules/maintenance/maintenance.routes.js';
import auditRoutes from './modules/audits/audit.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import departmentRoutes from './modules/departments/department.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import activityLogRoutes from './modules/activityLogs/activityLog.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import dashboardRoutes from './modules/analytics/dashboard.routes.js';

const app = express();

// ── Security ──
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// ── Rate Limiting ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, code: 'RATE_LIMIT', message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// ── Body Parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Health Check ──
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'AssetFlow API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/audits', auditRoutes);

// ── Error Handler (must be last) ──
app.use(errorHandler);

export default app;
