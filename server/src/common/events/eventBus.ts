import { EventEmitter } from 'events';

// Event payload types — expanded in later phases as modules are added
export interface AppEvents {
  ASSET_REGISTERED: { assetId: string; actorId: string };
  ASSET_ALLOCATED: { allocationId: string; assetId: string; allocatedToId: string; actorId: string };
  TRANSFER_REQUESTED: { transferId: string; assetId: string; requestedById: string };
  TRANSFER_APPROVED: { transferId: string; assetId: string; actorId: string };
  TRANSFER_REJECTED: { transferId: string; assetId: string; actorId: string };
  ASSET_RETURNED: { allocationId: string; assetId: string; actorId: string };
  MAINTENANCE_REQUESTED: { maintenanceId: string; assetId: string; raisedById: string };
  MAINTENANCE_APPROVED: { maintenanceId: string; assetId: string; actorId: string };
  MAINTENANCE_RESOLVED: { maintenanceId: string; assetId: string; actorId: string };
  BOOKING_CREATED: { bookingId: string; resourceId: string; bookedById: string };
  BOOKING_CANCELLED: { bookingId: string; resourceId: string; actorId: string };
  AUDIT_ASSIGNED: { auditId: string; auditorIds: string[] };
  AUDIT_DISCREPANCY_FOUND: { auditId: string; auditItemId: string; assetId: string };
}

class TypedEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(20);
  }

  emit<K extends keyof AppEvents>(event: K, payload: AppEvents[K]): void {
    this.emitter.emit(event, payload);
  }

  on<K extends keyof AppEvents>(event: K, listener: (payload: AppEvents[K]) => void): void {
    this.emitter.on(event, listener as (...args: unknown[]) => void);
  }

  off<K extends keyof AppEvents>(event: K, listener: (payload: AppEvents[K]) => void): void {
    this.emitter.off(event, listener as (...args: unknown[]) => void);
  }
}

export const eventBus = new TypedEventBus();
