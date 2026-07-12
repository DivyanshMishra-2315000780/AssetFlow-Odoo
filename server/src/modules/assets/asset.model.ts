import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { AssetStatus, AssetCondition } from '../../config/constants.js';

// ── TypeScript Interface ──

export interface IAsset {
  assetTag: string;
  name: string;
  description?: string;
  categoryId: Types.ObjectId;
  departmentId: Types.ObjectId;
  status: AssetStatus;
  condition: AssetCondition;
  purchaseDate?: Date;
  purchaseCost?: number;
  warrantyExpiry?: Date;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  location?: string;
  imageUrl?: string;
  customFieldValues?: Map<string, unknown>;
  notes?: string;
  currentAllocationId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type AssetDocument = HydratedDocument<IAsset>;

// ── Mongoose Schema ──

const assetSchema = new Schema<IAsset>(
  {
    assetTag: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
      maxlength: [200, 'Asset name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    status: {
      type: String,
      enum: Object.values(AssetStatus),
      default: AssetStatus.AVAILABLE,
    },
    condition: {
      type: String,
      enum: Object.values(AssetCondition),
      default: AssetCondition.NEW,
    },
    purchaseDate: { type: Date },
    purchaseCost: {
      type: Number,
      min: [0, 'Purchase cost cannot be negative'],
    },
    warrantyExpiry: { type: Date },
    serialNumber: { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    model: { type: String, trim: true },
    location: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    customFieldValues: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
    currentAllocationId: {
      type: Schema.Types.ObjectId,
      ref: 'Allocation',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ──

assetSchema.index({ status: 1 });
assetSchema.index({ departmentId: 1 });
assetSchema.index({ categoryId: 1 });
// `assetTag` is already declared with `unique: true` on the field above —
// avoid declaring the same index twice to prevent mongoose duplicate-index warnings.

// ── Pre-save: auto-generate assetTag ────────────────────────
assetSchema.pre('save', async function () {
  if (!this.isNew || this.assetTag) return;

  const lastAsset = await model<IAsset>('Asset')
    .findOne()
    .sort({ createdAt: -1 })
    .select('assetTag');

  let counter = 1;
  if (lastAsset && lastAsset.assetTag) {
    const lastTagNumber = parseInt(lastAsset.assetTag.split('-')[1], 10);
    if (!isNaN(lastTagNumber)) {
      counter = lastTagNumber + 1;
    }
  }

  this.assetTag = `AST-${String(counter).padStart(5, '0')}`;
});

// ── Model Export ──

export const Asset = model<IAsset>('Asset', assetSchema);
