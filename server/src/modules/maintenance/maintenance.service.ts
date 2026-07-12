import mongoose from 'mongoose';
import { Maintenance, type MaintenanceDocument } from './maintenance.model.js';
import type {
  CreateMaintenanceInput,
  AssignTechnicianInput,
  ResolveMaintenanceInput,
  QueryMaintenanceInput,
} from './maintenance.schema.js';
import { AppError } from '../../common/errors/AppError.js';
import { eventBus } from '../../common/events/eventBus.js';
import { MaintenanceStatus, AssetStatus, ASSET_STATUS_TRANSITIONS } from '../../config/constants.js';

export class MaintenanceService {
  // ── Helpers ────────────────────────────────────────────────────

  /** Validate that an asset status transition is allowed. */
  private static validateAssetTransition(currentStatus: AssetStatus, targetStatus: AssetStatus): void {
    const allowed = ASSET_STATUS_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(targetStatus)) {
      throw new AppError(
        `Cannot transition asset from "${currentStatus}" to "${targetStatus}"`,
        400,
        'INVALID_STATUS_TRANSITION',
      );
    }
  }

  // ── Create ─────────────────────────────────────────────────────

  /**
   * Raise a new maintenance request for an asset.
   * @throws AppError 404 if the asset does not exist
   */
  static async createRequest(
    data: CreateMaintenanceInput,
    raisedById: string,
  ): Promise<MaintenanceDocument> {
    const Asset = mongoose.model('Asset');
    const asset = await Asset.findById(data.assetId);

    if (!asset) {
      throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND');
    }

    const maintenance = await Maintenance.create({
      assetId: data.assetId,
      raisedById,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: MaintenanceStatus.PENDING,
    });

    eventBus.emit('MAINTENANCE_REQUESTED', {
      maintenanceId: maintenance._id.toString(),
      assetId: data.assetId,
      raisedById,
    });

    return maintenance;
  }

  // ── Approve (transaction) ──────────────────────────────────────

  /**
   * Approve a pending maintenance request and set the asset to UNDER_MAINTENANCE.
   * Uses a Mongoose transaction to ensure atomicity.
   * @throws AppError 404 if not found
   * @throws AppError 400 if status is not PENDING
   */
  static async approveRequest(
    maintenanceId: string,
    actorId: string,
  ): Promise<MaintenanceDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const maintenance = await Maintenance.findById(maintenanceId).session(session);
      if (!maintenance) {
        throw new AppError('Maintenance request not found', 404, 'MAINTENANCE_NOT_FOUND');
      }

      if (maintenance.status !== MaintenanceStatus.PENDING) {
        throw new AppError(
          `Cannot approve a request with status "${maintenance.status}"`,
          400,
          'INVALID_STATUS_TRANSITION',
        );
      }

      // Transition the asset to UNDER_MAINTENANCE
      const Asset = mongoose.model('Asset');
      const asset = await Asset.findById(maintenance.assetId).session(session);
      if (!asset) {
        throw new AppError('Associated asset not found', 404, 'ASSET_NOT_FOUND');
      }

      MaintenanceService.validateAssetTransition(
        (asset as any).status as AssetStatus,
        AssetStatus.UNDER_MAINTENANCE,
      );

      (asset as any).status = AssetStatus.UNDER_MAINTENANCE;
      await asset.save({ session });

      maintenance.status = MaintenanceStatus.APPROVED;
      await maintenance.save({ session });

      await session.commitTransaction();

      eventBus.emit('MAINTENANCE_APPROVED', {
        maintenanceId: maintenance._id.toString(),
        assetId: maintenance.assetId.toString(),
        actorId,
      });

      return maintenance;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // ── Assign Technician ──────────────────────────────────────────

  /**
   * Assign a technician to an approved maintenance request.
   * @throws AppError 404 if not found
   * @throws AppError 400 if status is not APPROVED
   */
  static async assignTechnician(
    maintenanceId: string,
    _actorId: string,
    data: AssignTechnicianInput,
  ): Promise<MaintenanceDocument> {
    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance) {
      throw new AppError('Maintenance request not found', 404, 'MAINTENANCE_NOT_FOUND');
    }

    if (maintenance.status !== MaintenanceStatus.APPROVED) {
      throw new AppError(
        `Cannot assign a technician when status is "${maintenance.status}"`,
        400,
        'INVALID_STATUS_TRANSITION',
      );
    }

    maintenance.assignedToId = new mongoose.Types.ObjectId(data.assignedToId);
    maintenance.status = MaintenanceStatus.TECHNICIAN_ASSIGNED;
    await maintenance.save();

    return maintenance;
  }

  // ── Start Work ─────────────────────────────────────────────────

  /**
   * Mark a technician-assigned request as in-progress.
   * @throws AppError 404 if not found
   * @throws AppError 400 if status is not TECHNICIAN_ASSIGNED
   */
  static async startWork(
    maintenanceId: string,
    _actorId: string,
  ): Promise<MaintenanceDocument> {
    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance) {
      throw new AppError('Maintenance request not found', 404, 'MAINTENANCE_NOT_FOUND');
    }

    if (maintenance.status !== MaintenanceStatus.TECHNICIAN_ASSIGNED) {
      throw new AppError(
        `Cannot start work when status is "${maintenance.status}"`,
        400,
        'INVALID_STATUS_TRANSITION',
      );
    }

    maintenance.status = MaintenanceStatus.IN_PROGRESS;
    maintenance.startedAt = new Date();
    await maintenance.save();

    return maintenance;
  }

  // ── Resolve (transaction) ──────────────────────────────────────

  /**
   * Resolve a maintenance request and return the asset to AVAILABLE.
   * Uses a Mongoose transaction to ensure atomicity.
   * @throws AppError 404 if not found
   * @throws AppError 400 if status is not IN_PROGRESS
   */
  static async resolve(
    maintenanceId: string,
    actorId: string,
    data: ResolveMaintenanceInput,
  ): Promise<MaintenanceDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const maintenance = await Maintenance.findById(maintenanceId).session(session);
      if (!maintenance) {
        throw new AppError('Maintenance request not found', 404, 'MAINTENANCE_NOT_FOUND');
      }

      if (maintenance.status !== MaintenanceStatus.IN_PROGRESS) {
        throw new AppError(
          `Cannot resolve a request with status "${maintenance.status}"`,
          400,
          'INVALID_STATUS_TRANSITION',
        );
      }

      // Transition asset back to AVAILABLE
      const Asset = mongoose.model('Asset');
      const asset = await Asset.findById(maintenance.assetId).session(session);
      if (!asset) {
        throw new AppError('Associated asset not found', 404, 'ASSET_NOT_FOUND');
      }

      MaintenanceService.validateAssetTransition(
        (asset as any).status as AssetStatus,
        AssetStatus.AVAILABLE,
      );

      (asset as any).status = AssetStatus.AVAILABLE;
      await asset.save({ session });

      maintenance.status = MaintenanceStatus.RESOLVED;
      maintenance.resolution = data.resolution;
      maintenance.cost = data.cost;
      maintenance.diagnosis = data.diagnosis ?? maintenance.diagnosis;
      maintenance.resolvedAt = new Date();
      await maintenance.save({ session });

      await session.commitTransaction();

      eventBus.emit('MAINTENANCE_RESOLVED', {
        maintenanceId: maintenance._id.toString(),
        assetId: maintenance.assetId.toString(),
        actorId,
      });

      return maintenance;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // ── Reject ─────────────────────────────────────────────────────

  /**
   * Reject a pending maintenance request.
   * @throws AppError 404 if not found
   * @throws AppError 400 if status is not PENDING
   */
  static async rejectRequest(
    maintenanceId: string,
    _actorId: string,
    _reason: string,
  ): Promise<MaintenanceDocument> {
    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance) {
      throw new AppError('Maintenance request not found', 404, 'MAINTENANCE_NOT_FOUND');
    }

    if (maintenance.status !== MaintenanceStatus.PENDING) {
      throw new AppError(
        `Cannot reject a request with status "${maintenance.status}"`,
        400,
        'INVALID_STATUS_TRANSITION',
      );
    }

    maintenance.status = MaintenanceStatus.REJECTED;
    await maintenance.save();

    return maintenance;
  }

  // ── Queries ────────────────────────────────────────────────────

  /**
   * Get all maintenance requests with pagination, filtering, and sorting.
   */
  static async getAll(
    query: QueryMaintenanceInput,
  ): Promise<{ requests: MaintenanceDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assetId) filter.assetId = query.assetId;
    if (query.assignedToId) filter.assignedToId = query.assignedToId;

    const skip = (query.page - 1) * query.limit;
    const sort: Record<string, 1 | -1> = {
      [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1,
    };

    const [requests, total] = await Promise.all([
      Maintenance.find(filter)
        .populate('assetId', 'name assetTag')
        .populate('raisedById', 'name email')
        .populate('assignedToId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(query.limit)
        .lean<MaintenanceDocument[]>(),
      Maintenance.countDocuments(filter),
    ]);

    return { requests, total };
  }

  /**
   * Get a single maintenance request by ID with populated references.
   * @throws AppError 404 if not found
   */
  static async getById(id: string): Promise<MaintenanceDocument> {
    const maintenance = await Maintenance.findById(id)
      .populate('assetId', 'name assetTag status')
      .populate('raisedById', 'name email')
      .populate('assignedToId', 'name email');

    if (!maintenance) {
      throw new AppError('Maintenance request not found', 404, 'MAINTENANCE_NOT_FOUND');
    }

    return maintenance;
  }

  /**
   * Get all maintenance requests for a specific asset.
   */
  static async getByAsset(assetId: string): Promise<MaintenanceDocument[]> {
    return Maintenance.find({ assetId })
      .populate('raisedById', 'name email')
      .populate('assignedToId', 'name email')
      .sort({ createdAt: -1 })
      .lean<MaintenanceDocument[]>();
  }
}
