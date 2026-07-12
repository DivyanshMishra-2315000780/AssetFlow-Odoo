import { Schema, model, Types, HydratedDocument } from 'mongoose';
import { AssetStatus, AuditItemResult, AuditStatus } from '../../config/constants.js';

export interface IAuditItem {
  assetId: Types.ObjectId;
  expectedStatus: AssetStatus;
  expectedLocation?: string;
  result: AuditItemResult;
  actualStatus?: AssetStatus;
  actualLocation?: string;
  notes?: string;
  verifiedAt?: Date;
  verifiedById?: Types.ObjectId;
}

export interface IAudit {
  title: string;
  description?: string;
  scheduledDate: Date;
  completedDate?: Date;
  departmentId?: Types.ObjectId | null;
  assignedAuditorIds: Types.ObjectId[];
  createdById: Types.ObjectId;
  status: AuditStatus;
  items: IAuditItem[];
  summary?: {
    total: number;
    verified: number;
    missing: number;
    damaged: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export type AuditDocument = HydratedDocument<IAudit>;

const auditItemSchema = new Schema<IAuditItem>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    expectedStatus: { type: String, enum: Object.values(AssetStatus), required: true },
    expectedLocation: { type: String },
    result: { type: String, enum: Object.values(AuditItemResult), default: AuditItemResult.PENDING },
    actualStatus: { type: String, enum: Object.values(AssetStatus) },
    actualLocation: { type: String },
    notes: { type: String },
    verifiedAt: { type: Date },
    verifiedById: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true } // Keep _id for audit items to allow updates by item _id if needed
);

const auditSchema = new Schema<IAudit>(
  {
    title: { type: String, required: true },
    description: { type: String },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
    assignedAuditorIds: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    createdById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(AuditStatus), default: AuditStatus.DRAFT },
    items: [auditItemSchema],
    summary: {
      total: { type: Number, default: 0 },
      verified: { type: Number, default: 0 },
      missing: { type: Number, default: 0 },
      damaged: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

auditSchema.index({ status: 1 });
auditSchema.index({ departmentId: 1 });
auditSchema.index({ scheduledDate: 1 });

export const Audit = model<IAudit>('Audit', auditSchema);
