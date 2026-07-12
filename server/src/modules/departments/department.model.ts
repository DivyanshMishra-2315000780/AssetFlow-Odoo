import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { DepartmentStatus } from '../../config/constants.js';

// ── Interface ────────────────────────────────────────────────
export interface IDepartment {
  name: string;
  code: string;
  description?: string;
  headId?: Types.ObjectId;
  status: DepartmentStatus;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type DepartmentDocument = HydratedDocument<IDepartment>;

// ── Schema ───────────────────────────────────────────────────
const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    headId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: Object.values(DepartmentStatus),
      default: DepartmentStatus.ACTIVE,
    },
    budget: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ──────────────────────────────────────────────────
departmentSchema.index({ name: 1 }, { unique: true });
departmentSchema.index({ code: 1 }, { unique: true });

// ── Model ────────────────────────────────────────────────────
export const Department = model<IDepartment>('Department', departmentSchema);
