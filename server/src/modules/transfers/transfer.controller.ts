import type { Request, Response } from 'express';
import { TransferService } from './transfer.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../common/utils/response.js';
import type {
  CreateTransferInput,
  ApproveTransferInput,
  RejectTransferInput,
  QueryTransfersInput,
} from './transfer.schema.js';

export class TransferController {
  /** POST / — Request a transfer */
  static async requestTransfer(req: Request, res: Response): Promise<void> {
    const data = req.body as CreateTransferInput;
    const requestedById = req.user!._id;
    const transfer = await TransferService.requestTransfer(data, requestedById);
    sendCreated(res, transfer, 'Transfer request created successfully');
  }

  /** GET / — List transfers (paginated) */
  static async getAll(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as QueryTransfersInput;
    const { data, total } = await TransferService.getAll(query);
    sendPaginated(res, data, total, query.page, query.limit);
  }

  /** GET /:id — Get single transfer */
  static async getById(req: Request, res: Response): Promise<void> {
    const transfer = await TransferService.getById(req.params.i as string as string);
    sendSuccess(res, transfer);
  }

  /** PATCH /:id/approve — Approve a transfer */
  static async approve(req: Request, res: Response): Promise<void> {
    const data = req.body as ApproveTransferInput;
    const actorId = req.user!._id;
    const transfer = await TransferService.approveTransfer(
      req.params.i as string as string,
      actorId,
      data,
    );
    sendSuccess(res, transfer, 'Transfer approved successfully');
  }

  /** PATCH /:id/reject — Reject a transfer */
  static async reject(req: Request, res: Response): Promise<void> {
    const data = req.body as RejectTransferInput;
    const actorId = req.user!._id;
    const transfer = await TransferService.rejectTransfer(
      req.params.i as string as string,
      actorId,
      data,
    );
    sendSuccess(res, transfer, 'Transfer rejected');
  }

  /** PATCH /:id/complete — Complete an approved transfer */
  static async complete(req: Request, res: Response): Promise<void> {
    const actorId = req.user!._id;
    const transfer = await TransferService.completeTransfer(
      req.params.i as string as string,
      actorId,
    );
    sendSuccess(res, transfer, 'Transfer completed successfully');
  }
}
