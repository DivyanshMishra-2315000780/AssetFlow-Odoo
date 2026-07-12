import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';

// ── Create HTTP Server ──
const server = http.createServer(app);

// ── Socket.IO ──
export const io = new SocketIOServer(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },
});

// Socket auth & room joining will be implemented in Phase 9
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── Start ──
const start = async (): Promise<void> => {
  try {
    await connectDB();

    server.listen(env.PORT, () => {
      console.log(`🚀 AssetFlow server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ── Graceful Shutdown ──
const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
