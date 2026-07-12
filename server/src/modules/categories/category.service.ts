import { Category } from './category.model.js';
import { Asset } from '../assets/asset.model.js';
import { AppError } from '../../common/errors/AppError.js';
import type { CreateCategoryInput, UpdateCategoryInput, QueryCategoriesInput } from './category.schema.js';
import { ActivityLogService } from '../activityLogs/activityLog.service.js';

export class CategoryService {
  /**
   * Create a new category.
   */
  static async create(data: CreateCategoryInput, actorId: string) {
    const existingName = await Category.findOne({ name: data.name });
    if (existingName) {
      throw new AppError('Category name is already in use', 409, 'DUPLICATE_ENTRY');
    }

    if (data.parentId) {
      const parent = await Category.findById(data.parentId);
      if (!parent) {
        throw new AppError('Parent category not found', 404, 'NOT_FOUND');
      }
    }

    const category = await Category.create(data);

    await ActivityLogService.log(actorId, 'CATEGORY_CREATED', 'categories', {
      categoryId: category._id.toString(),
      name: category.name,
    });

    return category;
  }

  /**
   * Get all categories.
   */
  static async getAll(query: QueryCategoriesInput) {
    const { page, limit, status, search } = query;

    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const total = await Category.countDocuments(filter);
    const data = await Category.find(filter)
      .populate('parentId', 'name')
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
   * Get category by ID.
   */
  static async getById(id: string) {
    const category = await Category.findById(id).populate('parentId', 'name');
    if (!category) {
      throw new AppError('Category not found', 404, 'NOT_FOUND');
    }
    return category;
  }

  /**
   * Update category.
   */
  static async update(id: string, data: UpdateCategoryInput, actorId: string) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404, 'NOT_FOUND');
    }

    if (data.name && data.name !== category.name) {
      const existingName = await Category.findOne({ name: data.name });
      if (existingName) {
        throw new AppError('Category name is already in use', 409, 'DUPLICATE_ENTRY');
      }
    }

    if (data.parentId) {
      const parentIdStr = data.parentId.toString();
      if (parentIdStr === id) {
        throw new AppError('A category cannot be its own parent', 400, 'BAD_REQUEST');
      }

      // Check parent exists
      const parent = await Category.findById(data.parentId);
      if (!parent) {
        throw new AppError('Parent category not found', 404, 'NOT_FOUND');
      }

      // Circular dependency check: is parentId a descendant of id?
      let currentParentId = parent.parentId?.toString();
      while (currentParentId) {
        if (currentParentId === id) {
          throw new AppError(
            'Circular dependency detected: Parent category cannot be a descendant of this category.',
            400,
            'BAD_REQUEST'
          );
        }
        const p = await Category.findById(currentParentId);
        currentParentId = p?.parentId?.toString();
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('parentId', 'name');

    await ActivityLogService.log(actorId, 'CATEGORY_UPDATED', 'categories', {
      categoryId: id,
      changedFields: Object.keys(data),
    });

    return updatedCategory;
  }

  /**
   * Delete category (ensuring no subcategories or assets reference it).
   */
  static async delete(id: string, actorId: string) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404, 'NOT_FOUND');
    }

    // Dependency check: Subcategories
    const childCount = await Category.countDocuments({ parentId: id });
    if (childCount > 0) {
      throw new AppError(
        'Cannot delete category. It has active subcategories.',
        400,
        'BAD_REQUEST'
      );
    }

    // Dependency check: Assets
    const assetCount = await Asset.countDocuments({ categoryId: id });
    if (assetCount > 0) {
      throw new AppError(
        'Cannot delete category. There are assets associated with this category.',
        400,
        'BAD_REQUEST'
      );
    }

    await Category.findByIdAndDelete(id);

    await ActivityLogService.log(actorId, 'CATEGORY_DELETED', 'categories', {
      categoryId: id,
      name: category.name,
    });

    return category;
  }
}
