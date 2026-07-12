import cron from 'node-cron';
import { Booking } from '../modules/bookings/booking.model.js';
import { Allocation } from '../modules/allocations/allocation.model.js';
import { BookingStatus, AllocationStatus, NotificationType } from '../config/constants.js';
import { eventBus } from '../common/events/eventBus.js';

export const initializeJobs = () => {
  // Booking Status Transitions (Runs every minute)
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // UPCOMING -> ONGOING
      await Booking.updateMany(
        { status: BookingStatus.UPCOMING, startTime: { $lte: now } },
        { $set: { status: BookingStatus.ONGOING } }
      );

      // ONGOING -> COMPLETED
      await Booking.updateMany(
        { status: BookingStatus.ONGOING, endTime: { $lte: now } },
        { $set: { status: BookingStatus.COMPLETED } }
      );
      
    } catch (error) {
      console.error('Error in Booking Status Transition Job:', error);
    }
  });

  // Booking Reminder (Runs every 15 minutes, checks for bookings starting in next 1 hour)
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const oneHourAnd15MinsFromNow = new Date(now.getTime() + 75 * 60 * 1000);

      const upcomingBookings = await Booking.find({
        status: BookingStatus.UPCOMING,
        startTime: { $gt: oneHourFromNow, $lte: oneHourAnd15MinsFromNow }
      });

      upcomingBookings.forEach(booking => {
         eventBus.emit('BOOKING_REMINDER' as any, {
             bookingId: booking._id.toString(),
             resourceId: booking.resourceId.toString(),
             actorId: booking.bookedById.toString()
         });
      });

    } catch (error) {
       console.error('Error in Booking Reminder Job:', error);
    }
  });

  // Overdue Return Check (Runs daily at 8 AM)
  cron.schedule('0 8 * * *', async () => {
    try {
      const now = new Date();
      
      const overdueAllocations = await Allocation.find({
        status: AllocationStatus.ACTIVE,
        expectedReturnDate: { $lt: now }
      });

      overdueAllocations.forEach(allocation => {
        eventBus.emit('OVERDUE_RETURN' as any, {
            allocationId: allocation._id.toString(),
            assetId: allocation.assetId.toString(),
            actorId: allocation.allocatedToId.toString()
        });
      });

    } catch (error) {
       console.error('Error in Overdue Return Job:', error);
    }
  });
  
  console.log('⏱️  Cron jobs initialized');
};
