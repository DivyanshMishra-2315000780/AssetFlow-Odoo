import { Types } from 'mongoose';
import { Audit } from './audit.model.js';
import { Asset } from '../assets/asset.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { eventBus } from '../../common/events/eventBus.js';
import { AuditStatus, AuditItemResult } from '../../config/constants.js';

export class AuditService {
  static async create(data: any, createdById: string) {
    const audit = new Audit({
      ...data,
      createdById: new Types.ObjectId(createdById),
      assignedAuditorIds: data.assignedAuditorIds.map((id: string) => new Types.ObjectId(id)),
      departmentId: data.departmentId ? new Types.ObjectId(data.departmentId) : null,
      status: AuditStatus.DRAFT,
    });

    await audit.save();

    eventBus.emit('AUDIT_ASSIGNED', {
      auditId: audit._id.toString(),
      auditorIds: data.assignedAuditorIds,
    });

    return audit;
  }

  static async schedule(auditId: string, actorId: string) {
    const audit = await Audit.findById(auditId);
    if (!audit) throw new AppError('Audit not found', 404, 'NOT_FOUND');
    if (audit.status !== AuditStatus.DRAFT) {
      throw new AppError('Only DRAFT audits can be scheduled', 400, 'INVALID_STATUS');
    }

    audit.status = AuditStatus.SCHEDULED;
    await audit.save();
    return audit;
  }

  static async startAudit(auditId: string, actorId: string) {
    const audit = await Audit.findById(auditId);
    if (!audit) throw new AppError('Audit not found', 404, 'NOT_FOUND');
    if (audit.status !== AuditStatus.SCHEDULED) {
      throw new AppError('Only SCHEDULED audits can be started', 400, 'INVALID_STATUS');
    }

    if (audit.items.length === 0 && audit.departmentId) {
      const assets = await Asset.find({ departmentId: audit.departmentId });
      audit.items = assets.map((a) => ({
        assetId: a._id,
        expectedStatus: a.status,
        expectedLocation: a.location,
        result: AuditItemResult.PENDING,
      }));
    }

    audit.status = AuditStatus.IN_PROGRESS;
    await audit.save();
    return audit;
  }

  static async addItems(auditId: string, items: any[]) {
    const audit = await Audit.findById(auditId);
    if (!audit) throw new AppError('Audit not found', 404, 'NOT_FOUND');
    if (audit.status !== AuditStatus.DRAFT && audit.status !== AuditStatus.SCHEDULED) {
      throw new AppError('Can only add items to DRAFT or SCHEDULED audits', 400, 'INVALID_STATUS');
    }

    const newItems = items.map(item => ({
      ...item,
      assetId: new Types.ObjectId(item.assetId),
      result: AuditItemResult.PENDING
    }));

    audit.items.push(...newItems);
    await audit.save();
    return audit;
  }

  static async verifyItem(auditId: string, itemIndex: number, data: any, verifiedById: string) {
    const audit = await Audit.findById(auditId);
    if (!audit) throw new AppError('Audit not found', 404, 'NOT_FOUND');
    if (audit.status !== AuditStatus.IN_PROGRESS) {
      throw new AppError('Audit is not in progress', 400, 'INVALID_STATUS');
    }

    const item = audit.items[itemIndex];
    if (!item) throw new AppError('Audit item not found', 404, 'NOT_FOUND');

    item.result = data.result;
    if (data.actualStatus) item.actualStatus = data.actualStatus;
    if (data.actualLocation) item.actualLocation = data.actualLocation;
    if (data.notes) item.notes = data.notes;
    item.verifiedAt = new Date();
    item.verifiedById = new Types.ObjectId(verifiedById);

    if (data.result === AuditItemResult.MISSING || data.result === AuditItemResult.DAMAGED) {
      eventBus.emit('AUDIT_DISCREPANCY_FOUND', {
        auditId: audit._id.toString(),
        auditItemId: (item as any)._id.toString(),
        assetId: item.assetId.toString(),
      });
    }

    this.recalculateSummary(audit);
    await audit.save();
    return audit;
  }

  private static recalculateSummary(audit: any) {
    let verified = 0, missing = 0, damaged = 0;
    audit.items.forEach((item: any) => {
      if (item.result === AuditItemResult.VERIFIED) verified++;
      else if (item.result === AuditItemResult.MISSING) missing++;
      else if (item.result === AuditItemResult.DAMAGED) damaged++;
    });
    audit.summary = {
      total: audit.items.length,
      verified,
      missing,
      damaged,
    };
  }

  static async completeAudit(auditId: string, actorId: string) {
    const audit = await Audit.findById(auditId);
    if (!audit) throw new AppError('Audit not found', 404, 'NOT_FOUND');
    if (audit.status !== AuditStatus.IN_PROGRESS) {
      throw new AppError('Audit is not in progress', 400, 'INVALID_STATUS');
    }

    const hasPending = audit.items.some((i) => i.result === AuditItemResult.PENDING);
    if (hasPending) {
      throw new AppError('Cannot complete audit with pending items', 400, 'PENDING_ITEMS');
    }

    this.recalculateSummary(audit);
    audit.status = AuditStatus.COMPLETED;
    audit.completedDate = new Date();
    await audit.save();
    return audit;
  }

  static async closeAudit(auditId: string, actorId: string) {
    const audit = await Audit.findById(auditId);
    if (!audit) throw new AppError('Audit not found', 404, 'NOT_FOUND');
    if (audit.status !== AuditStatus.COMPLETED) {
      throw new AppError('Only COMPLETED audits can be closed', 400, 'INVALID_STATUS');
    }

    audit.status = AuditStatus.CLOSED;
    await audit.save();
    return audit;
  }

  static async getAll(query: any) {
    const { page, limit, status, departmentId, sortBy, sortOrder } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (departmentId) filter.departmentId = new Types.ObjectId(departmentId);

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      Audit.find(filter)
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
        .populate('departmentId', 'name code')
        .populate('createdById', 'firstName lastName email'),
      Audit.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  static async getById(id: string) {
    const audit = await Audit.findById(id)
      .populate('departmentId', 'name code')
      .populate('createdById', 'firstName lastName email')
      .populate('assignedAuditorIds', 'firstName lastName email')
      .populate('items.assetId', 'assetTag name status condition');
    if (!audit) throw new AppError('Audit not found', 404, 'NOT_FOUND');
    return audit;
  }
}
