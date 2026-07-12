import { Schema, model, type Types, type HydratedDocument } from 'mongoose';
import { TransferStatus, AllocatedToType } from '../../config/constants.js';

// ── Interface ──────────────────────────────────────────────
export interface ITransfer {
  assetId: Types.ObjectId;
  fromAllocationId: Types.ObjectId;
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  toType: AllocatedToType;
  requestedById: Types.ObjectId;
  approvedById?: Types.ObjectId;
  status: TransferStatus;
  reason: string;
  approvalNotes?: string;
  rejectionReason?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TransferDocument = HydratedDocument<ITransfer>;

// ── Schema ─────────────────────────────────────────────────
const transferSchema = new Schema<ITransfer>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset ID is required'],
    },
    fromAllocationId: {
      type: Schema.Types.ObjectId,
      ref: 'Allocation',
      required: [true, 'Source allocation ID is required'],
    },
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'From-user ID is required'],
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'To-user ID is required'],
    },
    toType: {
      type: String,
      enum: Object.values(AllocatedToType),
      required: [true, 'Transfer target type is required'],
    },
    requestedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester ID is required'],
    },
    approvedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: Object.values(TransferStatus),
      default: TransferStatus.REQUESTED,
    },
    reason: {
      type: String,
      required: [true, 'Transfer reason is required'],
      trim: true,
    },
    approvalNotes: { type: String, trim: true },
    rejectionReason: { type: String, trim: true },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

// ── Indexes ────────────────────────────────────────────────
transferSchema.index({ assetId: 1 });
transferSchema.index({ status: 1 });
transferSchema.index({ fromUserId: 1 });
transferSchema.index({ toUserId: 1 });

// ── Model ──────────────────────────────────────────────────
export const Transfer = model<ITransfer>('Transfer', transferSchema);
