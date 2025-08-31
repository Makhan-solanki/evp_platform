import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import app from './app';
import { prisma } from './config/database';
import { logger } from './config/logger';
import { gracefulShutdownHandler } from './middleware/error';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables', {
    missing: missingEnvVars,
  });
  logger.warn('Using default values for development. Please set up proper environment variables for production.');
  
  // Set default values for development
  process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/academix_db?schema=public";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-key-change-in-production";
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-jwt-secret-key-change-in-production";
}

// Configuration
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server
const server = createServer(app);

// Configure Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Socket.IO middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // TODO: Verify token and attach user to socket
    // For now, we'll just log the connection
    logger.info('Socket connection attempt', {
      socketId: socket.id,
      token: token ? 'provided' : 'missing',
    });

    next();
  } catch (error) {
    logger.error('Socket authentication failed', { error });
    next(new Error('Authentication failed'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('New socket connection', {
    socketId: socket.id,
    remoteAddress: socket.handshake.address,
  });

  // Handle user joining rooms
  socket.on('join-room', (data) => {
    try {
      const { userId, role } = data;
      
      if (!userId || !role) {
        socket.emit('error', { message: 'Invalid room data' });
        return;
      }

      // Join user-specific room
      socket.join(`user-${userId}`);
      
      // Join role-specific room
      socket.join(`role-${role.toLowerCase()}`);

      logger.info('User joined socket room', {
        socketId: socket.id,
        userId,
        role,
      });

      socket.emit('room-joined', { userId, role });
    } catch (error) {
      logger.error('Failed to join room', { error, socketId: socket.id });
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle user leaving rooms
  socket.on('leave-room', (data) => {
    try {
      const { userId, role } = data;
      
      socket.leave(`user-${userId}`);
      socket.leave(`role-${role.toLowerCase()}`);

      logger.info('User left socket room', {
        socketId: socket.id,
        userId,
        role,
      });
    } catch (error) {
      logger.error('Failed to leave room', { error, socketId: socket.id });
    }
  });

  // Handle notification mark as read
  socket.on('mark-notification-read', async (data) => {
    try {
      const { notificationId, userId } = data;
      
      // TODO: Update notification in database
      logger.info('Notification marked as read', {
        socketId: socket.id,
        notificationId,
        userId,
      });

      // Emit confirmation back to user
      socket.emit('notification-read', { notificationId });
    } catch (error) {
      logger.error('Failed to mark notification as read', { error });
      socket.emit('error', { message: 'Failed to mark notification as read' });
    }
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { roomId, userId } = data;
    socket.to(roomId).emit('user-typing', { userId, typing: true });
  });

  socket.on('typing-stop', (data) => {
    const { roomId, userId } = data;
    socket.to(roomId).emit('user-typing', { userId, typing: false });
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    logger.info('Socket disconnected', {
      socketId: socket.id,
      reason,
    });
  });

  // Handle errors
  socket.on('error', (error) => {
    logger.error('Socket error', {
      socketId: socket.id,
      error,
    });
  });
});

// Make io instance available to the app
app.set('io', io);

// Start server
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await prisma.connect();
    logger.info('Database connected successfully');

    // Start HTTP server
    server.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: NODE_ENV,
        processId: process.pid,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      });

      // Log server URLs
      const baseUrl = `http://localhost:${PORT}`;
      logger.info('Server URLs', {
        api: `${baseUrl}/api`,
        health: `${baseUrl}/health`,
        docs: `${baseUrl}/api/docs`,
      });
    });

    // Setup graceful shutdown
    gracefulShutdownHandler(server);

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Export io for use in other modules
export { io };

// Start the server
startServer().catch((error) => {
  logger.error('Server startup failed', { error });
  process.exit(1);
});
