import jwt from 'jsonwebtoken';
import { User, type IUser } from '../users/user.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { env } from '../../config/env.js';
import { UserRole, UserStatus } from '../../config/constants.js';
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './auth.schema.js';
import { ActivityLogService } from '../activityLogs/activityLog.service.js';
import { sendEmail } from '../../common/utils/email.js';
import crypto from 'crypto';

export class AuthService {
  /**
   * Register a new user.
   */
  static async register(data: RegisterInput, actor?: { _id: string; role: string }) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email address is already registered', 409, 'DUPLICATE_ENTRY');
    }

    // Role restriction: Only Admins can set roles other than EMPLOYEE
    let role: UserRole = UserRole.EMPLOYEE;
    if (data.role) {
      if (actor && actor.role === UserRole.ADMIN) {
        role = data.role;
      } else if (data.role !== UserRole.EMPLOYEE) {
        throw new AppError('Only administrators can assign user roles', 403, 'FORBIDDEN');
      }
    }

    const user = await User.create({
      ...data,
      role,
      status: UserStatus.ACTIVE,
    });

    // Remove password from returned user object
    const userObj = user.toObject();
    delete (userObj as any).password;

    // Log activity
    await ActivityLogService.log(
      actor?._id || user._id.toString(),
      'USER_REGISTERED',
      'auth',
      { userId: user._id.toString(), email: user.email }
    );

    return userObj;
  }

  /**
   * Authenticate a user and return tokens.
   */
  static async login(data: LoginInput) {
    const user = await User.findOne({ email: data.email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403, 'FORBIDDEN');
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const { accessToken, refreshToken } = this.generateTokens(user);

    // Remove password
    const userObj = user.toObject();
    delete (userObj as any).password;

    // Log activity
    await ActivityLogService.log(
      user._id.toString(),
      'USER_LOGIN',
      'auth',
      { email: user.email }
    );

    return { user: userObj, accessToken, refreshToken };
  }

  /**
   * Refresh the access and refresh tokens.
   */
  static async refresh(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError('User no longer exists', 401, 'UNAUTHORIZED');
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new AppError('User account is deactivated', 403, 'FORBIDDEN');
      }

      const tokens = this.generateTokens(user);
      return tokens;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid or expired refresh token. Please log in again.', 401, 'UNAUTHORIZED');
    }
  }

  /**
   * Handle forgot password request
   */
  static async forgotPassword(data: ForgotPasswordInput) {
    const user = await User.findOne({ email: data.email });
    
    // We do not throw an error if the user is not found to prevent email enumeration attacks
    if (!user) {
      return; 
    }

    if (user.status !== UserStatus.ACTIVE) {
      return; // Again, silently return
    }

    // Generate token and save to user
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetUrl = `${env.CORS_ORIGIN}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'AssetFlow - Password Reset Request',
      text: `You requested a password reset. Please go to this link to reset your password: ${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your AssetFlow account.</p>
          <p>Please click the button below to reset your password. This link is valid for 10 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `
    });

    await ActivityLogService.log(
      user._id.toString(),
      'USER_FORGOT_PASSWORD',
      'auth',
      { email: user.email }
    );
  }

  /**
   * Reset the password using a valid token
   */
  static async resetPassword(token: string, data: ResetPasswordInput) {
    // Hash token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400, 'INVALID_TOKEN');
    }

    // Set new password
    user.password = data.password; // pre-save hook will hash it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    await ActivityLogService.log(
      user._id.toString(),
      'USER_PASSWORD_RESET',
      'auth',
      { email: user.email }
    );
  }

  /**
   * Helper to sign JWT tokens.
   */
  private static generateTokens(user: any) {
    const payload = {
      _id: user._id.toString(),
      id: user._id.toString(), // Support Socket.IO auth
      email: user.email,
      role: user.role,
      departmentId: user.departmentId?.toString(),
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }
}
