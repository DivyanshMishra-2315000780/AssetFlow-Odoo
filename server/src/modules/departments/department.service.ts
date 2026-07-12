import { Department } from './department.model.js';
import { User } from '../users/user.model.js';
import { Asset } from '../assets/asset.model.js';
import { AppError } from '../../common/errors/AppError.js';
import type { CreateDepartmentInput, UpdateDepartmentInput, QueryDepartmentsInput } from './department.schema.js';
import { ActivityLogService } from '../activityLogs/activityLog.service.js';

export class DepartmentService {
  /**
   * Create a new department.
   */
  static async create(data: CreateDepartmentInput, actorId: string) {
    const existingName = await Department.findOne({ name: data.name });
    if (existingName) {
      throw new AppError('Department name is already in use', 409, 'DUPLICATE_ENTRY');
    }

    const existingCode = await Department.findOne({ code: data.code.toUpperCase() });
    if (existingCode) {
      throw new AppError('Department code is already in use', 409, 'DUPLICATE_ENTRY');
    }

    const department = await Department.create({
      ...data,
      code: data.code.toUpperCase(),
    });

    await ActivityLogService.log(actorId, 'DEPARTMENT_CREATED', 'departments', {
      departmentId: department._id.toString(),
      name: department.name,
      code: department.code,
    });

    return department;
  }

  /**
   * Get all departments.
   */
  static async getAll(query: QueryDepartmentsInput) {
    const { page, limit, status, search } = query;

    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Department.countDocuments(filter);
    const data = await Department.find(filter)
      .populate('headId', 'firstName lastName email')
      .sort({ name: 1 })
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
   * Get department by ID.
   */
  static async getById(id: string) {
    const department = await Department.findById(id).populate('headId', 'firstName lastName email');
    if (!department) {
      throw new AppError('Department not found', 404, 'NOT_FOUND');
    }
    return department;
  }

  /**
   * Update department.
   */
  static async update(id: string, data: UpdateDepartmentInput, actorId: string) {
    const department = await Department.findById(id);
    if (!department) {
      throw new AppError('Department not found', 404, 'NOT_FOUND');
    }

    if (data.name && data.name !== department.name) {
      const existingName = await Department.findOne({ name: data.name });
      if (existingName) {
        throw new AppError('Department name is already in use', 409, 'DUPLICATE_ENTRY');
      }
    }

    if (data.code && data.code.toUpperCase() !== department.code) {
      const existingCode = await Department.findOne({ code: data.code.toUpperCase() });
      if (existingCode) {
        throw new AppError('Department code is already in use', 409, 'DUPLICATE_ENTRY');
      }
    }

    const updatedData = {
      ...data,
      ...(data.code && { code: data.code.toUpperCase() }),
    };

    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).populate('headId', 'firstName lastName email');

    await ActivityLogService.log(actorId, 'DEPARTMENT_UPDATED', 'departments', {
      departmentId: id,
      changedFields: Object.keys(data),
    });

    return updatedDepartment;
  }

  /**
   * Delete department (ensuring no linked users or assets).
   */
  static async delete(id: string, actorId: string) {
    const department = await Department.findById(id);
    if (!department) {
      throw new AppError('Department not found', 404, 'NOT_FOUND');
    }

    // Dependency check: Users
    const userCount = await User.countDocuments({ departmentId: id });
    if (userCount > 0) {
      throw new AppError(
        'Cannot delete department. There are active users belonging to this department.',
        400,
        'BAD_REQUEST'
      );
    }

    // Dependency check: Assets
    const assetCount = await Asset.countDocuments({ departmentId: id });
    if (assetCount > 0) {
      throw new AppError(
        'Cannot delete department. There are assets assigned to this department.',
        400,
        'BAD_REQUEST'
      );
    }

    await Department.findByIdAndDelete(id);

    await ActivityLogService.log(actorId, 'DEPARTMENT_DELETED', 'departments', {
      departmentId: id,
      name: department.name,
      code: department.code,
    });

    return department;
  }
}
