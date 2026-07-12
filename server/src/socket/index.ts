import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../modules/users/user.model.js';
import { eventBus } from '../common/events/eventBus.js';
import { UserRole } from '../config/constants.js';
import { AppError } from '../common/errors/AppError.js';

export const initializeSocket = (io: SocketIOServer) => {
  // Middleware for Socket Auth
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id).select('_id email role departmentId');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    console.log(`🔌 Socket connected: ${socket.id}, User: ${user.email}`);

    // Join user-specific room
    socket.join(`user:${user._id.toString()}`);

    // Join department room if applicable
    if (user.departmentId) {
      socket.join(`department:${user.departmentId.toString()}`);
    }

    // Join admin room if admin
    if (user.role === UserRole.ADMIN) {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}, User: ${user.email}`);
    });
  });

  // Listen to eventBus and emit via socket
  eventBus.on('ASSET_REGISTERED', (payload) => {
    io.to('admin').emit('notification', { type: 'ASSET_REGISTERED', payload });
  });

  eventBus.on('ASSET_ALLOCATED', (payload) => {
    io.to(`user:${payload.allocatedToId}`).emit('notification', { type: 'ASSET_ALLOCATED', payload });
  });

  eventBus.on('TRANSFER_REQUESTED', (payload) => {
    io.to('admin').emit('notification', { type: 'TRANSFER_REQUESTED', payload });
  });

  eventBus.on('TRANSFER_APPROVED', (payload) => {
    // Notify relevant parties
    io.to('admin').emit('notification', { type: 'TRANSFER_APPROVED', payload });
  });
  
  eventBus.on('TRANSFER_REJECTED', (payload) => {
    // Notify relevant parties
    io.to('admin').emit('notification', { type: 'TRANSFER_REJECTED', payload });
  });

  eventBus.on('ASSET_RETURNED', (payload) => {
    io.to('admin').emit('notification', { type: 'ASSET_RETURNED', payload });
  });
  
  eventBus.on('MAINTENANCE_REQUESTED', (payload) => {
    io.to('admin').emit('notification', { type: 'MAINTENANCE_REQUESTED', payload });
  });
  
  eventBus.on('MAINTENANCE_APPROVED', (payload) => {
    io.to('admin').emit('notification', { type: 'MAINTENANCE_APPROVED', payload });
  });
  
  eventBus.on('MAINTENANCE_RESOLVED', (payload) => {
    io.to(`user:${payload.actorId}`).emit('notification', { type: 'MAINTENANCE_RESOLVED', payload }); // Might need more specific recipient
  });
  
  eventBus.on('BOOKING_CREATED', (payload) => {
    io.to(`user:${payload.bookedById}`).emit('notification', { type: 'BOOKING_CREATED', payload });
  });
  
  eventBus.on('BOOKING_CANCELLED', (payload) => {
     io.to(`user:${payload.actorId}`).emit('notification', { type: 'BOOKING_CANCELLED', payload }); // Should likely go to booker
  });
  
  eventBus.on('AUDIT_ASSIGNED', (payload) => {
    payload.auditorIds.forEach(id => {
      io.to(`user:${id}`).emit('notification', { type: 'AUDIT_ASSIGNED', payload });
    });
  });

  eventBus.on('AUDIT_DISCREPANCY_FOUND', (payload) => {
    io.to('admin').emit('notification', { type: 'AUDIT_DISCREPANCY_FOUND', payload });
  });
};
