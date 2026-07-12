import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../errors/AppError.js';
import type { UserRole } from '../../config/constants.js';

// ── Express Request augmentation ─────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        role: UserRole;
        departmentId?: string;
      };
    }
  }
}

/** JWT payload shape stored in access tokens. */
interface JwtPayload {
  _id: string;
  email: string;
  role: UserRole;
  departmentId?: string;
}

// ── authenticate ─────────────────────────────────────────────
/**
 * Middleware that verifies a JWT access token.
 *
 * Token resolution order:
 *  1. `Authorization: Bearer <token>` header
 *  2. `accessToken` cookie
 *
 * On success, `req.user` is populated with the decoded payload.
 * On failure, throws a 401 AppError.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  // 1. Try Authorization header
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // 2. Fallback to cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken as string;
  }

  if (!token) {
    throw new AppError('Authentication required. Please log in.', 401, 'UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      _id: decoded._id,
      email: decoded.email,
      role: decoded.role,
      departmentId: decoded.departmentId,
    };

    next();
  } catch {
    throw new AppError('Invalid or expired token. Please log in again.', 401, 'UNAUTHORIZED');
  }
};

// ── authorize ────────────────────────────────────────────────
/**
 * Middleware factory that restricts access to the given roles.
 *
 * Must be used **after** `authenticate` so `req.user` is available.
 *
 * @param roles — Allowed user roles.
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required. Please log in.', 401, 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        'You do not have permission to perform this action.',
        403,
        'FORBIDDEN',
      );
    }

    next();
  };
};
