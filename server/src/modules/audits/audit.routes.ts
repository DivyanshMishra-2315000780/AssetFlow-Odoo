import { Router } from 'express';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { validate } from '../../common/middleware/validate.js';
import { UserRole } from '../../config/constants.js';
import {
  createAuditSchema,
  queryAuditsSchema,
  addAuditItemsSchema,
  verifyAuditItemSchema,
} from './audit.schema.js';
import {
  createAudit,
  getAudits,
  getAudit,
  scheduleAudit,
  startAudit,
  addAuditItems,
  verifyAuditItem,
  completeAudit,
  closeAudit,
} from './audit.controller.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  validate(createAuditSchema),
  createAudit
);

router.get(
  '/',
  authenticate,
  validate(queryAuditsSchema, 'query'),
  getAudits
);

router.get('/:id', authenticate, getAudit);

router.patch(
  '/:id/schedule',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  scheduleAudit
);

router.patch(
  '/:id/start',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  startAudit
);

router.post(
  '/:id/items',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  validate(addAuditItemsSchema),
  addAuditItems
);

router.patch(
  '/:id/items/:itemIndex/verify',
  authenticate,
  validate(verifyAuditItemSchema),
  verifyAuditItem
);

router.patch(
  '/:id/complete',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ASSET_MANAGER),
  completeAudit
);

router.patch(
  '/:id/close',
  authenticate,
  authorize(UserRole.ADMIN),
  closeAudit
);

export default router;
