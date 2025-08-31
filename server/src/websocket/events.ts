import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../config/logger';
import { firebaseService } from '../config/firebase';
import { prisma } from '../config/database';
import { AuthenticatedSocket } from '../types';

export class WebSocketEvents {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    this.io.use(this.authenticateSocket.bind(this));
    
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info('User connected to WebSocket', {
        socketId: socket.id,
        userId: socket.user?.id,
        email: socket.user?.email,
      });

      // Join user-specific room
      if (socket.user) {
        socket.join(`user:${socket.user.id}`);
        
        // Join role-specific rooms
        if (socket.user.role === 'ORGANIZATION' && socket.user.organization) {
          socket.join(`organization:${socket.user.organization.id}`);
        } else if (socket.user.role === 'STUDENT' && socket.user.student) {
          socket.join(`student:${socket.user.student.id}`);
        }

        // Update user's online status
        this.updateUserOnlineStatus(socket.user.id, true);
      }

      // Setup event listeners
      this.setupUserEvents(socket);
      this.setupExperienceEvents(socket);
      this.setupNotificationEvents(socket);
      this.setupPortfolioEvents(socket);
      this.setupOrganizationEvents(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info('User disconnected from WebSocket', {
          socketId: socket.id,
          userId: socket.user?.id,
        });

        if (socket.user) {
          this.updateUserOnlineStatus(socket.user.id, false);
        }
      });
    });
  }

  /**
   * Authenticate socket connection
   */
  private async authenticateSocket(socket: Socket, next: Function): Promise<void> {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        logger.warn('WebSocket connection without token', { socketId: socket.id });
        return next();
      }

      // Verify Firebase token
      const decodedToken = await firebaseService.verifyIdToken(token);
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
        include: {
          organization: true,
          student: true,
        },
      });

      if (user) {
        (socket as AuthenticatedSocket).user = user;
        logger.info('WebSocket authenticated', {
          socketId: socket.id,
          userId: user.id,
          role: user.role,
        });
      }

      next();
    } catch (error) {
      logger.error('WebSocket authentication failed', { error, socketId: socket.id });
      next();
    }
  }

  /**
   * Setup user-related events
   */
  private setupUserEvents(socket: AuthenticatedSocket): void {
    // User status updates
    socket.on('user:status:update', (data: { status: string }) => {
      if (socket.user) {
        this.broadcastToUser(socket.user.id, 'user:status:changed', {
          userId: socket.user.id,
          status: data.status,
          timestamp: new Date(),
        });
      }
    });

    // User typing indicators
    socket.on('user:typing:start', (data: { chatId: string }) => {
      socket.to(data.chatId).emit('user:typing:indicator', {
        userId: socket.user?.id,
        isTyping: true,
      });
    });

    socket.on('user:typing:stop', (data: { chatId: string }) => {
      socket.to(data.chatId).emit('user:typing:indicator', {
        userId: socket.user?.id,
        isTyping: false,
      });
    });
  }

  /**
   * Setup experience-related events
   */
  private setupExperienceEvents(socket: AuthenticatedSocket): void {
    // Experience verification updates
    socket.on('experience:verify', async (data: { experienceId: string; status: string }) => {
      if (!socket.user || socket.user.role !== 'ORGANIZATION') {
        return;
      }

      try {
        const experience = await prisma.experience.findUnique({
          where: { id: data.experienceId },
          include: { student: true, organization: true },
        });

        if (experience && experience.organizationId === socket.user.organization?.id) {
          // Notify student
          this.broadcastToUser(experience.student.userId, 'experience:verification:update', {
            experienceId: experience.id,
            title: experience.title,
            status: data.status,
            organizationName: experience.organization?.name,
            timestamp: new Date(),
          });

          // Notify organization members
          this.broadcastToOrganization(experience.organizationId, 'experience:verified', {
            experienceId: experience.id,
            studentName: experience.student.fullName,
            status: data.status,
          });
        }
      } catch (error) {
        logger.error('Error handling experience verification event', { error, data });
      }
    });

    // Real-time experience creation
    socket.on('experience:created', (data: { experience: any }) => {
      if (socket.user?.role === 'ORGANIZATION') {
        this.broadcastToOrganization(socket.user.organization!.id, 'experience:new', {
          experience: data.experience,
          timestamp: new Date(),
        });
      }
    });
  }

  /**
   * Setup notification events
   */
  private setupNotificationEvents(socket: AuthenticatedSocket): void {
    // Mark notifications as read
    socket.on('notification:read', async (data: { notificationIds: string[] }) => {
      if (!socket.user) return;

      try {
        await prisma.notification.updateMany({
          where: {
            id: { in: data.notificationIds },
            userId: socket.user.id,
          },
          data: { isRead: true, readAt: new Date() },
        });

        socket.emit('notification:read:success', {
          notificationIds: data.notificationIds,
        });
      } catch (error) {
        logger.error('Error marking notifications as read', { error, data });
      }
    });

    // Get notification count
    socket.on('notification:count', async () => {
      if (!socket.user) return;

      try {
        const unreadCount = await prisma.notification.count({
          where: {
            userId: socket.user.id,
            isRead: false,
          },
        });

        socket.emit('notification:count:update', { unreadCount });
      } catch (error) {
        logger.error('Error getting notification count', { error });
      }
    });
  }

  /**
   * Setup portfolio events
   */
  private setupPortfolioEvents(socket: AuthenticatedSocket): void {
    // Portfolio view tracking
    socket.on('portfolio:view', async (data: { portfolioId: string; referrer?: string }) => {
      try {
        // Track portfolio view
        await prisma.portfolioAnalytics.create({
          data: {
            portfolioId: data.portfolioId,
            viewedAt: new Date(),
            ipAddress: socket.handshake.address,
            userAgent: socket.handshake.headers['user-agent'],
            referrer: data.referrer,
            userId: socket.user?.id,
          },
        });

        // Get portfolio owner
        const portfolio = await prisma.portfolio.findUnique({
          where: { id: data.portfolioId },
          include: { student: true },
        });

        if (portfolio) {
          // Notify portfolio owner of new view
          this.broadcastToUser(portfolio.student.userId, 'portfolio:view:new', {
            portfolioId: portfolio.id,
            viewerInfo: socket.user ? {
              name: socket.user.role === 'STUDENT' 
                ? socket.user.student?.fullName 
                : socket.user.organization?.name,
              role: socket.user.role,
            } : { anonymous: true },
            timestamp: new Date(),
          });
        }
      } catch (error) {
        logger.error('Error tracking portfolio view', { error, data });
      }
    });

    // Portfolio real-time editing
    socket.on('portfolio:edit:start', (data: { portfolioId: string }) => {
      socket.join(`portfolio:${data.portfolioId}:editing`);
      socket.to(`portfolio:${data.portfolioId}:editing`).emit('portfolio:edit:user:joined', {
        userId: socket.user?.id,
        userName: socket.user?.role === 'STUDENT' 
          ? socket.user.student?.fullName 
          : socket.user.organization?.name,
      });
    });

    socket.on('portfolio:edit:stop', (data: { portfolioId: string }) => {
      socket.leave(`portfolio:${data.portfolioId}:editing`);
      socket.to(`portfolio:${data.portfolioId}:editing`).emit('portfolio:edit:user:left', {
        userId: socket.user?.id,
      });
    });
  }

  /**
   * Setup organization events
   */
  private setupOrganizationEvents(socket: AuthenticatedSocket): void {
    // Student invitation events
    socket.on('organization:student:invite', (data: { email: string; message?: string }) => {
      if (socket.user?.role === 'ORGANIZATION') {
        this.broadcastToOrganization(socket.user.organization!.id, 'organization:invitation:sent', {
          email: data.email,
          message: data.message,
          sentBy: socket.user.organization!.name,
          timestamp: new Date(),
        });
      }
    });

    // Organization announcements
    socket.on('organization:announcement', (data: { title: string; message: string; targetRole?: string }) => {
      if (socket.user?.role === 'ORGANIZATION') {
        this.broadcastToOrganization(socket.user.organization!.id, 'organization:announcement:new', {
          title: data.title,
          message: data.message,
          targetRole: data.targetRole,
          organizationName: socket.user.organization!.name,
          timestamp: new Date(),
        });
      }
    });
  }

  /**
   * Broadcast message to specific user
   */
  public broadcastToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Broadcast message to organization members
   */
  public broadcastToOrganization(organizationId: string, event: string, data: any): void {
    this.io.to(`organization:${organizationId}`).emit(event, data);
  }

  /**
   * Broadcast message to student
   */
  public broadcastToStudent(studentId: string, event: string, data: any): void {
    this.io.to(`student:${studentId}`).emit(event, data);
  }

  /**
   * Broadcast to all connected clients
   */
  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  /**
   * Broadcast to role-specific clients
   */
  public broadcastToRole(role: string, event: string, data: any): void {
    this.io.to(role.toLowerCase()).emit(event, data);
  }

  /**
   * Update user online status
   */
  private async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          lastLogin: isOnline ? new Date() : undefined,
          // Add online status field if available in schema
        },
      });

      // Broadcast status change to relevant users
      this.broadcastToUser(userId, 'user:status:online', { isOnline });
    } catch (error) {
      logger.error('Error updating user online status', { error, userId, isOnline });
    }
  }

  /**
   * Send real-time notification
   */
  public async sendNotification(notification: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    actionUrl?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      // Save notification to database
      const savedNotification = await prisma.notification.create({
        data: {
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type as any || 'INFO',
          actionUrl: notification.actionUrl,
          metadata: notification.metadata,
        },
      });

      // Send real-time notification
      this.broadcastToUser(notification.userId, 'notification:new', {
        notification: savedNotification,
        timestamp: new Date(),
      });

      logger.info('Real-time notification sent', {
        notificationId: savedNotification.id,
        userId: notification.userId,
        type: notification.type,
      });
    } catch (error) {
      logger.error('Error sending real-time notification', { error, notification });
    }
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.io.sockets.sockets.size;
  }

  /**
   * Get online users in organization
   */
  public async getOnlineOrganizationMembers(organizationId: string): Promise<string[]> {
    const sockets = await this.io.in(`organization:${organizationId}`).fetchSockets();
    return sockets
      .map((socket: any) => socket.user?.id)
      .filter(Boolean);
  }

  /**
   * Force disconnect user
   */
  public disconnectUser(userId: string, reason?: string): void {
    this.io.in(`user:${userId}`).disconnectSockets(true);
    logger.info('User forcefully disconnected', { userId, reason });
  }
}
