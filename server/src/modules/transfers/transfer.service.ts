import mongoose from 'mongoose';
import { Transfer, type TransferDocument } from './transfer.model.js';
import { Allocation } from '../allocations/allocation.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { eventBus } from '../../common/events/eventBus.js';
import {
  TransferStatus,
  AllocationStatus,
  AssetStatus,
} from '../../config/constants.js';
import type {
  CreateTransferInput,
  ApproveTransferInput,
  RejectTransferInput,
  QueryTransfersInput,
} from './transfer.schema.js';

export class TransferService {
  /**
   * Request a transfer of an allocated asset to another user.
   * Validates the asset has an active allocation and that the requester
   * is the current holder or a manager/admin.
   *
   * @throws AppError 404 if asset not found
   * @throws AppError 409 if no active allocation exists
   * @throws AppError 403 if requester is not authorized
   */
  static async requestTransfer(
    data: CreateTransferInput,
    requestedById: string,
  ): Promise<TransferDocument> {
    // 1. Find the asset
    const Asset = mongoose.model('Asset');
    const asset = await Asset.findById(data.assetId);

    if (!asset) {
      throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND');
    }

    // 2. Find the active allocation for this asset
    const activeAllocation = await Allocation.findOne({
      assetId: data.assetId,
      status: AllocationStatus.ACTIVE,
    });

    if (!activeAllocation) {
      throw new AppError(
        'Asset does not have an active allocation',
        409,
        'NO_ACTIVE_ALLOCATION',
      );
    }

    // 3. Verify requester is the current holder or was the allocator (manager)
    const isHolder =
      activeAllocation.allocatedToId.toString() === requestedById;
    const isAllocator =
      activeAllocation.allocatedById.toString() === requestedById;

    if (!isHolder && !isAllocator) {
      throw new AppError(
        'Only the current holder or the allocating manager can request a transfer',
        403,
        'TRANSFER_NOT_AUTHORIZED',
      );
    }

    // 4. Create transfer record
    const transfer = await Transfer.create({
      assetId: data.assetId,
      fromAllocationId: activeAllocation._id,
      fromUserId: activeAllocation.allocatedToId,
      toUserId: data.toUserId,
      toType: data.toType as any,
      requestedById,
      reason: data.reason,
    });

    // 5. Emit event
    eventBus.emit('TRANSFER_REQUESTED', {
      transferId: transfer._id.toString(),
      assetId: data.assetId,
      requestedById,
    });

    return transfer;
  }

  /**
   * Approve a pending transfer request.
   *
   * @throws AppError 404 if transfer not found
   * @throws AppError 409 if transfer is not in REQUESTED status
   */
  static async approveTransfer(
    transferId: string,
    actorId: string,
    data: ApproveTransferInput,
  ): Promise<TransferDocument> {
    const transfer = await Transfer.findById(transferId);

    if (!transfer) {
      throw new AppError('Transfer not found', 404, 'TRANSFER_NOT_FOUND');
    }

    if (transfer.status !== TransferStatus.REQUESTED) {
      throw new AppError(
        'Only pending transfers can be approved',
        409,
        'INVALID_TRANSFER_STATUS',
      );
    }

    transfer.status = TransferStatus.APPROVED;
    transfer.approvedById = new mongoose.Types.ObjectId(actorId);
    if (data.approvalNotes) {
      transfer.approvalNotes = data.approvalNotes;
    }

    await transfer.save();

    eventBus.emit('TRANSFER_APPROVED', {
      transferId: transfer._id.toString(),
      assetId: transfer.assetId.toString(),
      actorId,
    });

    return transfer;
  }

  /**
   * Reject a pending transfer request.
   *
   * @throws AppError 404 if transfer not found
   * @throws AppError 409 if transfer is not in REQUESTED status
   */
  static async rejectTransfer(
    transferId: string,
    actorId: string,
    data: RejectTransferInput,
  ): Promise<TransferDocument> {
    const transfer = await Transfer.findById(transferId);

    if (!transfer) {
      throw new AppError('Transfer not found', 404, 'TRANSFER_NOT_FOUND');
    }

    if (transfer.status !== TransferStatus.REQUESTED) {
      throw new AppError(
        'Only pending transfers can be rejected',
        409,
        'INVALID_TRANSFER_STATUS',
      );
    }

    transfer.status = TransferStatus.REJECTED;
    transfer.rejectionReason = data.rejectionReason;

    await transfer.save();

    eventBus.emit('TRANSFER_REJECTED', {
      transferId: transfer._id.toString(),
      assetId: transfer.assetId.toString(),
      actorId,
    });

    return transfer;
  }

  /**
   * Complete an approved transfer.
   * Uses a Mongoose transaction to atomically:
   *   1. End the old allocation (status → TRANSFERRED)
   *   2. Create a new allocation for the target user
   *   3. Update the asset's currentAllocationId
   *   4. Mark the transfer as COMPLETED
   *
   * @throws AppError 404 if transfer not found
   * @throws AppError 409 if transfer is not in APPROVED status
   */
  static async completeTransfer(
    transferId: string,
    actorId: string,
  ): Promise<TransferDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transfer = await Transfer.findById(transferId).session(session);

      if (!transfer) {
        throw new AppError('Transfer not found', 404, 'TRANSFER_NOT_FOUND');
      }

      if (transfer.status !== TransferStatus.APPROVED) {
        throw new AppError(
          'Only approved transfers can be completed',
          409,
          'INVALID_TRANSFER_STATUS',
        );
      }

      // 1. End old allocation
      await Allocation.findByIdAndUpdate(
        transfer.fromAllocationId,
        { status: AllocationStatus.TRANSFERRED },
        { session },
      );

      // 2. Create new allocation for the target user
      const [newAllocation] = await Allocation.create(
        [
          {
            assetId: transfer.assetId,
            allocatedToId: transfer.toUserId,
            allocatedToType: transfer.toType,
            allocatedById: actorId,
            status: AllocationStatus.ACTIVE,
          },
        ],
        { session },
      ) as any;

      // 3. Update asset's currentAllocationId
      const Asset = mongoose.model('Asset');
      await Asset.findByIdAndUpdate(
        transfer.assetId,
        { currentAllocationId: newAllocation._id },
        { session },
      );

      // 4. Mark transfer as completed
      transfer.status = TransferStatus.COMPLETED;
      transfer.completedAt = new Date();
      await transfer.save({ session });

      await session.commitTransaction();

      eventBus.emit('TRANSFER_APPROVED', {
        transferId: transfer._id.toString(),
        assetId: transfer.assetId.toString(),
        actorId,
      });

      return transfer;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get all transfers with pagination and optional filters.
   */
  static async getAll(
    query: QueryTransfersInput,
  ): Promise<{ data: TransferDocument[]; total: number }> {
    const { page, limit, status, assetId, sortBy, sortOrder } = query;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (assetId) filter.assetId = assetId;

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      Transfer.find(filter)
        .populate('assetId', 'name assetTag')
        .populate('fromUserId', 'name email')
        .populate('toUserId', 'name email')
        .populate('requestedById', 'name email')
        .populate('approvedById', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean() as unknown as Promise<TransferDocument[]>,
      Transfer.countDocuments(filter),
    ]);

    return { data, total };
  }

  /**
   * Get a single transfer by ID with deep population.
   */
  static async getById(id: string): Promise<TransferDocument> {
    const transfer = await Transfer.findById(id)
      .populate('assetId', 'name assetTag serialNumber status condition')
      .populate('fromAllocationId')
      .populate('fromUserId', 'name email department role')
      .populate('toUserId', 'name email department role')
      .populate('requestedById', 'name email')
      .populate('approvedById', 'name email');

    if (!transfer) {
      throw new AppError('Transfer not found', 404, 'TRANSFER_NOT_FOUND');
    }

    return transfer;
  }
}
