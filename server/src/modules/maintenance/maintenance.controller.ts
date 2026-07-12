import type { Request, Response } from 'express';
import { MaintenanceService } from './maintenance.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../common/utils/response.js';
import type {
  CreateMaintenanceInput,
  AssignTechnicianInput,
  ResolveMaintenanceInput,
  RejectMaintenanceInput,
  QueryMaintenanceInput,
} from './maintenance.schema.js';

export class MaintenanceController {
  /** POST / */
  static async createRequest(req: Request, res: Response): Promise<void> {
    const data = req.body as CreateMaintenanceInput;
    const maintenance = await MaintenanceService.createRequest(data, (req as any).user._id);
    sendCreated(res, maintenance, 'Maintenance request created');
  }

  /** GET / */
  static async getAll(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as QueryMaintenanceInput;
    const { requests, total } = await MaintenanceService.getAll(query);
    sendPaginated(res, requests, total, query.page, query.limit, 'Maintenance requests retrieved');
  }

  /** GET /:id */
  static async getById(req: Request, res: Response): Promise<void> {
    const maintenance = await MaintenanceService.getById(req.params.i as string as string);
    sendSuccess(res, maintenance, 'Maintenance request retrieved');
  }

  /** PATCH /:id/approve */
  static async approve(req: Request, res: Response): Promise<void> {
    const maintenance = await MaintenanceService.approveRequest(
      req.params.i as string as string,
      (req as any).user._id,
    );
    sendSuccess(res, maintenance, 'Maintenance request approved');
  }

  /** PATCH /:id/reject */
  static async reject(req: Request, res: Response): Promise<void> {
    const { reason } = req.body as RejectMaintenanceInput;
    const maintenance = await MaintenanceService.rejectRequest(
      req.params.i as string as string,
      (req as any).user._id,
      reason,
    );
    sendSuccess(res, maintenance, 'Maintenance request rejected');
  }

  /** PATCH /:id/assign */
  static async assign(req: Request, res: Response): Promise<void> {
    const data = req.body as AssignTechnicianInput;
    const maintenance = await MaintenanceService.assignTechnician(
      req.params.i as string as string,
      (req as any).user._id,
      data,
    );
    sendSuccess(res, maintenance, 'Technician assigned');
  }

  /** PATCH /:id/start */
  static async startWork(req: Request, res: Response): Promise<void> {
    const maintenance = await MaintenanceService.startWork(
      req.params.i as string as string,
      (req as any).user._id,
    );
    sendSuccess(res, maintenance, 'Maintenance work started');
  }

  /** PATCH /:id/resolve */
  static async resolve(req: Request, res: Response): Promise<void> {
    const data = req.body as ResolveMaintenanceInput;
    const maintenance = await MaintenanceService.resolve(
      req.params.i as string as string,
      (req as any).user._id,
      data,
    );
    sendSuccess(res, maintenance, 'Maintenance request resolved');
  }

  /** GET /asset/:assetId */
  static async getByAsset(req: Request, res: Response): Promise<void> {
    const requests = await MaintenanceService.getByAsset(req.params.assetId as string);
    sendSuccess(res, requests, 'Asset maintenance history retrieved');
  }
}
