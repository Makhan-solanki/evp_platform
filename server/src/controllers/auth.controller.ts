import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AuthService } from '../services/auth.service';
import { logger } from '../config/logger';
import { 
  RegisterInput, 
  LoginInput, 
  UpdateUserRoleInput 
} from '../schemas/auth';
import { asyncHandler } from '../middleware/error';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register new user (traditional email/password)
   */
  register = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const data: RegisterInput = req.body;

    const result = await this.authService.register(data);

    logger.info('User registration successful', {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          verified: result.user.verified,
          emailVerified: result.user.emailVerified,
          createdAt: result.user.createdAt,
        },
        organization: result.organization,
        student: result.student,
      },
    });
  });



  /**
   * Login user
   */
  login = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const data: LoginInput = req.body;

    const result = await this.authService.login(data);

    logger.info('User login successful', {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          verified: result.user.verified,
          emailVerified: result.user.emailVerified,
          lastLogin: result.user.lastLogin,
        },
        organization: result.organization,
        student: result.student,
        tokens: result.tokens,
      },
    });
  });



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

    const result = await this.authService.getUserById(req.user.id);

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User profile not found',
      });
      return;
    }

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
        },
        organization: result.organization,
        student: result.student,
      },
    });
  });

  /**
   * Logout user
   */
  logout = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    await this.authService.logout(req.user.id);

    logger.info('User logout successful', {
      userId: req.user.id,
      email: req.user.email,
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  });



  /**
   * Update user role (admin only)
   */
  updateUserRole = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id: userId } = req.params;
    const data: UpdateUserRoleInput = req.body;

    const user = await this.authService.updateUserRole(userId, data.role);

    logger.info('User role updated', {
      adminId: req.user?.id,
      userId: user.id,
      newRole: data.role,
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          verified: user.verified,
          updatedAt: user.updatedAt,
        },
      },
    });
  });

  /**
   * Deactivate user account (admin only)
   */
  deactivateUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id: userId } = req.params;

    await this.authService.deactivateUser(userId);

    logger.info('User account deactivated', {
      adminId: req.user?.id,
      userId,
    });

    res.json({
      success: true,
      message: 'User account deactivated successfully',
    });
  });

  /**
   * Reactivate user account (admin only)
   */
  reactivateUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id: userId } = req.params;

    await this.authService.reactivateUser(userId);

    logger.info('User account reactivated', {
      adminId: req.user?.id,
      userId,
    });

    res.json({
      success: true,
      message: 'User account reactivated successfully',
    });
  });



  /**
   * Send password reset email
   */
  forgotPassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;

    await this.authService.sendPasswordResetEmail(email);

    logger.info('Password reset email sent', {
      email,
    });

    res.json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  });

  /**
   * Reset password with token
   */
  resetPassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { token, password } = req.body;

    await this.authService.resetPassword(token, password);

    logger.info('Password reset successful', {
      token: token.substring(0, 10) + '...',
    });

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  });

  /**
   * Get user statistics (admin only)
   */
  getUserStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Get basic user statistics
    const [
      totalUsers,
      totalOrganizations,
      totalStudents,
      activeUsers,
      verifiedUsers,
    ] = await Promise.all([
      this.authService.getUserCount(),
      this.authService.getOrganizationCount(),
      this.authService.getStudentCount(),
      this.authService.getActiveUserCount(),
      this.authService.getVerifiedUserCount(),
    ]);

    res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        totalUsers,
        totalOrganizations,
        totalStudents,
        activeUsers,
        verifiedUsers,
      },
    });
  });
}


