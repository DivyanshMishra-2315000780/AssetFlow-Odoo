import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './common/errors/errorHandler.js';

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
// Routes will be mounted here in Phase 2+

// ── Error Handler (must be last) ──
app.use(errorHandler);

export default app;
