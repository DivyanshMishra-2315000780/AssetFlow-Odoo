// ============================================================
// AssetFlow — Application Constants
// ============================================================

// ---- User ----
export const UserRole = {
  ADMIN: 'ADMIN',
  ASSET_MANAGER: 'ASSET_MANAGER',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  EMPLOYEE: 'EMPLOYEE',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' } as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// ---- Asset ----
export const AssetStatus = {
  AVAILABLE: 'AVAILABLE',
  ALLOCATED: 'ALLOCATED',
  RESERVED: 'RESERVED',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  LOST: 'LOST',
  RETIRED: 'RETIRED',
  DISPOSED: 'DISPOSED',
} as const;
export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus];

export const AssetCondition = {
  NEW: 'NEW',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
  DAMAGED: 'DAMAGED',
} as const;
export type AssetCondition = (typeof AssetCondition)[keyof typeof AssetCondition];

// ---- Allocation ----
export const AllocationStatus = {
  ACTIVE: 'ACTIVE',
  RETURN_REQUESTED: 'RETURN_REQUESTED',
  RETURNED: 'RETURNED',
  TRANSFERRED: 'TRANSFERRED',
} as const;
export type AllocationStatus = (typeof AllocationStatus)[keyof typeof AllocationStatus];

export const AllocatedToType = {
  EMPLOYEE: 'EMPLOYEE',
  DEPARTMENT: 'DEPARTMENT',
} as const;
export type AllocatedToType = (typeof AllocatedToType)[keyof typeof AllocatedToType];

// ---- Transfer ----
export const TransferStatus = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
} as const;
export type TransferStatus = (typeof TransferStatus)[keyof typeof TransferStatus];

// ---- Booking ----
export const BookingStatus = {
  UPCOMING: 'UPCOMING',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

// ---- Maintenance ----
export const MaintenanceStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  TECHNICIAN_ASSIGNED: 'TECHNICIAN_ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
} as const;
export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

export const MaintenancePriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type MaintenancePriority = (typeof MaintenancePriority)[keyof typeof MaintenancePriority];

// ---- Audit ----
export const AuditStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED',
} as const;
export type AuditStatus = (typeof AuditStatus)[keyof typeof AuditStatus];

export const AuditItemResult = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  MISSING: 'MISSING',
  DAMAGED: 'DAMAGED',
} as const;
export type AuditItemResult = (typeof AuditItemResult)[keyof typeof AuditItemResult];

// ---- Department & Category ----
export const DepartmentStatus = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' } as const;
export type DepartmentStatus = (typeof DepartmentStatus)[keyof typeof DepartmentStatus];

export const CategoryStatus = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' } as const;
export type CategoryStatus = (typeof CategoryStatus)[keyof typeof CategoryStatus];

export const CustomFieldType = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  DATE: 'DATE',
  BOOLEAN: 'BOOLEAN',
} as const;
export type CustomFieldType = (typeof CustomFieldType)[keyof typeof CustomFieldType];

// ---- Notification ----
export const NotificationType = {
  ASSET_ASSIGNED: 'ASSET_ASSIGNED',
  ASSET_RETURN_REQUESTED: 'ASSET_RETURN_REQUESTED',
  ASSET_RETURNED: 'ASSET_RETURNED',
  TRANSFER_REQUESTED: 'TRANSFER_REQUESTED',
  TRANSFER_APPROVED: 'TRANSFER_APPROVED',
  TRANSFER_REJECTED: 'TRANSFER_REJECTED',
  MAINTENANCE_REQUESTED: 'MAINTENANCE_REQUESTED',
  MAINTENANCE_APPROVED: 'MAINTENANCE_APPROVED',
  MAINTENANCE_REJECTED: 'MAINTENANCE_REJECTED',
  BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_REMINDER: 'BOOKING_REMINDER',
  OVERDUE_RETURN: 'OVERDUE_RETURN',
  AUDIT_ASSIGNED: 'AUDIT_ASSIGNED',
  AUDIT_DISCREPANCY: 'AUDIT_DISCREPANCY',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// ---- Asset Status Transitions ----
export const ASSET_STATUS_TRANSITIONS: Record<AssetStatus, readonly AssetStatus[]> = {
  AVAILABLE: ['ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED'],
  ALLOCATED: ['AVAILABLE', 'UNDER_MAINTENANCE', 'LOST'],
  RESERVED: ['AVAILABLE', 'ALLOCATED', 'UNDER_MAINTENANCE'],
  UNDER_MAINTENANCE: ['AVAILABLE', 'RETIRED'],
  LOST: ['AVAILABLE', 'RETIRED'],
  RETIRED: ['DISPOSED'],
  DISPOSED: [],
};
