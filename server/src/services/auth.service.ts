import { Prisma, User, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { 
  AuthenticationError, 
  ValidationError, 
  ConflictError,
  NotFoundError 
} from '../middleware/error';
import { RegisterInput, LoginInput } from '../schemas/auth';

export class AuthService {
  /**
   * Register a new user (traditional email/password)
   */
  async register(data: RegisterInput): Promise<{
    user: User;
    organization?: any;
    student?: any;
  }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user in database
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword, // Store hashed password directly
          role: data.role,
          emailVerified: false,
        },
      });

      let organization = null;
      let student = null;

      // Create role-specific profile
      if (data.role === 'ORGANIZATION') {
        organization = await prisma.organization.create({
          data: {
            name: data.organizationName!,
            description: data.organizationDescription,
            slug: await this.generateUniqueSlug(data.organizationName!),
            userId: user.id,
          },
        });
      } else if (data.role === 'STUDENT') {
        student = await prisma.student.create({
          data: {
            fullName: data.fullName!,
            bio: data.bio,
            portfolioSlug: await this.generateUniquePortfolioSlug(data.fullName!),
            userId: user.id,
          },
        });

        // Create empty portfolio
        await prisma.portfolio.create({
          data: {
            title: `${data.fullName}'s Portfolio`,
            studentId: student.id,
          },
        });
      }

      logger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { user, organization, student };
    } catch (error) {
      logger.error('Registration failed', { error, email: data.email });
      
      if (error instanceof ConflictError || error instanceof ValidationError) {
        throw error;
      }
      
      throw new Error('Registration failed');
    }
  }

  /**
   * Login user with email and password
   */
  async login(data: LoginInput): Promise<{
    user: User;
    organization?: any;
    student?: any;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  }> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          organization: true,
          student: true,
        },
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password || '');
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      logger.info('User login successful', {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user,
        organization: user.organization,
        student: user.student,
        tokens,
      };
    } catch (error) {
      logger.error('Login failed', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    try {
      // In a JWT-based system, we could invalidate tokens here
      // For now, we'll just log the logout
      logger.info('User logout', { userId });
    } catch (error) {
      logger.error('Logout failed', { error, userId });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<{
    user: User;
    organization?: any;
    student?: any;
  } | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: true,
          student: true,
        },
      });

      if (!user) {
        return null;
      }

      return {
        user,
        organization: user.organization,
        student: user.student,
      };
    } catch (error) {
      logger.error('Error getting user by ID', { error, userId });
      throw error;
    }
  }

  /**
   * Generate unique slug for organization
   */
  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.organization.findUnique({
        where: { slug },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Generate unique portfolio slug for student
   */
  private async generateUniquePortfolioSlug(name: string): Promise<string> {
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.student.findUnique({
        where: { portfolioSlug: slug },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Get total user count
   */
  async getUserCount(): Promise<number> {
    try {
      return await prisma.user.count();
    } catch (error) {
      logger.error('Get user count failed', { error });
      throw new Error('Failed to get user count');
    }
  }

  /**
   * Get organization count
   */
  async getOrganizationCount(): Promise<number> {
    try {
      return await prisma.organization.count();
    } catch (error) {
      logger.error('Get organization count failed', { error });
      throw new Error('Failed to get organization count');
    }
  }

  /**
   * Get student count
   */
  async getStudentCount(): Promise<number> {
    try {
      return await prisma.student.count();
    } catch (error) {
      logger.error('Get student count failed', { error });
      throw new Error('Failed to get student count');
    }
  }

  /**
   * Get active user count
   */
  async getActiveUserCount(): Promise<number> {
    try {
      return await prisma.user.count({
        where: { isActive: true },
      });
    } catch (error) {
      logger.error('Get active user count failed', { error });
      throw new Error('Failed to get active user count');
    }
  }

  /**
   * Get verified user count
   */
  async getVerifiedUserCount(): Promise<number> {
    try {
      return await prisma.user.count({
        where: { verified: true },
      });
    } catch (error) {
      logger.error('Get verified user count failed', { error });
      throw new Error('Failed to get verified user count');
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: Role): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role },
      });

      logger.info('User role updated', {
        userId: user.id,
        email: user.email,
        newRole: role,
      });

      return user;
    } catch (error) {
      logger.error('Update user role failed', { error, userId, role });
      throw new Error('Failed to update user role');
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      logger.info('User account deactivated', {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      logger.error('Deactivate user failed', { error, userId });
      throw new Error('Failed to deactivate user');
    }
  }

  /**
   * Reactivate user account
   */
  async reactivateUser(userId: string): Promise<void> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      });

      logger.info('User account reactivated', {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      logger.error('Reactivate user failed', { error, userId });
      throw new Error('Failed to reactivate user');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        logger.info('Password reset requested for non-existent email', { email });
        return;
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password-reset' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      // Store reset token in database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // TODO: Send email with reset link
      // For now, just log the token
      logger.info('Password reset token generated', {
        userId: user.id,
        email: user.email,
        resetToken: resetToken.substring(0, 10) + '...',
      });

      // In production, you would send an email here
      console.log(`Password reset link: ${process.env.CLIENT_URL}/reset-password?token=${resetToken}`);
    } catch (error) {
      logger.error('Send password reset email failed', { error, email });
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      if (decoded.type !== 'password-reset') {
        throw new ValidationError('Invalid reset token');
      }

      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          passwordResetToken: token,
          passwordResetExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new ValidationError('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      logger.info('Password reset successful', {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      logger.error('Reset password failed', { error, token: token.substring(0, 10) + '...' });
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw new Error('Failed to reset password');
    }
  }
}
