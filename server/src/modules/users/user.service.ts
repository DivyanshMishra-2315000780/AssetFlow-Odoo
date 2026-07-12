import { User } from './user.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { UserRole, UserStatus } from '../../config/constants.js';
import type { QueryUsersInput, UpdateProfileInput, AdminUpdateUserInput } from './user.schema.js';
import { ActivityLogService } from '../activityLogs/activityLog.service.js';

export class UserService {
  /**
   * Retrieve users with filters and pagination (Admin/Asset Manager).
   */
  static async getAll(query: QueryUsersInput) {
    const { page, limit, role, status, departmentId, search } = query;

    const filter: Record<string, any> = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (departmentId) filter.departmentId = departmentId;

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const data = await User.find(filter)
      .populate('departmentId', 'name code')
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
   * Get public employee directory (accessible by any logged-in user).
   * Only returns active employees.
   */
  static async getDirectory(query: QueryUsersInput) {
    const { page, limit, departmentId, search } = query;

    const filter: Record<string, any> = {
      status: UserStatus.ACTIVE,
    };

    if (departmentId) filter.departmentId = departmentId;

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const data = await User.find(filter)
      .select('firstName lastName email role departmentId phone avatar createdAt')
      .populate('departmentId', 'name code')
      .sort({ firstName: 1, lastName: 1 })
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
   * Get user by ID.
   */
  static async getById(id: string) {
    const user = await User.findById(id).populate('departmentId', 'name code headId');
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return user;
  }

  /**
   * Update user profile.
   */
  static async update(id: string, data: UpdateProfileInput | AdminUpdateUserInput, actor: { _id: string; role: string }) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    // Authorization checks
    const isSelf = actor._id === user._id.toString();
    const isAdmin = actor.role === UserRole.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new AppError('You do not have permission to edit this profile', 403, 'FORBIDDEN');
    }

    // Role & Status updates are restricted to Admin
    const updateData: Record<string, any> = { ...data };
    if (!isAdmin) {
      delete updateData.role;
      delete updateData.status;
    }

    const updatedUser = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).populate('departmentId', 'name code');

    // Log action
    await ActivityLogService.log(
      actor._id,
      isSelf ? 'PROFILE_UPDATE' : 'USER_UPDATE_BY_ADMIN',
      'users',
      { targetUserId: id }
    );

    return updatedUser;
  }

  /**
   * Update user role (Admin only).
   */
  static async updateRole(id: string, role: UserRole, actorId: string) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    user.role = role;
    await user.save();

    await ActivityLogService.log(actorId, 'USER_ROLE_CHANGED', 'users', {
      targetUserId: id,
      newRole: role,
    });

    return user;
  }

  /**
   * Update user status (Admin only).
   */
  static async updateStatus(id: string, status: UserStatus, actorId: string) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    user.status = status;
    await user.save();

    await ActivityLogService.log(actorId, 'USER_STATUS_CHANGED', 'users', {
      targetUserId: id,
      newStatus: status,
    });

    return user;
  }

  /**
   * Delete user (Admin only).
   */
  static async delete(id: string, actorId: string) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    if (id === actorId) {
      throw new AppError('You cannot delete your own account', 400, 'BAD_REQUEST');
    }

    await User.findByIdAndDelete(id);

    await ActivityLogService.log(actorId, 'USER_DELETED', 'users', {
      targetUserId: id,
      email: user.email,
    });

    return user;
  }
}
