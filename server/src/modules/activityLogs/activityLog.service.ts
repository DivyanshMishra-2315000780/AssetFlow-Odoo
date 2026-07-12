import { ActivityLog } from './activityLog.model.js';
import type { QueryActivityLogsInput } from './activityLog.schema.js';
import type { Request } from 'express';

export class ActivityLogService {
  /**
   * Log an activity to the database.
   */
  static async log(
    userId: string | undefined,
    action: string,
    module: string,
    details?: Record<string, unknown>,
    req?: Request
  ): Promise<void> {
    try {
      const ipAddress = req?.ip || req?.headers['x-forwarded-for'] as string || undefined;
      const userAgent = req?.headers['user-agent'] || undefined;

      await ActivityLog.create({
        userId,
        action,
        module,
        details,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error('Failed to write activity log:', error);
    }
  }

  /**
   * Retrieve activity logs with filters, pagination, and sorting.
   */
  static async getAll(query: QueryActivityLogsInput) {
    const { page, limit, userId, action, module, startDate, endDate } = query;

    const filter: Record<string, any> = {};

    if (userId) {
      filter.userId = userId;
    }

    if (action) {
      filter.action = { $regex: action, $options: 'i' };
    }

    if (module) {
      filter.module = { $regex: module, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const total = await ActivityLog.countDocuments(filter);
    const data = await ActivityLog.find(filter)
      .populate('userId', 'firstName lastName email role')
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
}
