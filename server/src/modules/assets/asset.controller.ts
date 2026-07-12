import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../common/utils/response.js';
import { AssetService } from './asset.service.js';

/**
 * POST / — Create a new asset
 */
export const createAsset = asyncHandler(async (req: Request, res: Response) => {
  const actorId = req.user!._id;
  const asset = await AssetService.create(req.body, actorId);
  sendCreated(res, asset, 'Asset created successfully');
});

/**
 * GET / — List assets with pagination, filters, and search
 */
export const getAssets = asyncHandler(async (req: Request, res: Response) => {
  const { data, total, page, limit } = await AssetService.getAll(req.query as any);
  sendPaginated(res, data, total, page, limit, 'Assets retrieved successfully');
});

/**
 * GET /:id — Get a single asset by ID
 */
export const getAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await AssetService.getById(req.params.i as string as string);
  sendSuccess(res, asset, 'Asset retrieved successfully');
});

/**
 * PUT /:id — Update asset fields (not status)
 */
export const updateAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await AssetService.update(req.params.i as string as string, req.body);
  sendSuccess(res, asset, 'Asset updated successfully');
});

/**
 * PATCH /:id/status — Change asset status with transition validation
 */
export const changeAssetStatus = asyncHandler(async (req: Request, res: Response) => {
  const actorId = req.user!._id;
  const asset = await AssetService.changeStatus(req.params.i as string as string, req.body.status, actorId);
  sendSuccess(res, asset, 'Asset status updated successfully');
});

/**
 * DELETE /:id — Delete an asset (only if AVAILABLE or DISPOSED)
 */
export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await AssetService.delete(req.params.i as string as string);
  sendSuccess(res, asset, 'Asset deleted successfully');
});

/**
 * GET /:id/lifecycle — Get the full lifecycle timeline for an asset
 */
export const getAssetLifecycle = asyncHandler(async (req: Request, res: Response) => {
  const timeline = await AssetService.getLifecycleTimeline(req.params.i as string as string);
  sendSuccess(res, timeline, 'Asset lifecycle retrieved successfully');
});
