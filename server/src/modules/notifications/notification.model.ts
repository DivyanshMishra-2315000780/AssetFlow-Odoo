import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { NotificationType } from '../../config/constants.js';

// ── Interface ────────────────────────────────────────────────
export interface INotification {
  recipientId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<INotification>;

// ── Schema ───────────────────────────────────────────────────
const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: 1000,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ──────────────────────────────────────────────────
// Fast lookup: "all unread notifications for a user"
notificationSchema.index({ recipientId: 1, isRead: 1 });
// Chronological listing (newest first)
notificationSchema.index({ createdAt: -1 });

// ── Model ────────────────────────────────────────────────────
export const Notification = model<INotification>('Notification', notificationSchema);
