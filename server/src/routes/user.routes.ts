import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { 
  authenticateToken, 
  requireAdmin 
} from '../middleware/auth';
import { 
  generalRateLimit 
} from '../middleware/security';
import { 
  auditLogger,
  logUserAction,
  trackDataChange 
} from '../middleware/audit';
import {
  updateUserProfileSchema,
  deleteAccountSchema,
  updateNotificationSettingsSchema,
  updatePrivacySettingsSchema,
  getNotificationsQuerySchema,
  markNotificationReadSchema,
  userSearchQuerySchema,
  exportDataSchema,
} from '../schemas/user';
import { idParamSchema } from '../schemas/common';

const router = Router();
const userController = new UserController();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticateToken,
  userController.getProfile
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticateToken,
  validateBody(updateUserProfileSchema),
  logUserAction('update_profile', 'User updated profile'),
  trackDataChange('user', 'update'),
  auditLogger('update_profile', 'user'),
  userController.updateProfile
);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  '/account',
  authenticateToken,
  validateBody(deleteAccountSchema),
  logUserAction('delete_account', 'User deleted account'),
  auditLogger('delete_account', 'user'),
  userController.deleteAccount
);

/**
 * @route   GET /api/users/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get(
  '/notifications',
  authenticateToken,
  validateQuery(getNotificationsQuerySchema),
  userController.getNotifications
);

/**
 * @route   PUT /api/users/notifications/:id
 * @desc    Mark notification as read
 * @access  Private
 */
router.put(
  '/notifications/:id',
  authenticateToken,
  validateParams(idParamSchema),
  logUserAction('mark_notification_read', 'User marked notification as read'),
  userController.markNotificationsRead
);

/**
 * @route   PUT /api/users/notifications/mark-read
 * @desc    Mark multiple notifications as read
 * @access  Private
 */
router.put(
  '/notifications/mark-read',
  authenticateToken,
  validateBody(markNotificationReadSchema),
  logUserAction('mark_notifications_read', 'User marked multiple notifications as read'),
  userController.markMultipleNotificationsRead
);

/**
 * @route   GET /api/users/notifications/summary
 * @desc    Get notification summary
 * @access  Private
 */
router.get(
  '/notifications/summary',
  authenticateToken,
  userController.getNotificationSummary
);

/**
 * @route   PUT /api/users/settings/notifications
 * @desc    Update notification settings
 * @access  Private
 */
router.put(
  '/settings/notifications',
  authenticateToken,
  validateBody(updateNotificationSettingsSchema),
  logUserAction('update_notification_settings', 'User updated notification settings'),
  userController.updateNotificationSettings
);

/**
 * @route   PUT /api/users/settings/privacy
 * @desc    Update privacy settings
 * @access  Private
 */
router.put(
  '/settings/privacy',
  authenticateToken,
  validateBody(updatePrivacySettingsSchema),
  logUserAction('update_privacy_settings', 'User updated privacy settings'),
  userController.updatePrivacySettings
);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put(
  '/preferences',
  authenticateToken,
  logUserAction('update_preferences', 'User updated preferences'),
  userController.updatePreferences
);

/**
 * @route   GET /api/users/statistics
 * @desc    Get user statistics
 * @access  Private
 */
router.get(
  '/statistics',
  authenticateToken,
  userController.getUserStatistics
);

/**
 * @route   GET /api/users/activity
 * @desc    Get user activity log
 * @access  Private
 */
router.get(
  '/activity',
  authenticateToken,
  userController.getUserActivity
);

/**
 * @route   POST /api/users/export
 * @desc    Export user data
 * @access  Private
 */
router.post(
  '/export',
  authenticateToken,
  validateBody(exportDataSchema),
  logUserAction('export_data', 'User exported data'),
  auditLogger('export_data', 'user'),
  userController.exportData
);

// Admin only routes
/**
 * @route   GET /api/users/search
 * @desc    Search users (admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/search',
  authenticateToken,
  requireAdmin,
  validateQuery(userSearchQuerySchema),
  logUserAction('search_users', 'Admin searched users'),
  userController.searchUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/:id',
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  async (req, res, next) => {
    // Get user by ID for admin
    const userController = new UserController();
    // Implementation would be similar to getProfile but for any user
    res.json({
      success: true,
      message: 'Feature coming soon',
    });
  }
);

/**
 * @route   PUT /api/users/:id/status
 * @desc    Update user status (admin only)
 * @access  Private (Admin only)
 */
router.put(
  '/:id/status',
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  logUserAction('update_user_status', 'Admin updated user status'),
  auditLogger('update_user_status', 'user'),
  async (req, res, next) => {
    // Update user status (active/inactive)
    res.json({
      success: true,
      message: 'Feature coming soon',
    });
  }
);

/**
 * @route   POST /api/users/:id/verify
 * @desc    Verify user (admin only)
 * @access  Private (Admin only)
 */
router.post(
  '/:id/verify',
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  logUserAction('verify_user', 'Admin verified user'),
  auditLogger('verify_user', 'user'),
  async (req, res, next) => {
    // Verify user account
    res.json({
      success: true,
      message: 'Feature coming soon',
    });
  }
);

/**
 * @route   POST /api/users/:id/send-notification
 * @desc    Send notification to user (admin only)
 * @access  Private (Admin only)
 */
router.post(
  '/:id/send-notification',
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  logUserAction('send_notification', 'Admin sent notification to user'),
  auditLogger('send_notification', 'notification'),
  async (req, res, next) => {
    // Send notification to specific user
    res.json({
      success: true,
      message: 'Feature coming soon',
    });
  }
);

export default router;
