import { Notification } from './notification.model.js';
import { AppError } from '../../common/errors/AppError.js';
import type { QueryNotificationsInput } from './notification.schema.js';
import type { NotificationType } from '../../config/constants.js';

export class NotificationService {
  /**
   * Retrieve notifications for a user, paginated.
   */
  static async getAll(userId: string, query: QueryNotificationsInput) {
    const { page, limit, isRead } = query;

    const filter: Record<string, any> = { recipientId: userId };

    if (isRead !== undefined) {
      filter.isRead = isRead;
    }

    const total = await Notification.countDocuments(filter);
    const data = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Mark a single notification as read.
   */
  static async markAsRead(id: string, userId: string) {
    const notification = await Notification.findOne({ _id: id, recipientId: userId });
    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  }

  /**
   * Mark all notifications for a user as read.
   */
  static async markAllAsRead(userId: string) {
    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true } }
    );
  }

  /**
   * Create and persist a new notification in the database.
   */
  static async create(
    recipientId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ) {
    return await Notification.create({
      recipientId,
      type,
      title,
      message,
      data,
    });
  }
}
