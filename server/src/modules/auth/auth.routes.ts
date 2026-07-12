import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../common/middleware/auth.js';
import { validate } from '../../common/middleware/validate.js';
import { env } from '../../config/env.js';
import { registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema.js';
import { register, login, refresh, logout, getMe, forgotPassword, resetPassword } from './auth.controller.js';

const router = Router();

// Optional authentication middleware for registration
const optionalAuthenticate = (req: any, _res: any, next: any) => {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      req.user = decoded;
    } catch {
      // Ignore token parsing failure for optional authentication
    }
  }
  next();
};

// POST /register — Register a new user (public signup or admin-invoked creation)
router.post('/register', optionalAuthenticate, validate(registerSchema), register);

// POST /login — Authenticate user credentials and return tokens
router.post('/login', validate(loginSchema), login);

// POST /refresh — Obtain new tokens using refresh token
router.post('/refresh', validate(refreshSchema), refresh);

// POST /logout — Clear authentication session
router.post('/logout', authenticate, logout);

// GET /me — Fetch profile of the logged-in user
router.get('/me', authenticate, getMe);

// POST /forgot-password — Request password reset
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

// POST /reset-password/:token — Reset password using token
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

export default router;
