import mongoose from 'mongoose';
import { Booking, type BookingDocument } from './booking.model.js';
import type { CreateBookingInput, CancelBookingInput, QueryBookingsInput } from './booking.schema.js';
import { AppError } from '../../common/errors/AppError.js';
import { eventBus } from '../../common/events/eventBus.js';
import { BookingStatus, AssetStatus } from '../../config/constants.js';

export class BookingService {
  /**
   * Create a new resource booking after validating asset availability and checking for overlaps.
   * @throws AppError 404 if the asset does not exist
   * @throws AppError 400 if the asset is not bookable
   * @throws AppError 409 if there is a time-slot overlap
   */
  static async createBooking(
    data: CreateBookingInput,
    bookedById: string,
  ): Promise<BookingDocument> {
    const Asset = mongoose.model('Asset');
    const asset = await Asset.findById(data.resourceId);

    if (!asset) {
      throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND');
    }

    // Only AVAILABLE or ALLOCATED assets can be booked (shared resources)
    const bookableStatuses: string[] = [AssetStatus.AVAILABLE, AssetStatus.ALLOCATED];
    if (!bookableStatuses.includes((asset as any).status)) {
      throw new AppError(
        'Asset is not available for booking',
        400,
        'ASSET_NOT_BOOKABLE',
      );
    }

    // Overlap check: existing.start < new.end AND existing.end > new.start
    const overlap = await Booking.findOne({
      resourceId: data.resourceId,
      status: { $in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] },
      startTime: { $lt: data.endTime },
      endTime: { $gt: data.startTime },
    });

    if (overlap) {
      throw new AppError(
        'The requested time slot overlaps with an existing booking',
        409,
        'BOOKING_OVERLAP',
      );
    }

    const booking = await Booking.create({
      resourceId: data.resourceId,
      bookedById,
      startTime: data.startTime,
      endTime: data.endTime,
      purpose: data.purpose,
      notes: data.notes,
      status: BookingStatus.UPCOMING,
    });

    eventBus.emit('BOOKING_CREATED', {
      bookingId: booking._id.toString(),
      resourceId: data.resourceId,
      bookedById,
    });

    return booking;
  }

  /**
   * Cancel an existing booking. Only UPCOMING or ONGOING bookings can be cancelled.
   * @throws AppError 404 if booking not found
   * @throws AppError 400 if booking cannot be cancelled in its current status
   */
  static async cancelBooking(
    bookingId: string,
    actorId: string,
    data: CancelBookingInput,
  ): Promise<BookingDocument> {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    const cancellableStatuses: string[] = [BookingStatus.UPCOMING, BookingStatus.ONGOING];
    if (!cancellableStatuses.includes(booking.status)) {
      throw new AppError(
        `Cannot cancel a booking with status "${booking.status}"`,
        400,
        'BOOKING_CANCEL_INVALID',
      );
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancelledById = new mongoose.Types.ObjectId(actorId);
    booking.cancellationReason = data.cancellationReason;
    await booking.save();

    eventBus.emit('BOOKING_CANCELLED', {
      bookingId: booking._id.toString(),
      resourceId: booking.resourceId.toString(),
      actorId,
    });

    return booking;
  }

  /**
   * Get all bookings with pagination, filtering, and sorting.
   */
  static async getAll(
    query: QueryBookingsInput,
  ): Promise<{ bookings: BookingDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.resourceId) filter.resourceId = query.resourceId;
    if (query.bookedById) filter.bookedById = query.bookedById;
    if (query.status) filter.status = query.status;

    if (query.startDate || query.endDate) {
      filter.startTime = {};
      if (query.startDate) (filter.startTime as Record<string, unknown>).$gte = query.startDate;
      if (query.endDate) (filter.startTime as Record<string, unknown>).$lte = query.endDate;
    }

    const skip = (query.page - 1) * query.limit;
    const sort: Record<string, 1 | -1> = {
      [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1,
    };

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('resourceId', 'name assetTag')
        .populate('bookedById', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(query.limit)
        .lean<BookingDocument[]>(),
      Booking.countDocuments(filter),
    ]);

    return { bookings, total };
  }

  /**
   * Get a single booking by ID with populated references.
   * @throws AppError 404 if not found
   */
  static async getById(id: string): Promise<BookingDocument> {
    const booking = await Booking.findById(id)
      .populate('resourceId', 'name assetTag status')
      .populate('bookedById', 'name email')
      .populate('cancelledById', 'name email');

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    return booking;
  }

  /**
   * Get bookings for a specific resource (useful for availability calendars).
   */
  static async getByResource(
    resourceId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<BookingDocument[]> {
    const filter: Record<string, unknown> = {
      resourceId,
      status: { $in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] },
    };

    if (startDate || endDate) {
      if (startDate) filter.endTime = { $gte: startDate };
      if (endDate) filter.startTime = { ...(filter.startTime as object || {}), $lte: endDate };
    }

    return Booking.find(filter)
      .populate('bookedById', 'name email')
      .sort({ startTime: 1 })
      .lean<BookingDocument[]>();
  }

  /**
   * Get all bookings for a specific user.
   */
  static async getByUser(userId: string): Promise<BookingDocument[]> {
    return Booking.find({ bookedById: userId })
      .populate('resourceId', 'name assetTag')
      .sort({ startTime: -1 })
      .lean<BookingDocument[]>();
  }

  /**
   * Transition booking statuses based on current time (called by cron).
   * UPCOMING → ONGOING when startTime <= now
   * ONGOING → COMPLETED when endTime <= now
   */
  static async transitionStatuses(): Promise<{ toOngoing: number; toCompleted: number }> {
    const now = new Date();

    const ongoingResult = await Booking.updateMany(
      { status: BookingStatus.UPCOMING, startTime: { $lte: now } },
      { $set: { status: BookingStatus.ONGOING } },
    );

    const completedResult = await Booking.updateMany(
      { status: BookingStatus.ONGOING, endTime: { $lte: now } },
      { $set: { status: BookingStatus.COMPLETED } },
    );

    return {
      toOngoing: ongoingResult.modifiedCount,
      toCompleted: completedResult.modifiedCount,
    };
  }
}
