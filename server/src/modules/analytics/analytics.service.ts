import { Asset } from '../assets/asset.model.js';
import { User } from '../users/user.model.js';
import { Department } from '../departments/department.model.js';
import { Maintenance } from '../maintenance/maintenance.model.js';
import { Booking } from '../bookings/booking.model.js';
import { Allocation } from '../allocations/allocation.model.js';
import { AssetStatus, BookingStatus, MaintenanceStatus, AllocationStatus, UserStatus } from '../../config/constants.js';
import mongoose from 'mongoose';

export class AnalyticsService {
  /**
   * Get role-based dashboard stats
   */
  static async getDashboardStats(userId: string, role: string, departmentId?: string) {
    const isGlobalViewer = role === 'ADMIN' || role === 'ASSET_MANAGER';

    if (isGlobalViewer) {
      const [
        totalAssets,
        allocatedAssets,
        availableAssets,
        maintenanceAssets,
        totalUsers,
        totalDepartments,
        pendingMaintenance,
        activeBookings,
      ] = await Promise.all([
        Asset.countDocuments(),
        Asset.countDocuments({ status: AssetStatus.ALLOCATED }),
        Asset.countDocuments({ status: AssetStatus.AVAILABLE }),
        Asset.countDocuments({ status: AssetStatus.UNDER_MAINTENANCE }),
        User.countDocuments(),
        Department.countDocuments(),
        Maintenance.countDocuments({ status: MaintenanceStatus.PENDING }),
        Booking.countDocuments({ status: { $in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] } }),
      ]);

      return {
        scope: 'global',
        stats: {
          totalAssets,
          allocatedAssets,
          availableAssets,
          maintenanceAssets,
          totalUsers,
          totalDepartments,
          pendingMaintenance,
          activeBookings,
        },
      };
    } else if (role === 'DEPARTMENT_HEAD' && departmentId) {
      const deptObjectId = new mongoose.Types.ObjectId(departmentId);

      const [
        totalAssets,
        allocatedAssets,
        availableAssets,
        totalMembers,
        pendingMaintenance,
        activeBookings,
      ] = await Promise.all([
        Asset.countDocuments({ departmentId: deptObjectId }),
        Asset.countDocuments({ departmentId: deptObjectId, status: AssetStatus.ALLOCATED }),
        Asset.countDocuments({ departmentId: deptObjectId, status: AssetStatus.AVAILABLE }),
        User.countDocuments({ departmentId: deptObjectId, status: UserStatus.ACTIVE }),
        Maintenance.countDocuments({
          status: MaintenanceStatus.PENDING,
          assetId: { $in: await Asset.find({ departmentId: deptObjectId }).distinct('_id') },
        }),
        Booking.countDocuments({
          status: { $in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] },
          resourceId: { $in: await Asset.find({ departmentId: deptObjectId }).distinct('_id') },
        }),
      ]);

      return {
        scope: 'department',
        departmentId,
        stats: {
          totalAssets,
          allocatedAssets,
          availableAssets,
          totalMembers,
          pendingMaintenance,
          activeBookings,
        },
      };
    } else {
      // Regular Employee
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const [
        myAllocatedAssets,
        myActiveBookings,
        myPendingMaintenance,
      ] = await Promise.all([
        Allocation.countDocuments({ allocatedToId: userObjectId, status: AllocationStatus.ACTIVE }),
        Booking.countDocuments({ bookedById: userObjectId, status: { $in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] } }),
        Maintenance.countDocuments({ raisedById: userObjectId, status: MaintenanceStatus.PENDING }),
      ]);

      return {
        scope: 'employee',
        userId,
        stats: {
          myAllocatedAssets,
          myActiveBookings,
          myPendingMaintenance,
        },
      };
    }
  }

  /**
   * Asset Analytics (Value, categories, departments, condition)
   */
  static async getAssetAnalytics() {
    // 1. Assets count and cost by category
    const categoryBreakdown = await Asset.aggregate([
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$purchaseCost', 0] } },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          count: 1,
          totalValue: 1,
          name: { $ifNull: ['$category.name', 'Uncategorized'] },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    // 2. Assets count and cost by department
    const departmentBreakdown = await Asset.aggregate([
      {
        $group: {
          _id: '$departmentId',
          count: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$purchaseCost', 0] } },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          count: 1,
          totalValue: 1,
          name: { $ifNull: ['$department.name', 'Unallocated'] },
          code: { $ifNull: ['$department.code', 'N/A'] },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    // 3. Asset condition distribution
    const conditionBreakdown = await Asset.aggregate([
      {
        $group: {
          _id: '$condition',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 4. Asset status distribution
    const statusBreakdown = await Asset.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 5. Overall summary
    const overallSummary = await Asset.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$purchaseCost', 0] } },
          avgValue: { $avg: '$purchaseCost' },
        },
      },
    ]);

    return {
      summary: overallSummary[0] || { totalCount: 0, totalValue: 0, avgValue: 0 },
      categoryBreakdown,
      departmentBreakdown,
      conditionBreakdown,
      statusBreakdown,
    };
  }

  /**
   * Maintenance cost & priority stats
   */
  static async getMaintenanceAnalytics() {
    // 1. Total & Avg Maintenance Cost
    const costSummary = await Maintenance.aggregate([
      {
        $group: {
          _id: null,
          totalCost: { $sum: { $ifNull: ['$cost', 0] } },
          avgCost: { $avg: '$cost' },
          count: { $sum: 1 },
          resolvedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', MaintenanceStatus.RESOLVED] }, 1, 0],
            },
          },
        },
      },
    ]);

    // 2. Monthly Maintenance Costs (last 12 months)
    const monthlyCosts = await Maintenance.aggregate([
      {
        $match: {
          status: MaintenanceStatus.RESOLVED,
          resolvedAt: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$resolvedAt' },
            month: { $month: '$resolvedAt' },
          },
          cost: { $sum: '$cost' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    // 3. Priority breakdown
    const priorityBreakdown = await Maintenance.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 4. Status breakdown
    const statusBreakdown = await Maintenance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      summary: costSummary[0] || { totalCost: 0, avgCost: 0, count: 0, resolvedCount: 0 },
      monthlyCosts,
      priorityBreakdown,
      statusBreakdown,
    };
  }

  /**
   * Bookings and Resource Utilization Analytics
   */
  static async getBookingAnalytics() {
    // 1. Resource utilization (most booked assets)
    const resourceUtilization = await Booking.aggregate([
      {
        $group: {
          _id: '$resourceId',
          bookingCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'assets',
          localField: '_id',
          foreignField: '_id',
          as: 'resource',
        },
      },
      { $unwind: { path: '$resource', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          bookingCount: 1,
          name: { $ifNull: ['$resource.name', 'Deleted Resource'] },
          assetTag: { $ifNull: ['$resource.assetTag', 'N/A'] },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 },
    ]);

    // 2. Bookings by user department
    const bookingsByDepartment = await Booking.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'bookedById',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$user.departmentId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          count: 1,
          name: { $ifNull: ['$department.name', 'Unassigned'] },
          code: { $ifNull: ['$department.code', 'N/A'] },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      resourceUtilization,
      bookingsByDepartment,
    };
  }
}
