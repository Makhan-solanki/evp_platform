import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody, validateParams } from '../middleware/validation';
import { 
  authenticateToken, 
  requireAdmin,
  optionalAuth 
} from '../middleware/auth';
import { 
  authRateLimit, 
  bruteForceProtection 
} from '../middleware/security';
import { 
  auditLogger,
  trackLoginAttempt,
  logUserAction 
} from '../middleware/audit';
import {
  registerSchema,
  loginSchema,
  updateUserRoleSchema,
} from '../schemas/auth';
import { idParamSchema } from '../schemas/common';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (traditional email/password)
 * @access  Public
 */
router.post(
  '/register',
  authRateLimit,
  validateBody(registerSchema),
  auditLogger('register', 'user'),
  authController.register
);



/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authRateLimit,
  bruteForceProtection,
  validateBody(loginSchema),
  trackLoginAttempt,
  auditLogger('login', 'user'),
  authController.login
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  authRateLimit,
  auditLogger('forgot_password', 'user'),
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  authRateLimit,
  auditLogger('reset_password', 'user'),
  authController.resetPassword
);



/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticateToken,
  authController.getProfile
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticateToken,
  logUserAction('logout', 'User logged out'),
  auditLogger('logout', 'user'),
  authController.logout
);







// Admin only routes
/**
 * @route   PUT /api/auth/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 */
router.put(
  '/users/:id/role',
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateUserRoleSchema),
  logUserAction('update_user_role', 'Admin updated user role'),
  auditLogger('update_user_role', 'user'),
  authController.updateUserRole
);

/**
 * @route   PUT /api/auth/users/:id/deactivate
 * @desc    Deactivate user account
 * @access  Private (Admin only)
 */
router.put(
  '/users/:id/deactivate',
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  logUserAction('deactivate_user', 'Admin deactivated user account'),
  auditLogger('deactivate_user', 'user'),
  authController.deactivateUser
);

/**
 * @route   PUT /api/auth/users/:id/reactivate
 * @desc    Reactivate user account
 * @access  Private (Admin only)
 */
router.put(
  '/users/:id/reactivate',
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  logUserAction('reactivate_user', 'Admin reactivated user account'),
  auditLogger('reactivate_user', 'user'),
  authController.reactivateUser
);

/**
 * @route   GET /api/auth/stats
 * @desc    Get user statistics
 * @access  Private (Admin only)
 */
router.get(
  '/stats',
  authenticateToken,
  requireAdmin,
  authController.getUserStats
);

export default router;
