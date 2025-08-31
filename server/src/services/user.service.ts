import { Prisma, User, Student, Organization, Notification } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { 
  NotFoundError, 
  ValidationError, 
  AuthenticationError 
} from '../middleware/error';
import { 
  UpdateUserProfileInput,
  DeleteAccountInput,
  UpdateNotificationSettingsInput,
  UpdatePrivacySettingsInput,
  GetNotificationsQuery,
  MarkNotificationReadInput,
  UserSearchQuery,
  ExportDataInput
} from '../schemas/user';
import { firebaseService } from '../config/firebase';

export class UserService {
  /**
   * Get user profile with related data
   */
  async getUserProfile(userId: string): Promise<{
    user: User;
    organization?: Organization;
    student?: Student & { 
      skills: any[]; 
      socialLinks: any[]; 
      portfolio?: any; 
    };
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: true,
          student: {
            include: {
              skills: true,
              socialLinks: true,
              portfolio: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return {
        user,
        organization: user.organization || undefined,
        student: user.student || undefined,
      };
    } catch (error) {
      logger.error('Failed to get user profile', { error, userId });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, data: UpdateUserProfileInput): Promise<{
    user: User;
    organization?: Organization;
    student?: Student;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true, student: true },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Update based on user role
      if (user.role === 'STUDENT' && user.student) {
        const updatedStudent = await prisma.student.update({
          where: { id: user.student.id },
          data: {
            fullName: data.fullName,
            bio: data.bio,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            country: data.country,
            postalCode: data.postalCode,
            avatar: data.avatar,
            linkedinUrl: data.linkedinUrl,
            githubUrl: data.githubUrl,
            portfolioUrl: data.portfolioUrl,
            resumeUrl: data.resumeUrl,
            dateOfBirth: data.dateOfBirth,
            isPublic: data.isPublic,
          },
        });

        logger.info('Student profile updated', {
          userId,
          studentId: updatedStudent.id,
        });

        return { user, student: updatedStudent };
      } else if (user.role === 'ORGANIZATION' && user.organization) {
        // For organizations, only update basic info
        const updatedOrg = await prisma.organization.update({
          where: { id: user.organization.id },
          data: {
            phone: data.phone,
            address: data.address,
          },
        });

        logger.info('Organization profile updated', {
          userId,
          organizationId: updatedOrg.id,
        });

        return { user, organization: updatedOrg };
      }

      return { user };
    } catch (error) {
      logger.error('Failed to update user profile', { error, userId });
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string, data: DeleteAccountInput): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true, student: true },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify email confirmation
      if (user.email !== data.confirmEmail) {
        throw new ValidationError('Email confirmation does not match');
      }

      // Start transaction to delete all related data
      await prisma.$transaction(async (tx) => {
        // Delete related data based on user role
        if (user.organization) {
          // Delete organization and all related data
          await tx.experience.deleteMany({
            where: { organizationId: user.organization.id },
          });
          
          await tx.studentInvitation.deleteMany({
            where: { organizationId: user.organization.id },
          });
          
          await tx.organizationStudent.deleteMany({
            where: { organizationId: user.organization.id },
          });
          
          await tx.verificationRequest.deleteMany({
            where: { organizationId: user.organization.id },
          });
          
          await tx.organization.delete({
            where: { id: user.organization.id },
          });
        }

        if (user.student) {
          // Delete student and all related data
          await tx.portfolioExperience.deleteMany({
            where: { portfolio: { studentId: user.student.id } },
          });
          
          await tx.portfolioSection.deleteMany({
            where: { portfolio: { studentId: user.student.id } },
          });
          
          await tx.portfolioAnalytics.deleteMany({
            where: { portfolio: { studentId: user.student.id } },
          });
          
          await tx.portfolio.deleteMany({
            where: { studentId: user.student.id },
          });
          
          await tx.experience.deleteMany({
            where: { studentId: user.student.id },
          });
          
          await tx.document.deleteMany({
            where: { studentId: user.student.id },
          });
          
          await tx.studentSkill.deleteMany({
            where: { studentId: user.student.id },
          });
          
          await tx.socialLink.deleteMany({
            where: { studentId: user.student.id },
          });
          
          await tx.studentInvitation.deleteMany({
            where: { studentId: user.student.id },
          });
          
          await tx.organizationStudent.deleteMany({
            where: { studentId: user.student.id },
          });
          
          await tx.verificationRequest.deleteMany({
            where: { studentId: user.student.id },
          });
          
          await tx.achievementBadge.deleteMany({
            where: { studentId: user.student.id },
          });
          
          await tx.student.delete({
            where: { id: user.student.id },
          });
        }

        // Delete audit logs and notifications
        await tx.auditLog.deleteMany({
          where: { userId },
        });
        
        await tx.notification.deleteMany({
          where: { userId },
        });

        // Finally delete the user
        await tx.user.delete({
          where: { id: userId },
        });
      });

      // Delete from Firebase
      await firebaseService.deleteUser(user.firebaseUid);

      logger.info('User account deleted successfully', {
        userId,
        email: user.email,
        role: user.role,
        reason: data.reason,
      });
    } catch (error) {
      logger.error('Failed to delete user account', { error, userId });
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getNotifications(
    userId: string, 
    query: GetNotificationsQuery
  ): Promise<{
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const { page = 1, limit = 20, type, category, isRead } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.NotificationWhereInput = {
        userId,
        ...(type && { type }),
        ...(category && { category }),
        ...(isRead !== undefined && { isRead }),
      };

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where }),
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get notifications', { error, userId });
      throw error;
    }
  }

  /**
   * Mark notifications as read
   */
  async markNotificationsRead(
    userId: string, 
    data: MarkNotificationReadInput
  ): Promise<{ updatedCount: number }> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          id: { in: data.notificationIds },
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      logger.info('Notifications marked as read', {
        userId,
        updatedCount: result.count,
        notificationIds: data.notificationIds,
      });

      return { updatedCount: result.count };
    } catch (error) {
      logger.error('Failed to mark notifications as read', { error, userId });
      throw error;
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    userId: string, 
    settings: UpdateNotificationSettingsInput
  ): Promise<void> {
    try {
      // Store notification settings in user metadata or separate settings table
      await prisma.user.update({
        where: { id: userId },
        data: {
          // Store in a JSON field or create a separate settings table
          // For now, we'll use a simple approach
        },
      });

      logger.info('Notification settings updated', { userId, settings });
    } catch (error) {
      logger.error('Failed to update notification settings', { error, userId });
      throw error;
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string, 
    settings: UpdatePrivacySettingsInput
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { student: true },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.student) {
        await prisma.student.update({
          where: { id: user.student.id },
          data: {
            preferences: {
              ...user.student.preferences as any,
              privacy: settings,
            },
          },
        });
      }

      logger.info('Privacy settings updated', { userId, settings });
    } catch (error) {
      logger.error('Failed to update privacy settings', { error, userId });
      throw error;
    }
  }

  /**
   * Search users (admin only)
   */
  async searchUsers(query: UserSearchQuery): Promise<{
    users: Array<User & { organization?: Organization; student?: Student }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const { 
        q, 
        role, 
        verified, 
        active, 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.UserWhereInput = {
        ...(q && {
          OR: [
            { email: { contains: q, mode: 'insensitive' } },
            { organization: { name: { contains: q, mode: 'insensitive' } } },
            { student: { fullName: { contains: q, mode: 'insensitive' } } },
          ],
        }),
        ...(role && { role }),
        ...(verified !== undefined && { verified }),
        ...(active !== undefined && { isActive: active }),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            organization: true,
            student: true,
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to search users', { error, query });
      throw error;
    }
  }

  /**
   * Export user data
   */
  async exportUserData(userId: string, options: ExportDataInput): Promise<{
    data: any;
    format: string;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: true,
          student: {
            include: {
              skills: true,
              socialLinks: true,
              portfolio: {
                include: {
                  portfolioSections: true,
                  experiences: {
                    include: {
                      experience: true,
                    },
                  },
                },
              },
              experiences: options.includeExperiences ? {
                include: {
                  organization: true,
                  documents: options.includeDocuments,
                },
              } : false,
              documents: options.includeDocuments,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Prepare export data
      const exportData: any = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          verified: user.verified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      };

      if (options.includePersonalData) {
        if (user.organization) {
          exportData.organization = user.organization;
        }
        if (user.student) {
          exportData.student = user.student;
        }
      }

      logger.info('User data exported', {
        userId,
        format: options.format,
        includePersonalData: options.includePersonalData,
        includeExperiences: options.includeExperiences,
        includeDocuments: options.includeDocuments,
      });

      return {
        data: exportData,
        format: options.format,
      };
    } catch (error) {
      logger.error('Failed to export user data', { error, userId });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId: string): Promise<{
    totalExperiences: number;
    verifiedExperiences: number;
    pendingExperiences: number;
    portfolioViews: number;
    skillsCount: number;
    organizationsCount: number;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { student: true, organization: true },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.role === 'STUDENT' && user.student) {
        const [
          totalExperiences,
          verifiedExperiences,
          pendingExperiences,
          skillsCount,
          organizationsCount,
          portfolioViews,
        ] = await Promise.all([
          prisma.experience.count({
            where: { studentId: user.student.id },
          }),
          prisma.experience.count({
            where: { 
              studentId: user.student.id,
              status: 'APPROVED',
            },
          }),
          prisma.experience.count({
            where: { 
              studentId: user.student.id,
              status: 'PENDING',
            },
          }),
          prisma.studentSkill.count({
            where: { studentId: user.student.id },
          }),
          prisma.organizationStudent.count({
            where: { 
              studentId: user.student.id,
              isActive: true,
            },
          }),
          prisma.portfolioAnalytics.aggregate({
            where: {
              portfolio: { studentId: user.student.id },
            },
            _sum: { views: true },
          }),
        ]);

        return {
          totalExperiences,
          verifiedExperiences,
          pendingExperiences,
          portfolioViews: portfolioViews._sum.views || 0,
          skillsCount,
          organizationsCount,
        };
      } else if (user.role === 'ORGANIZATION' && user.organization) {
        const [
          totalExperiences,
          verifiedExperiences,
          pendingExperiences,
          studentsCount,
        ] = await Promise.all([
          prisma.experience.count({
            where: { organizationId: user.organization.id },
          }),
          prisma.experience.count({
            where: { 
              organizationId: user.organization.id,
              status: 'APPROVED',
            },
          }),
          prisma.experience.count({
            where: { 
              organizationId: user.organization.id,
              status: 'PENDING',
            },
          }),
          prisma.organizationStudent.count({
            where: { 
              organizationId: user.organization.id,
              isActive: true,
            },
          }),
        ]);

        return {
          totalExperiences,
          verifiedExperiences,
          pendingExperiences,
          portfolioViews: 0,
          skillsCount: 0,
          organizationsCount: studentsCount, // Use as students count for orgs
        };
      }

      return {
        totalExperiences: 0,
        verifiedExperiences: 0,
        pendingExperiences: 0,
        portfolioViews: 0,
        skillsCount: 0,
        organizationsCount: 0,
      };
    } catch (error) {
      logger.error('Failed to get user statistics', { error, userId });
      throw error;
    }
  }

  /**
   * Create notification
   */
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    category?: string;
    actionUrl?: string;
    metadata?: any;
  }): Promise<Notification> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type as any || 'INFO',
          category: data.category,
          actionUrl: data.actionUrl,
          metadata: data.metadata,
        },
      });

      logger.info('Notification created', {
        notificationId: notification.id,
        userId: data.userId,
        type: data.type,
      });

      return notification;
    } catch (error) {
      logger.error('Failed to create notification', { error, data });
      throw error;
    }
  }
}
