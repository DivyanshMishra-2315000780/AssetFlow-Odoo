import type { Request, Response } from 'express';
import { AllocationService } from './allocation.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../common/utils/response.js';
import type {
  CreateAllocationInput,
  ReturnRequestInput,
  ProcessReturnInput,
  QueryAllocationsInput,
} from './allocation.schema.js';

export class AllocationController {
  /** POST / — Allocate an asset */
  static async allocate(req: Request, res: Response): Promise<void> {
    const data = req.body as CreateAllocationInput;
    const actorId = req.user!._id;
    const allocation = await AllocationService.allocate(data, actorId);
    sendCreated(res, allocation, 'Asset allocated successfully');
  }

  /** GET / — List allocations (paginated) */
  static async getAll(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as QueryAllocationsInput;
    const { data, total } = await AllocationService.getAll(query);
    sendPaginated(res, data, total, query.page, query.limit);
  }

  /** GET /:id — Get single allocation */
  static async getById(req: Request, res: Response): Promise<void> {
    const allocation = await AllocationService.getById(req.params.i as string as string);
    sendSuccess(res, allocation);
  }

  /** PATCH /:id/request-return — Request return of an allocation */
  static async requestReturn(req: Request, res: Response): Promise<void> {
    const data = req.body as ReturnRequestInput;
    const userId = req.user!._id;
    const allocation = await AllocationService.requestReturn(
      req.params.i as string as string,
      userId,
      data,
    );
    sendSuccess(res, allocation, 'Return request submitted');
  }

  /** PATCH /:id/process-return — Process (confirm) asset return */
  static async processReturn(req: Request, res: Response): Promise<void> {
    const data = req.body as ProcessReturnInput;
    const actorId = req.user!._id;
    const allocation = await AllocationService.processReturn(
      req.params.i as string as string,
      actorId,
      data,
    );
    sendSuccess(res, allocation, 'Asset return processed successfully');
  }

  /** GET /asset/:assetId — Get allocation history for an asset */
  static async getByAsset(req: Request, res: Response): Promise<void> {
    const allocations = await AllocationService.getByAsset(req.params.assetId as string);
    sendSuccess(res, allocations);
  }

  /** GET /user/:userId — Get all allocations for a user */
  static async getByUser(req: Request, res: Response): Promise<void> {
    const allocations = await AllocationService.getByUser(req.params.userId as string);
    sendSuccess(res, allocations);
  }
}
