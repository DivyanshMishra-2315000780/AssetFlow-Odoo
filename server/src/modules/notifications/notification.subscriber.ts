import { eventBus } from '../../common/events/eventBus.js';
import { NotificationService } from './notification.service.js';
import { User } from '../users/user.model.js';
import { Asset } from '../assets/asset.model.js';
import { Transfer } from '../transfers/transfer.model.js';
import { Maintenance } from '../maintenance/maintenance.model.js';
import { Booking } from '../bookings/booking.model.js';
import { Audit } from '../audits/audit.model.js';
import { UserRole, NotificationType } from '../../config/constants.js';

export const initializeNotificationSubscriber = () => {
  // Helper to fetch all active admin IDs
  const getAdminIds = async (): Promise<string[]> => {
    const admins = await User.find({ role: UserRole.ADMIN, status: 'ACTIVE' }).select('_id');
    return admins.map((admin) => admin._id.toString());
  };

  // Helper to create notifications for multiple recipients
  const notifyRecipients = async (
    recipientIds: string[],
    type: any,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ) => {
    const promises = recipientIds.map((id) =>
      NotificationService.create(id, type, title, message, data).catch((err) =>
        console.error(`Failed to create notification for user ${id}:`, err)
      )
    );
    await Promise.all(promises);
  };

  // 1. ASSET_REGISTERED
  eventBus.on('ASSET_REGISTERED', async (payload) => {
    try {
      const asset = await Asset.findById(payload.assetId);
      if (!asset) return;

      const adminIds = await getAdminIds();
      await notifyRecipients(
        adminIds,
        NotificationType.ASSET_ASSIGNED, // Map to a generic or custom tag if needed
        'New Asset Registered',
        `A new asset "${asset.name}" (${asset.assetTag}) has been registered in the system.`,
        { assetId: payload.assetId, actorId: payload.actorId }
      );
    } catch (error) {
      console.error('Error handling ASSET_REGISTERED notification:', error);
    }
  });

  // 2. ASSET_ALLOCATED
  eventBus.on('ASSET_ALLOCATED', async (payload) => {
    try {
      const asset = await Asset.findById(payload.assetId);
      if (!asset) return;

      await NotificationService.create(
        payload.allocatedToId,
        NotificationType.ASSET_ASSIGNED,
        'Asset Allocated to You',
        `Asset "${asset.name}" (${asset.assetTag}) has been allocated to you.`,
        { allocationId: payload.allocationId, assetId: payload.assetId, actorId: payload.actorId }
      );
    } catch (error) {
      console.error('Error handling ASSET_ALLOCATED notification:', error);
    }
  });

  // 3. TRANSFER_REQUESTED
  eventBus.on('TRANSFER_REQUESTED', async (payload) => {
    try {
      const asset = await Asset.findById(payload.assetId);
      const requester = await User.findById(payload.requestedById);
      if (!asset || !requester) return;

      const adminIds = await getAdminIds();
      await notifyRecipients(
        adminIds,
        NotificationType.TRANSFER_REQUESTED,
        'Asset Transfer Requested',
        `Transfer has been requested for asset "${asset.name}" (${asset.assetTag}) by ${requester.firstName} ${requester.lastName}.`,
        { transferId: payload.transferId, assetId: payload.assetId, requestedById: payload.requestedById }
      );
    } catch (error) {
      console.error('Error handling TRANSFER_REQUESTED notification:', error);
    }
  });

  // 4. TRANSFER_APPROVED
  eventBus.on('TRANSFER_APPROVED', async (payload) => {
    try {
      const transfer = await Transfer.findById(payload.transferId);
      const asset = await Asset.findById(payload.assetId);
      if (!transfer || !asset) return;

      const adminIds = await getAdminIds();
      const recipients = Array.from(
        new Set([
          transfer.requestedById.toString(),
          transfer.toUserId.toString(),
          ...adminIds,
        ])
      );

      await notifyRecipients(
        recipients,
        NotificationType.TRANSFER_APPROVED,
        'Asset Transfer Approved',
        `The transfer request for asset "${asset.name}" (${asset.assetTag}) has been approved.`,
        { transferId: payload.transferId, assetId: payload.assetId, actorId: payload.actorId }
      );
    } catch (error) {
      console.error('Error handling TRANSFER_APPROVED notification:', error);
    }
  });

  // 5. TRANSFER_REJECTED
  eventBus.on('TRANSFER_REJECTED', async (payload) => {
    try {
      const transfer = await Transfer.findById(payload.transferId);
      const asset = await Asset.findById(payload.assetId);
      if (!transfer || !asset) return;

      await NotificationService.create(
        transfer.requestedById.toString(),
        NotificationType.TRANSFER_REJECTED,
        'Asset Transfer Rejected',
        `The transfer request for asset "${asset.name}" (${asset.assetTag}) was rejected. Reason: ${transfer.rejectionReason || 'Not specified'}.`,
        { transferId: payload.transferId, assetId: payload.assetId, actorId: payload.actorId }
      );
    } catch (error) {
      console.error('Error handling TRANSFER_REJECTED notification:', error);
    }
  });

  // 6. ASSET_RETURNED
  eventBus.on('ASSET_RETURNED', async (payload) => {
    try {
      const asset = await Asset.findById(payload.assetId);
      const actor = await User.findById(payload.actorId);
      if (!asset || !actor) return;

      const adminIds = await getAdminIds();
      await notifyRecipients(
        adminIds,
        NotificationType.ASSET_RETURNED,
        'Asset Returned',
        `Asset "${asset.name}" (${asset.assetTag}) has been returned by ${actor.firstName} ${actor.lastName}.`,
        { allocationId: payload.allocationId, assetId: payload.assetId, actorId: payload.actorId }
      );
    } catch (error) {
      console.error('Error handling ASSET_RETURNED notification:', error);
    }
  });

  // 7. MAINTENANCE_REQUESTED
  eventBus.on('MAINTENANCE_REQUESTED', async (payload) => {
    try {
      const asset = await Asset.findById(payload.assetId);
      const raisedBy = await User.findById(payload.raisedById);
      if (!asset || !raisedBy) return;

      const adminIds = await getAdminIds();
      await notifyRecipients(
        adminIds,
        NotificationType.MAINTENANCE_REQUESTED,
        'Asset Maintenance Requested',
        `Maintenance has been requested for asset "${asset.name}" (${asset.assetTag}) by ${raisedBy.firstName} ${raisedBy.lastName}.`,
        { maintenanceId: payload.maintenanceId, assetId: payload.assetId, raisedById: payload.raisedById }
      );
    } catch (error) {
      console.error('Error handling MAINTENANCE_REQUESTED notification:', error);
    }
  });

  // 8. MAINTENANCE_APPROVED
  eventBus.on('MAINTENANCE_APPROVED', async (payload) => {
    try {
      const maintenance = await Maintenance.findById(payload.maintenanceId);
      const asset = await Asset.findById(payload.assetId);
      if (!maintenance || !asset) return;

      const recipients = [maintenance.raisedById.toString()];
      if (maintenance.assignedToId) {
        recipients.push(maintenance.assignedToId.toString());
      }

      await notifyRecipients(
        recipients,
        NotificationType.MAINTENANCE_APPROVED,
        'Maintenance Approved',
        `Maintenance request for asset "${asset.name}" (${asset.assetTag}) has been approved.`,
        { maintenanceId: payload.maintenanceId, assetId: payload.assetId, actorId: payload.actorId }
      );
    } catch (error) {
      console.error('Error handling MAINTENANCE_APPROVED notification:', error);
    }
  });

  // 9. MAINTENANCE_RESOLVED
  eventBus.on('MAINTENANCE_RESOLVED', async (payload) => {
    try {
      const maintenance = await Maintenance.findById(payload.maintenanceId);
      const asset = await Asset.findById(payload.assetId);
      if (!maintenance || !asset) return;

      await NotificationService.create(
        maintenance.raisedById.toString(),
        NotificationType.MAINTENANCE_APPROVED, // Can be mapped to generic maintenance resolve in UI
        'Maintenance Resolved',
        `Maintenance issue for asset "${asset.name}" (${asset.assetTag}) has been resolved.`,
        { maintenanceId: payload.maintenanceId, assetId: payload.assetId, actorId: payload.actorId }
      );
    } catch (error) {
      console.error('Error handling MAINTENANCE_RESOLVED notification:', error);
    }
  });

  // 10. BOOKING_CREATED
  eventBus.on('BOOKING_CREATED', async (payload) => {
    try {
      const asset = await Asset.findById(payload.resourceId);
      if (!asset) return;

      await NotificationService.create(
        payload.bookedById,
        NotificationType.BOOKING_CONFIRMED,
        'Booking Confirmed',
        `Your booking for resource "${asset.name}" (${asset.assetTag}) is confirmed.`,
        { bookingId: payload.bookingId, resourceId: payload.resourceId }
      );
    } catch (error) {
      console.error('Error handling BOOKING_CREATED notification:', error);
    }
  });

  // 11. BOOKING_CANCELLED
  eventBus.on('BOOKING_CANCELLED', async (payload) => {
    try {
      const booking = await Booking.findById(payload.bookingId);
      const asset = await Asset.findById(payload.resourceId);
      if (!booking || !asset) return;

      await NotificationService.create(
        booking.bookedById.toString(),
        NotificationType.BOOKING_CANCELLED,
        'Booking Cancelled',
        `Your booking for resource "${asset.name}" (${asset.assetTag}) has been cancelled.`,
        { bookingId: payload.bookingId, resourceId: payload.resourceId, actorId: payload.actorId }
      );
    } catch (error) {
      console.error('Error handling BOOKING_CANCELLED notification:', error);
    }
  });

  // 12. AUDIT_ASSIGNED
  eventBus.on('AUDIT_ASSIGNED', async (payload) => {
    try {
      const audit = await Audit.findById(payload.auditId);
      if (!audit) return;

      await notifyRecipients(
        payload.auditorIds,
        NotificationType.AUDIT_ASSIGNED,
        'New Audit Assigned',
        `You have been assigned to audit: "${audit.title}".`,
        { auditId: payload.auditId }
      );
    } catch (error) {
      console.error('Error handling AUDIT_ASSIGNED notification:', error);
    }
  });

  // 13. AUDIT_DISCREPANCY_FOUND
  eventBus.on('AUDIT_DISCREPANCY_FOUND', async (payload) => {
    try {
      const audit = await Audit.findById(payload.auditId);
      const asset = await Asset.findById(payload.assetId);
      if (!audit || !asset) return;

      const adminIds = await getAdminIds();
      await notifyRecipients(
        adminIds,
        NotificationType.AUDIT_DISCREPANCY,
        'Audit Discrepancy Found',
        `Discrepancy found for asset "${asset.name}" (${asset.assetTag}) during audit "${audit.title}".`,
        { auditId: payload.auditId, auditItemId: payload.auditItemId, assetId: payload.assetId }
      );
    } catch (error) {
      console.error('Error handling AUDIT_DISCREPANCY_FOUND notification:', error);
    }
  });

  // 14. BOOKING_REMINDER (from jobs)
  eventBus.on('BOOKING_REMINDER' as any, async (payload: any) => {
    try {
      const asset = await Asset.findById(payload.resourceId);
      if (!asset) return;

      await NotificationService.create(
        payload.actorId,
        NotificationType.BOOKING_REMINDER,
        'Booking Starting Soon',
        `Reminder: Your booking for resource "${asset.name}" (${asset.assetTag}) starts in 1 hour.`,
        { bookingId: payload.bookingId, resourceId: payload.resourceId }
      );
    } catch (error) {
      console.error('Error handling BOOKING_REMINDER notification:', error);
    }
  });

  // 15. OVERDUE_RETURN (from jobs)
  eventBus.on('OVERDUE_RETURN' as any, async (payload: any) => {
    try {
      const asset = await Asset.findById(payload.assetId);
      if (!asset) return;

      await NotificationService.create(
        payload.actorId,
        NotificationType.OVERDUE_RETURN,
        'Asset Return Overdue',
        `Overdue Return: The expected return date for asset "${asset.name}" (${asset.assetTag}) has passed. Please return it.`,
        { allocationId: payload.allocationId, assetId: payload.assetId }
      );
    } catch (error) {
      console.error('Error handling OVERDUE_RETURN notification:', error);
    }
  });

  console.log('🔔 Notification subscribers registered');
};
