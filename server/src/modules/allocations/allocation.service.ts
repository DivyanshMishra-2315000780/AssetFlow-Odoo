import mongoose from 'mongoose';
import { Allocation, type AllocationDocument } from './allocation.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { eventBus } from '../../common/events/eventBus.js';
import { AllocationStatus, AssetStatus, AssetCondition } from '../../config/constants.js';
import type {
  CreateAllocationInput,
  ReturnRequestInput,
  ProcessReturnInput,
  QueryAllocationsInput,
} from './allocation.schema.js';

export class AllocationService {
  /**
   * Allocate an asset to a user or department.
   * Uses a Mongoose transaction to atomically create the allocation and
   * update the asset status to ALLOCATED.
   *
   * @throws AppError 409 if asset is not available or already allocated
   */
  static async allocate(
    data: CreateAllocationInput,
    actorId: string,
  ): Promise<AllocationDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Find asset and verify availability
      const Asset = mongoose.model('Asset');
      const asset = await Asset.findById(data.assetId).session(session);

      if (!asset) {
        throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND');
      }

      if ((asset as any).status !== AssetStatus.AVAILABLE) {
        throw new AppError(
          'Asset is not available for allocation',
          409,
          'ASSET_NOT_AVAILABLE',
        );
      }

      // 2. Check no active allocation already exists
      const existingAllocation = await Allocation.findOne({
        assetId: data.assetId,
        status: AllocationStatus.ACTIVE,
      }).session(session);

      if (existingAllocation) {
        throw new AppError(
          'Asset already has an active allocation',
          409,
          'ASSET_ALREADY_ALLOCATED',
        );
      }

      // 3. Create allocation document
      const allocation = new Allocation({
        assetId: data.assetId,
        allocatedToId: data.allocatedToId,
        allocatedToType: data.allocatedToType,
        allocatedById: actorId,
        expectedReturnDate: data.expectedReturnDate,
        notes: data.notes,
      });
      await allocation.save({ session });

      // 4. Update asset status
      await Asset.findByIdAndUpdate(
        data.assetId,
        {
          status: AssetStatus.ALLOCATED,
          currentAllocationId: allocation._id,
        },
        { session },
      );

      // 5. Commit transaction
      await session.commitTransaction();

      // 6. Emit event (after commit to ensure consistency)
      eventBus.emit('ASSET_ALLOCATED', {
        allocationId: allocation._id.toString(),
        assetId: data.assetId,
        allocatedToId: data.allocatedToId,
        actorId,
      });

      return allocation;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Request return of an allocated asset (typically by the holder).
   * Sets allocation status to RETURN_REQUESTED.
   */
  static async requestReturn(
    allocationId: string,
    userId: string,
    data: ReturnRequestInput,
  ): Promise<AllocationDocument> {
    const allocation = await Allocation.findById(allocationId);

    if (!allocation) {
      throw new AppError('Allocation not found', 404, 'ALLOCATION_NOT_FOUND');
    }

    if (allocation.status !== AllocationStatus.ACTIVE) {
      throw new AppError(
        'Only active allocations can request a return',
        409,
        'INVALID_ALLOCATION_STATUS',
      );
    }

    allocation.status = AllocationStatus.RETURN_REQUESTED;
    if (data.returnNotes) {
      allocation.returnNotes = data.returnNotes;
    }

    await allocation.save();
    return allocation;
  }

  /**
   * Process (confirm) the return of an asset.
   * Uses a Mongoose transaction to atomically update the allocation and
   * set the asset back to AVAILABLE.
   *
   * @throws AppError 409 if allocation is not in ACTIVE or RETURN_REQUESTED status
   */
  static async processReturn(
    allocationId: string,
    actorId: string,
    data: ProcessReturnInput,
  ): Promise<AllocationDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const allocation = await Allocation.findById(allocationId).session(session);

      if (!allocation) {
        throw new AppError('Allocation not found', 404, 'ALLOCATION_NOT_FOUND');
      }

      const validStatuses: string[] = [
        AllocationStatus.ACTIVE,
        AllocationStatus.RETURN_REQUESTED,
      ];

      if (!validStatuses.includes(allocation.status)) {
        throw new AppError(
          'Allocation cannot be returned in its current status',
          409,
          'INVALID_ALLOCATION_STATUS',
        );
      }

      // 1. Update allocation
      allocation.status = AllocationStatus.RETURNED;
      allocation.actualReturnDate = new Date();
      allocation.returnCondition = data.returnCondition as AssetCondition;
      if (data.returnNotes) {
        allocation.returnNotes = data.returnNotes;
      }
      await allocation.save({ session });

      // 2. Update asset
      const Asset = mongoose.model('Asset');
      await Asset.findByIdAndUpdate(
        allocation.assetId,
        {
          status: AssetStatus.AVAILABLE,
          condition: data.returnCondition,
          currentAllocationId: null,
        },
        { session },
      );

      await session.commitTransaction();

      eventBus.emit('ASSET_RETURNED', {
        allocationId: allocation._id.toString(),
        assetId: allocation.assetId.toString(),
        actorId,
      });

      return allocation;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get all allocations with pagination and optional filters.
   */
  static async getAll(
    query: QueryAllocationsInput,
  ): Promise<{ data: AllocationDocument[]; total: number }> {
    const { page, limit, status, assetId, allocatedToId, sortBy, sortOrder } = query;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (assetId) filter.assetId = assetId;
    if (allocatedToId) filter.allocatedToId = allocatedToId;

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      Allocation.find(filter)
        .populate('assetId', 'name assetTag')
        .populate('allocatedToId', 'name email')
        .populate('allocatedById', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean() as unknown as Promise<AllocationDocument[]>,
      Allocation.countDocuments(filter),
    ]);

    return { data, total };
  }

  /**
   * Get a single allocation by ID with deep population.
   */
  static async getById(id: string): Promise<AllocationDocument> {
    const allocation = await Allocation.findById(id)
      .populate('assetId', 'name assetTag serialNumber status condition category')
      .populate('allocatedToId', 'name email department role')
      .populate('allocatedById', 'name email');

    if (!allocation) {
      throw new AppError('Allocation not found', 404, 'ALLOCATION_NOT_FOUND');
    }

    return allocation;
  }

  /**
   * Get allocation history for a specific asset.
   */
  static async getByAsset(assetId: string): Promise<AllocationDocument[]> {
    return Allocation.find({ assetId })
      .populate('allocatedToId', 'name email')
      .populate('allocatedById', 'name email')
      .sort({ createdAt: -1 });
  }

  /**
   * Get all allocations for a specific user.
   */
  static async getByUser(userId: string): Promise<AllocationDocument[]> {
    return Allocation.find({ allocatedToId: userId })
      .populate('assetId', 'name assetTag status condition')
      .populate('allocatedById', 'name email')
      .sort({ createdAt: -1 });
  }
}
