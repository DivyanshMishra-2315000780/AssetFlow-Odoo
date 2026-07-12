import { Router } from 'express';
import { BookingController } from './booking.controller.js';
import { createBookingSchema, cancelBookingSchema, queryBookingsSchema } from './booking.schema.js';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate } from '../../common/middleware/auth.js';

const router = Router();

// ── Resource & User sub-routes (before /:id to avoid param collisions) ──
router.get(
  '/resource/:resourceId',
  authenticate,
  asyncHandler(BookingController.getByResource),
);

router.get(
  '/user/:userId',
  authenticate,
  asyncHandler(BookingController.getByUser),
);

// ── CRUD routes ────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  validate(createBookingSchema),
  asyncHandler(BookingController.createBooking),
);

router.get(
  '/',
  authenticate,
  validate(queryBookingsSchema, 'query'),
  asyncHandler(BookingController.getAll),
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(BookingController.getById),
);

router.patch(
  '/:id/cancel',
  authenticate,
  validate(cancelBookingSchema),
  asyncHandler(BookingController.cancelBooking),
);

export default router;
