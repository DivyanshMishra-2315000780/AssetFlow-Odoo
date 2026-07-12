import mongoose, { type SortOrder, Types } from 'mongoose';
import { Asset, type IAsset } from './asset.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { eventBus } from '../../common/events/eventBus.js';
import {
  AssetStatus,
  ASSET_STATUS_TRANSITIONS,
} from '../../config/constants.js';
import type { CreateAssetInput, UpdateAssetInput, QueryAssetsInput } from './asset.schema.js';

export class AssetService {
  /**
   * Create a new asset and emit an ASSET_REGISTERED event.
   * @param data - Validated create payload
   * @param actorId - ID of the user performing the action
   * @returns The newly created asset document
   */
  static async create(data: CreateAssetInput, actorId: string) {
    const asset = await Asset.create({
      ...data,
      categoryId: new Types.ObjectId(data.categoryId),
      departmentId: new Types.ObjectId(data.departmentId),
    });

    eventBus.emit('ASSET_REGISTERED', {
      assetId: asset._id.toString(),
      actorId,
    });

    return asset;
  }

  /**
   * Retrieve a paginated, filtered list of assets with populated category & department.
   * @param query - Validated query parameters (page, limit, filters, sort)
   * @returns Object containing asset documents array, total count, page, and limit
   */
  static async getAll(query: QueryAssetsInput) {
    const {
      page,
      limit,
      status,
      condition,
      departmentId,
      categoryId,
      search,
      sortBy,
      sortOrder,
    } = query;

    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (condition) filter.condition = condition;
    if (departmentId) filter.departmentId = new Types.ObjectId(departmentId);
    if (categoryId) filter.categoryId = new Types.ObjectId(categoryId);

    // Text search on name or assetTag
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: Record<string, SortOrder> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Asset.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('categoryId', 'name')
        .populate('departmentId', 'name')
        .lean(),
      Asset.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Retrieve a single asset by ID with populated references.
   * @param id - Mongo ObjectId string
   * @returns The asset document with populated category, department, and allocation
   * @throws AppError(404) if asset not found
   */
  static async getById(id: string) {
    const asset = await Asset.findById(id)
      .populate('categoryId', 'name')
      .populate('departmentId', 'name')
      .populate('currentAllocationId')
      .lean();

    if (!asset) {
      throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND');
    }

    return asset;
  }

  /**
   * Update asset fields (excluding status — use changeStatus for that).
   * @param id - Mongo ObjectId string
   * @param data - Validated partial update payload
   * @returns The updated asset document
   * @throws AppError(404) if asset not found
   */
  static async update(id: string, data: UpdateAssetInput) {
    // Build the update payload, converting string IDs to ObjectIds where needed
    const updatePayload: Record<string, unknown> = { ...data };

    if (data.categoryId) {
      updatePayload.categoryId = new Types.ObjectId(data.categoryId);
    }
    if (data.departmentId) {
      updatePayload.departmentId = new Types.ObjectId(data.departmentId);
    }

    // Prevent status changes through the update endpoint
    delete updatePayload['status' as string];

    const asset = await Asset.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    })
      .populate('categoryId', 'name')
      .populate('departmentId', 'name');

    if (!asset) {
      throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND');
    }

    return asset;
  }

  /**
   * Change the status of an asset with transition validation.
   * Only allows transitions defined in ASSET_STATUS_TRANSITIONS.
   * @param id - Mongo ObjectId string
   * @param newStatus - Target AssetStatus value
   * @param actorId - ID of the user performing the status change
   * @returns The updated asset document
   * @throws AppError(404) if asset not found
   * @throws AppError(400) if transition is invalid
   */
  static async changeStatus(id: string, newStatus: AssetStatus, actorId: string) {
    const asset = await Asset.findById(id);

    if (!asset) {
      throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND');
    }

    const currentStatus = asset.status as AssetStatus;
    const allowedTransitions = ASSET_STATUS_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new AppError(
        `Cannot transition from '${currentStatus}' to '${newStatus}'`,
        400,
        'INVALID_STATUS_TRANSITION',
        {
          currentStatus,
          requestedStatus: newStatus,
          allowedTransitions,
        },
      );
    }

    asset.status = newStatus;
    await asset.save();

    return asset;
  }

  /**
   * Delete an asset. Only assets with AVAILABLE or DISPOSED status can be deleted.
   * @param id - Mongo ObjectId string
   * @returns The deleted asset document
   * @throws AppError(404) if asset not found
   * @throws AppError(400) if asset is in a non-deletable state
   */
  static async delete(id: string) {
    const asset = await Asset.findById(id);

    if (!asset) {
      throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND');
    }

    const deletableStatuses: string[] = [AssetStatus.AVAILABLE, AssetStatus.DISPOSED];

    if (!deletableStatuses.includes(asset.status)) {
      throw new AppError(
        `Cannot delete asset with status '${asset.status}'. Only AVAILABLE or DISPOSED assets can be deleted.`,
        400,
        'ASSET_NOT_DELETABLE',
        { currentStatus: asset.status, deletableStatuses },
      );
    }

    await asset.deleteOne();

    return asset;
  }

  /**
   * Aggregate the lifecycle timeline for an asset — allocations, transfers, and maintenance records.
   * @param id - Mongo ObjectId string of the asset
   * @returns Combined and chronologically sorted lifecycle events
   * @throws AppError(404) if asset not found
   */
  static async getLifecycleTimeline(id: string) {
    // Verify asset exists
    const asset = await Asset.findById(id).lean();
    if (!asset) {
      throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND');
    }

    const assetObjectId = new Types.ObjectId(id);

    // Run all aggregations in parallel for performance
    const [allocations, transfers, maintenance] = await Promise.all([
      Asset.db
        .collection('allocations')
        .find({ assetId: assetObjectId })
        .sort({ createdAt: -1 })
        .toArray()
        .catch(() => []),
      Asset.db
        .collection('transfers')
        .find({ assetId: assetObjectId })
        .sort({ createdAt: -1 })
        .toArray()
        .catch(() => []),
      Asset.db
        .collection('maintenances')
        .find({ assetId: assetObjectId })
        .sort({ createdAt: -1 })
        .toArray()
        .catch(() => []),
    ]);

    // Combine and tag each event with its type
    const timeline = [
      ...allocations.map((a) => ({ ...a, _eventType: 'allocation' as const })),
      ...transfers.map((t) => ({ ...t, _eventType: 'transfer' as const })),
      ...maintenance.map((m) => ({ ...m, _eventType: 'maintenance' as const })),
    ].sort((a, b) => {
      const dateA = (a as any).createdAt instanceof Date ? (a as any).createdAt.getTime() : 0;
      const dateB = (b as any).createdAt instanceof Date ? (b as any).createdAt.getTime() : 0;
      return dateB - dateA; // Newest first
    });

    return { asset, timeline };
  }
}
