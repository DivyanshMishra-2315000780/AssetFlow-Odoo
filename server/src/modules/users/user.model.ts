import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserRole, UserStatus } from '../../config/constants.js';

// ── Interface ────────────────────────────────────────────────
export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId?: Types.ObjectId;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  /** Compare a plain-text candidate against the hashed password. */
  comparePassword(candidatePassword: string): Promise<boolean>;
  /** Create and hash a password reset token */
  createPasswordResetToken(): string;
}

export type UserDocument = HydratedDocument<IUser>;

// ── Schema ───────────────────────────────────────────────────
const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Excluded from queries by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.EMPLOYEE,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  },
);

// ── Indexes ──────────────────────────────────────────────────
// `email` is declared with `unique: true` on the field above — avoid
// declaring the same unique index again to prevent duplicate-index warnings.

// ── Pre-save: hash password ──────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance method ──────────────────────────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return resetToken;
};

// ── Model ────────────────────────────────────────────────────
export const User = model<IUser>('User', userSchema);
