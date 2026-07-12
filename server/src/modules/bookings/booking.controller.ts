import type { Request, Response } from 'express';
import { BookingService } from './booking.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../common/utils/response.js';
import type { CreateBookingInput, CancelBookingInput, QueryBookingsInput } from './booking.schema.js';

export class BookingController {
  /** POST / */
  static async createBooking(req: Request, res: Response): Promise<void> {
    const data = req.body as CreateBookingInput;
    const booking = await BookingService.createBooking(data, (req as any).user._id);
    sendCreated(res, booking, 'Booking created successfully');
  }

  /** GET / */
  static async getAll(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as QueryBookingsInput;
    const { bookings, total } = await BookingService.getAll(query);
    sendPaginated(res, bookings, total, query.page, query.limit, 'Bookings retrieved');
  }

  /** GET /:id */
  static async getById(req: Request, res: Response): Promise<void> {
    const booking = await BookingService.getById(req.params.i as string as string);
    sendSuccess(res, booking, 'Booking retrieved');
  }

  /** PATCH /:id/cancel */
  static async cancelBooking(req: Request, res: Response): Promise<void> {
    const data = req.body as CancelBookingInput;
    const booking = await BookingService.cancelBooking(
      req.params.i as string as string,
      (req as any).user._id,
      data,
    );
    sendSuccess(res, booking, 'Booking cancelled');
  }

  /** GET /resource/:resourceId */
  static async getByResource(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const bookings = await BookingService.getByResource(
      req.params.resourceId as string,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    sendSuccess(res, bookings, 'Resource bookings retrieved');
  }

  /** GET /user/:userId */
  static async getByUser(req: Request, res: Response): Promise<void> {
    const bookings = await BookingService.getByUser(req.params.userId as string);
    sendSuccess(res, bookings, 'User bookings retrieved');
  }
}
