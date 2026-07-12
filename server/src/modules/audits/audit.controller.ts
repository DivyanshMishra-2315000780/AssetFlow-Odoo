import { Request, Response } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { AuditService } from './audit.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../common/utils/response.js';

export const createAudit = asyncHandler(async (req: Request, res: Response) => {
  const audit = await AuditService.create(req.body, req.user!._id);
  sendCreated(res, audit, 'Audit created successfully');
});

export const getAudits = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuditService.getAll(req.query);
  sendPaginated(res, result.data, result.total, result.page, result.limit);
});

export const getAudit = asyncHandler(async (req: Request, res: Response) => {
  const audit = await AuditService.getById(req.params.i as string as string);
  sendSuccess(res, audit);
});

export const scheduleAudit = asyncHandler(async (req: Request, res: Response) => {
  const audit = await AuditService.schedule(req.params.i as string as string, req.user!._id);
  sendSuccess(res, audit, 'Audit scheduled successfully');
});

export const startAudit = asyncHandler(async (req: Request, res: Response) => {
  const audit = await AuditService.startAudit(req.params.i as string as string, req.user!._id);
  sendSuccess(res, audit, 'Audit started successfully');
});

export const addAuditItems = asyncHandler(async (req: Request, res: Response) => {
  const audit = await AuditService.addItems(req.params.i as string as string, req.body.items);
  sendSuccess(res, audit, 'Audit items added successfully');
});

export const verifyAuditItem = asyncHandler(async (req: Request, res: Response) => {
  const audit = await AuditService.verifyItem(
    req.params.i as string as string,
    parseInt(req.params.itemIndex as string),
    req.body,
    req.user!._id
  );
  sendSuccess(res, audit, 'Audit item verified');
});

export const completeAudit = asyncHandler(async (req: Request, res: Response) => {
  const audit = await AuditService.completeAudit(req.params.i as string as string, req.user!._id);
  sendSuccess(res, audit, 'Audit completed successfully');
});

export const closeAudit = asyncHandler(async (req: Request, res: Response) => {
  const audit = await AuditService.closeAudit(req.params.i as string as string, req.user!._id);
  sendSuccess(res, audit, 'Audit closed successfully');
});
