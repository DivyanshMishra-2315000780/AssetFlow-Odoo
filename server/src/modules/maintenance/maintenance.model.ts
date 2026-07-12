import { Schema, model, type Document, type Types } from 'mongoose';
import { MaintenanceStatus, MaintenancePriority } from '../../config/constants.js';

// ── Interface ──────────────────────────────────────────────────
export interface IMaintenance {
  assetId: Types.ObjectId;
  raisedById: Types.ObjectId;
  assignedToId?: Types.ObjectId;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  diagnosis?: string;
  resolution?: string;
  cost?: number;
  startedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MaintenanceDocument = Document<Types.ObjectId> & IMaintenance;

// ── Schema ─────────────────────────────────────────────────────
const maintenanceSchema = new Schema<IMaintenance>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    raisedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Raised-by user is required'],
    },
    assignedToId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: Object.values(MaintenancePriority),
      default: MaintenancePriority.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(MaintenanceStatus),
      default: MaintenanceStatus.PENDING,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    resolution: {
      type: String,
      trim: true,
    },
    cost: {
      type: Number,
      min: 0,
    },
    startedAt: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ────────────────────────────────────────────────────
maintenanceSchema.index({ assetId: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ priority: 1 });
maintenanceSchema.index({ assignedToId: 1 });

// ── Model ──────────────────────────────────────────────────────
export const Maintenance = model<IMaintenance>('Maintenance', maintenanceSchema);
