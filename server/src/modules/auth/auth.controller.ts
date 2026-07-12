import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { sendSuccess, sendCreated } from '../../common/utils/response.js';
import { AuthService } from './auth.service.js';
import { User } from '../users/user.model.js';
import { env } from '../../config/env.js';
import { AppError } from '../../common/errors/AppError.js';
import { ActivityLogService } from '../activityLogs/activityLog.service.js';

// Cookie helper options
const isProduction = env.NODE_ENV === 'production';

const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  maxAge: 15 * 60 * 1000, // 15 mins
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * POST /register — Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const actor = req.user ? { _id: req.user._id, role: req.user.role } : undefined;
  const user = await AuthService.register(req.body, actor);
  sendCreated(res, user, 'User registered successfully');
});

/**
 * POST /login — Login user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await AuthService.login(req.body);

  // Set cookies
  res.cookie('accessToken', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  sendSuccess(res, { user, accessToken, refreshToken }, 'Logged in successfully');
});

/**
 * POST /refresh — Refresh access token
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    throw new AppError('Refresh token is required', 400, 'BAD_REQUEST');
  }

  const { accessToken, refreshToken: newRefreshToken } = await AuthService.refresh(token);

  // Update cookies
  res.cookie('accessToken', accessToken, accessCookieOptions);
  res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

  sendSuccess(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed successfully');
});

/**
 * POST /logout — Logout user
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  // Clear cookies
  res.clearCookie('accessToken', { httpOnly: true, secure: isProduction, sameSite: 'lax' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: isProduction, sameSite: 'lax' });

  if (userId) {
    await ActivityLogService.log(userId, 'USER_LOGOUT', 'auth', {});
  }

  sendSuccess(res, null, 'Logged out successfully');
});

/**
 * GET /me — Get logged-in user profile
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  const user = await User.findById(req.user._id).populate('departmentId');
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  sendSuccess(res, user, 'User profile retrieved successfully');
});

/**
 * POST /forgot-password — Request password reset
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body);
  sendSuccess(res, null, 'If that email is registered, a password reset link has been sent.');
});

/**
 * POST /reset-password/:token — Reset password using token
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token as string;
  await AuthService.resetPassword(token, req.body);
  sendSuccess(res, null, 'Password has been successfully reset. You can now log in.');
});
