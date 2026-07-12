import { Schema, model, type Types, type HydratedDocument } from 'mongoose';
import {
  AllocationStatus,
  AllocatedToType,
  AssetCondition,
} from '../../config/constants.js';

// ── Interface ──────────────────────────────────────────────
export interface IAllocation {
  assetId: Types.ObjectId;
  allocatedToId: Types.ObjectId;
  allocatedToType: AllocatedToType;
  allocatedById: Types.ObjectId;
  status: AllocationStatus;
  allocatedAt: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  returnCondition?: AssetCondition;
  returnNotes?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AllocationDocument = HydratedDocument<IAllocation>;

// ── Schema ─────────────────────────────────────────────────
const allocationSchema = new Schema<IAllocation>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset ID is required'],
    },
    allocatedToId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Allocated-to ID is required'],
    },
    allocatedToType: {
      type: String,
      enum: Object.values(AllocatedToType),
      required: [true, 'Allocated-to type is required'],
    },
    allocatedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Allocated-by ID is required'],
    },
    status: {
      type: String,
      enum: Object.values(AllocationStatus),
      default: AllocationStatus.ACTIVE,
    },
    allocatedAt: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: { type: Date },
    actualReturnDate: { type: Date },
    returnCondition: {
      type: String,
      enum: Object.values(AssetCondition),
    },
    returnNotes: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

// ── Indexes ────────────────────────────────────────────────
allocationSchema.index({ assetId: 1, status: 1 });
allocationSchema.index({ allocatedToId: 1 });
allocationSchema.index({ status: 1 });

// ── Model ──────────────────────────────────────────────────
export const Allocation = model<IAllocation>('Allocation', allocationSchema);
