import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { CategoryStatus, CustomFieldType } from '../../config/constants.js';

// ── Interfaces ───────────────────────────────────────────────
export interface ICustomField {
  name: string;
  fieldType: CustomFieldType;
  required: boolean;
  options?: string[];
}

export interface ICategory {
  name: string;
  description?: string;
  parentId?: Types.ObjectId;
  customFields: ICustomField[];
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryDocument = HydratedDocument<ICategory>;

// ── Sub-schema ───────────────────────────────────────────────
const customFieldSchema = new Schema<ICustomField>(
  {
    name: {
      type: String,
      required: [true, 'Custom field name is required'],
      trim: true,
    },
    fieldType: {
      type: String,
      enum: Object.values(CustomFieldType),
      required: [true, 'Custom field type is required'],
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [String],
    },
  },
  { _id: false },
);

// ── Schema ───────────────────────────────────────────────────
const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    customFields: {
      type: [customFieldSchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(CategoryStatus),
      default: CategoryStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ──────────────────────────────────────────────────
// `name` has `unique: true` on the field above — avoid duplicate index declaration.

// ── Model ────────────────────────────────────────────────────
export const Category = model<ICategory>('Category', categorySchema);
