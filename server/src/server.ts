import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env.ts';
import { connectDB } from './config/db.ts';
import app from './app.ts';
import { initializeSocket } from './socket/index.ts';
import { initializeJobs } from './jobs/index.ts';

// ── Create HTTP Server ──
const server = http.createServer(app);

// ── Socket.IO ──
export const io = new SocketIOServer(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },
});

initializeSocket(io);

// ── Start ──
const start = async (): Promise<void> => {
  try {
    await connectDB();
    initializeJobs();

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
