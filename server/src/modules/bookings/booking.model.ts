import { Schema, model, type Document, type Types } from 'mongoose';
import { BookingStatus } from '../../config/constants.js';

// ── Interface ──────────────────────────────────────────────────
export interface IBooking {
  resourceId: Types.ObjectId;
  bookedById: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  purpose: string;
  status: BookingStatus;
  notes?: string;
  cancelledById?: Types.ObjectId;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = Document<Types.ObjectId> & IBooking;

// ── Schema ─────────────────────────────────────────────────────
const bookingSchema = new Schema<IBooking>(
  {
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Resource (asset) is required'],
    },
    bookedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booked-by user is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.UPCOMING,
    },
    notes: {
      type: String,
      trim: true,
    },
    cancelledById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ────────────────────────────────────────────────────
bookingSchema.index({ resourceId: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ bookedById: 1 });
bookingSchema.index({ status: 1 });

// ── Model ──────────────────────────────────────────────────────
export const Booking = model<IBooking>('Booking', bookingSchema);
