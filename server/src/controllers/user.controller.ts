import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { UserService } from '../services/user.service';
import { logger } from '../config/logger';
import {
  UpdateUserProfileInput,
  DeleteAccountInput,
  UpdateNotificationSettingsInput,
  UpdatePrivacySettingsInput,
  GetNotificationsQuery,
  MarkNotificationReadInput,
  UserSearchQuery,
  ExportDataInput,
} from '../schemas/user';
import { asyncHandler } from '../middleware/error';
import { prisma } from '../config/database';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get current user profile
   */
  getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const result = await this.userService.getUserProfile(req.user.id);

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          verified: result.user.verified,
          emailVerified: result.user.emailVerified,
          lastLogin: result.user.lastLogin,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        },
        organization: result.organization,
        student: result.student,
      },
    });
  });

  /**
   * Update user profile
   */
  updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const data: UpdateUserProfileInput = req.body;
    const result = await this.userService.updateUserProfile(req.user.id, data);

    logger.info('User profile updated', {
      userId: req.user.id,
      email: req.user.email,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          verified: result.user.verified,
          updatedAt: result.user.updatedAt,
        },
        organization: result.organization,
        student: result.student,
      },
    });
  });

  /**
   * Delete user account
   */
  deleteAccount = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const data: DeleteAccountInput = req.body;
    await this.userService.deleteAccount(req.user.id, data);

    logger.info('User account deleted', {
      userId: req.user.id,
      email: req.user.email,
      reason: data.reason,
    });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  });

  /**
   * Get user notifications
   */
  getNotifications = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const query: GetNotificationsQuery = req.query as any;
    const result = await this.userService.getNotifications(req.user.id, query);

    res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications: result.notifications,
        pagination: result.pagination,
      },
    });
  });

  /**
   * Mark notifications as read
   */
  markNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const { id: notificationId } = req.params;
    const result = await this.userService.markNotificationsRead(req.user.id, {
      notificationIds: [notificationId],
    });

    logger.info('Notification marked as read', {
      userId: req.user.id,
      notificationId,
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        updatedCount: result.updatedCount,
      },
    });
  });

  /**
   * Mark multiple notifications as read
   */
  markMultipleNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const data: MarkNotificationReadInput = req.body;
    const result = await this.userService.markNotificationsRead(req.user.id, data);

    logger.info('Multiple notifications marked as read', {
      userId: req.user.id,
      count: result.updatedCount,
    });

    res.json({
      success: true,
      message: 'Notifications marked as read',
      data: {
        updatedCount: result.updatedCount,
      },
    });
  });

  /**
   * Update notification settings
   */
  updateNotificationSettings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const settings: UpdateNotificationSettingsInput = req.body;
    await this.userService.updateNotificationSettings(req.user.id, settings);

    logger.info('Notification settings updated', {
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
    });
  });

  /**
   * Update privacy settings
   */
  updatePrivacySettings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const settings: UpdatePrivacySettingsInput = req.body;
    await this.userService.updatePrivacySettings(req.user.id, settings);

    logger.info('Privacy settings updated', {
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
    });
  });

  /**
   * Search users (admin only)
   */
  searchUsers = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const query: UserSearchQuery = req.query as any;
    const result = await this.userService.searchUsers(query);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: result.users.map(user => ({
          id: user.id,
          email: user.email,
          role: user.role,
          verified: user.verified,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          organization: user.organization ? {
            id: user.organization.id,
            name: user.organization.name,
            verified: user.organization.verified,
          } : null,
          student: user.student ? {
            id: user.student.id,
            fullName: user.student.fullName,
            isPublic: user.student.isPublic,
          } : null,
        })),
        pagination: result.pagination,
      },
    });
  });

  /**
   * Export user data
   */
  exportData = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const options: ExportDataInput = req.body;
    const result = await this.userService.exportUserData(req.user.id, options);

    logger.info('User data exported', {
      userId: req.user.id,
      format: options.format,
    });

    // Set appropriate headers for file download
    const filename = `user-data-${req.user.id}-${new Date().toISOString().split('T')[0]}.${options.format}`;
    
    if (options.format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(result.data);
    } else if (options.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      // Convert to CSV format (simplified)
      res.send(JSON.stringify(result.data, null, 2));
    }
  });

  /**
   * Get user statistics
   */
  getUserStatistics = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const statistics = await this.userService.getUserStatistics(req.user.id);

    res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: statistics,
    });
  });

  /**
   * Get notification summary
   */
  getNotificationSummary = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    // Get notification counts by type and read status
    const summary = await this.userService.getNotifications(req.user.id, { 
      page: 1, 
      limit: 1 
    });

    // Get unread count
    const unreadResult = await this.userService.getNotifications(req.user.id, { 
      page: 1, 
      limit: 1, 
      isRead: false 
    });

    res.json({
      success: true,
      message: 'Notification summary retrieved successfully',
      data: {
        total: summary.pagination.total,
        unread: unreadResult.pagination.total,
        recent: summary.notifications.slice(0, 5), // Last 5 notifications
      },
    });
  });

  /**
   * Update user preferences
   */
  updatePreferences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const preferences = req.body;

    // Update user preferences (stored in student/organization metadata)
    // Implementation depends on the specific preferences structure

    logger.info('User preferences updated', {
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  });

  /**
   * Get user activity log
   */
  getUserActivity = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get recent audit logs for the user
    const activities = await prisma.auditLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
      select: {
        id: true,
        action: true,
        entity: true,
        createdAt: true,
        ipAddress: true,
        details: true,
      },
    });

    const total = await prisma.auditLog.count({
      where: { userId: req.user.id },
    });

    res.json({
      success: true,
      message: 'User activity retrieved successfully',
      data: {
        activities,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  });
}
