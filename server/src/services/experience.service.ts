import { Prisma, Experience, Student, Organization, Document, VerificationStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError,
  AuthorizationError 
} from '../middleware/error';
import {
  CreateExperienceInput,
  UpdateExperienceInput,
  VerifyExperienceInput,
  GetExperiencesQuery,
  GetPublicExperiencesQuery,
  ExperienceAnalyticsQuery,
  BulkExperienceOperationsInput,
  CreateExperienceTemplateInput,
  ExperienceFeedbackInput,
} from '../schemas/experience';

export class ExperienceService {
  /**
   * Create experience
   */
  async createExperience(
    organizationId: string, 
    data: CreateExperienceInput
  ): Promise<Experience> {
    try {
      // Validate student exists and is part of organization
      const studentOrganization = await prisma.organizationStudent.findFirst({
        where: {
          organizationId,
          studentId: data.studentId,
          isActive: true,
        },
        include: {
          student: true,
        },
      });

      if (!studentOrganization) {
        throw new ValidationError('Student is not part of this organization');
      }

      // Create experience
      const experience = await prisma.experience.create({
        data: {
          title: data.title,
          description: data.description,
          shortDescription: data.shortDescription,
          startDate: data.startDate,
          endDate: data.endDate,
          isOngoing: data.isOngoing,
          location: data.location,
          type: data.type,
          level: data.level,
          skills: data.skills,
          technologies: data.technologies,
          responsibilities: data.responsibilities,
          achievements: data.achievements,
          hoursDedicated: data.hoursDedicated,
          certificateUrl: data.certificateUrl,
          projectUrl: data.projectUrl,
          githubUrl: data.githubUrl,
          studentId: data.studentId,
          organizationId,
          isHighlighted: data.isHighlighted,
          isPublic: data.isPublic,
          status: 'PENDING',
          metadata: data.metadata,
        },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      });

      // TODO: Send notification to student

      logger.info('Experience created', {
        experienceId: experience.id,
        organizationId,
        studentId: data.studentId,
        title: experience.title,
      });

      return experience;
    } catch (error) {
      logger.error('Failed to create experience', { error, organizationId, data });
      throw error;
    }
  }

  /**
   * Get experience by ID
   */
  async getExperienceById(
    experienceId: string,
    userId?: string
  ): Promise<Experience & {
    student: { id: string; fullName: string; avatar?: string };
    organization: { id: string; name: string; logo?: string };
    documents?: Document[];
  }> {
    try {
      const experience = await prisma.experience.findUnique({
        where: { id: experienceId },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          documents: true,
        },
      });

      if (!experience) {
        throw new NotFoundError('Experience not found');
      }

      // Check if user has access to view this experience
      if (!experience.isPublic) {
        if (!userId) {
          throw new AuthorizationError('Access denied');
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { student: true, organization: true },
        });

        if (!user) {
          throw new AuthorizationError('Access denied');
        }

        // Allow access if user is the student, part of the organization, or admin
        const hasAccess = 
          (user.student && user.student.id === experience.studentId) ||
          (user.organization && user.organization.id === experience.organizationId) ||
          user.role === 'ADMIN';

        if (!hasAccess) {
          throw new AuthorizationError('Access denied');
        }
      }

      return experience;
    } catch (error) {
      logger.error('Failed to get experience', { error, experienceId });
      throw error;
    }
  }

  /**
   * Update experience
   */
  async updateExperience(
    experienceId: string,
    data: UpdateExperienceInput,
    userId: string
  ): Promise<Experience> {
    try {
      const experience = await prisma.experience.findUnique({
        where: { id: experienceId },
        include: {
          student: { include: { user: true } },
          organization: { include: { user: true } },
        },
      });

      if (!experience) {
        throw new NotFoundError('Experience not found');
      }

      // Check permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { student: true, organization: true },
      });

      if (!user) {
        throw new AuthorizationError('User not found');
      }

      const canUpdate = 
        (user.student && user.student.id === experience.studentId) ||
        (user.organization && user.organization.id === experience.organizationId) ||
        user.role === 'ADMIN';

      if (!canUpdate) {
        throw new AuthorizationError('Permission denied');
      }

      const updatedExperience = await prisma.experience.update({
        where: { id: experienceId },
        data: {
          title: data.title,
          description: data.description,
          shortDescription: data.shortDescription,
          startDate: data.startDate,
          endDate: data.endDate,
          isOngoing: data.isOngoing,
          location: data.location,
          type: data.type,
          level: data.level,
          skills: data.skills,
          technologies: data.technologies,
          responsibilities: data.responsibilities,
          achievements: data.achievements,
          hoursDedicated: data.hoursDedicated,
          certificateUrl: data.certificateUrl,
          projectUrl: data.projectUrl,
          githubUrl: data.githubUrl,
          isHighlighted: data.isHighlighted,
          isPublic: data.isPublic,
          metadata: data.metadata,
        },
      });

      logger.info('Experience updated', {
        experienceId,
        userId,
        updatedFields: Object.keys(data),
      });

      return updatedExperience;
    } catch (error) {
      logger.error('Failed to update experience', { error, experienceId, userId });
      throw error;
    }
  }

  /**
   * Delete experience
   */
  async deleteExperience(experienceId: string, userId: string): Promise<void> {
    try {
      const experience = await prisma.experience.findUnique({
        where: { id: experienceId },
        include: {
          student: { include: { user: true } },
          organization: { include: { user: true } },
        },
      });

      if (!experience) {
        throw new NotFoundError('Experience not found');
      }

      // Check permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { student: true, organization: true },
      });

      if (!user) {
        throw new AuthorizationError('User not found');
      }

      const canDelete = 
        (user.organization && user.organization.id === experience.organizationId) ||
        user.role === 'ADMIN';

      if (!canDelete) {
        throw new AuthorizationError('Permission denied');
      }

      // Delete experience and related data
      await prisma.$transaction(async (tx) => {
        // Delete related documents
        await tx.document.deleteMany({
          where: { experienceId },
        });

        // Delete portfolio experiences
        await tx.portfolioExperience.deleteMany({
          where: { experienceId },
        });

        // Delete the experience
        await tx.experience.delete({
          where: { id: experienceId },
        });
      });

      logger.info('Experience deleted', {
        experienceId,
        userId,
        organizationId: experience.organizationId,
      });
    } catch (error) {
      logger.error('Failed to delete experience', { error, experienceId, userId });
      throw error;
    }
  }

  /**
   * Verify experience
   */
  async verifyExperience(
    experienceId: string,
    data: VerifyExperienceInput,
    verifiedBy: string
  ): Promise<Experience> {
    try {
      const experience = await prisma.experience.findUnique({
        where: { id: experienceId },
        include: {
          student: true,
          organization: true,
        },
      });

      if (!experience) {
        throw new NotFoundError('Experience not found');
      }

      // Check if user has permission to verify (organization or admin)
      const user = await prisma.user.findUnique({
        where: { id: verifiedBy },
        include: { organization: true },
      });

      if (!user) {
        throw new AuthorizationError('User not found');
      }

      const canVerify = 
        (user.organization && user.organization.id === experience.organizationId) ||
        user.role === 'ADMIN';

      if (!canVerify) {
        throw new AuthorizationError('Permission denied');
      }

      const updatedExperience = await prisma.experience.update({
        where: { id: experienceId },
        data: {
          status: data.status,
          verifiedAt: data.status === 'APPROVED' ? new Date() : null,
          verifiedBy: data.status === 'APPROVED' ? verifiedBy : null,
          metadata: {
            ...experience.metadata as any,
            verification: {
              status: data.status,
              note: data.verificationNote,
              rejectionReason: data.rejectionReason,
              requestedChanges: data.requestedChanges,
              verificationDocuments: data.verificationDocuments,
              verifiedBy,
              verifiedAt: new Date(),
            },
          },
        },
      });

      // TODO: Send notification to student

      logger.info('Experience verification updated', {
        experienceId,
        status: data.status,
        verifiedBy,
        studentId: experience.studentId,
      });

      return updatedExperience;
    } catch (error) {
      logger.error('Failed to verify experience', { error, experienceId, data });
      throw error;
    }
  }

  /**
   * Get experiences with filters
   */
  async getExperiences(query: GetExperiencesQuery): Promise<{
    experiences: Array<Experience & {
      student: { id: string; fullName: string; avatar?: string };
      organization: { id: string; name: string; logo?: string };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        type, 
        level, 
        status, 
        organizationId, 
        studentId, 
        skills, 
        isHighlighted, 
        isPublic, 
        startDate, 
        endDate, 
        location, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.ExperienceWhereInput = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(type.length > 0 && { type: { in: type } }),
        ...(level.length > 0 && { level: { in: level } }),
        ...(status.length > 0 && { status: { in: status } }),
        ...(organizationId && { organizationId }),
        ...(studentId && { studentId }),
        ...(skills.length > 0 && {
          skills: {
            hasSome: skills,
          },
        }),
        ...(isHighlighted !== undefined && { isHighlighted }),
        ...(isPublic !== undefined && { isPublic }),
        ...(startDate && { startDate: { gte: new Date(startDate) } }),
        ...(endDate && { endDate: { lte: new Date(endDate) } }),
        ...(location && { location: { contains: location, mode: 'insensitive' } }),
      };

      const [experiences, total] = await Promise.all([
        prisma.experience.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.experience.count({ where }),
      ]);

      return {
        experiences,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get experiences', { error, query });
      throw error;
    }
  }

  /**
   * Get public experiences
   */
  async getPublicExperiences(query: GetPublicExperiencesQuery): Promise<{
    experiences: Array<Experience & {
      student: { id: string; fullName: string; avatar?: string };
      organization: { id: string; name: string; logo?: string };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const { 
        page = 1, 
        limit = 12, 
        search, 
        type, 
        level, 
        skills, 
        organization, 
        location, 
        featured, 
        sortBy = 'recent' 
      } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.ExperienceWhereInput = {
        isPublic: true,
        status: 'APPROVED',
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(type && { type }),
        ...(level && { level }),
        ...(skills.length > 0 && {
          skills: {
            hasSome: skills,
          },
        }),
        ...(organization && {
          organization: {
            name: { contains: organization, mode: 'insensitive' },
          },
        }),
        ...(location && { location: { contains: location, mode: 'insensitive' } }),
        ...(featured && { isHighlighted: true }),
      };

      const orderBy = this.getPublicExperiencesSortOrder(sortBy);

      const [experiences, total] = await Promise.all([
        prisma.experience.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
                portfolioSlug: true,
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
                logo: true,
                slug: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.experience.count({ where }),
      ]);

      return {
        experiences,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get public experiences', { error, query });
      throw error;
    }
  }

  /**
   * Bulk experience operations
   */
  async bulkExperienceOperations(
    data: BulkExperienceOperationsInput,
    userId: string
  ): Promise<{
    successful: number;
    failed: Array<{ experienceId: string; error: string }>;
  }> {
    try {
      const results = {
        successful: 0,
        failed: [] as Array<{ experienceId: string; error: string }>,
      };

      for (const experienceId of data.experienceIds) {
        try {
          switch (data.operation) {
            case 'verify':
              await this.verifyExperience(experienceId, {
                status: 'APPROVED' as VerificationStatus,
                verificationNote: data.verificationNote,
              }, userId);
              break;
            case 'reject':
              await this.verifyExperience(experienceId, {
                status: 'REJECTED' as VerificationStatus,
                rejectionReason: data.rejectionReason,
              }, userId);
              break;
            case 'delete':
              await this.deleteExperience(experienceId, userId);
              break;
            case 'highlight':
              await this.updateExperience(experienceId, { isHighlighted: true }, userId);
              break;
            case 'unhighlight':
              await this.updateExperience(experienceId, { isHighlighted: false }, userId);
              break;
            case 'publish':
              await this.updateExperience(experienceId, { isPublic: true }, userId);
              break;
            case 'unpublish':
              await this.updateExperience(experienceId, { isPublic: false }, userId);
              break;
          }
          results.successful++;
        } catch (error) {
          results.failed.push({
            experienceId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      logger.info('Bulk experience operations completed', {
        operation: data.operation,
        total: data.experienceIds.length,
        successful: results.successful,
        failed: results.failed.length,
        userId,
      });

      return results;
    } catch (error) {
      logger.error('Failed to perform bulk experience operations', { error, data, userId });
      throw error;
    }
  }

  /**
   * Upload experience documents
   */
  async uploadExperienceDocuments(
    experienceId: string,
    documents: Array<{ url: string; type: string; title?: string }>,
    userId: string
  ): Promise<Document[]> {
    try {
      const experience = await prisma.experience.findUnique({
        where: { id: experienceId },
      });

      if (!experience) {
        throw new NotFoundError('Experience not found');
      }

      // Check permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { student: true, organization: true },
      });

      if (!user) {
        throw new AuthorizationError('User not found');
      }

      const canUpload = 
        (user.student && user.student.id === experience.studentId) ||
        (user.organization && user.organization.id === experience.organizationId) ||
        user.role === 'ADMIN';

      if (!canUpload) {
        throw new AuthorizationError('Permission denied');
      }

      const createdDocuments = await Promise.all(
        documents.map((doc) =>
          prisma.document.create({
            data: {
              title: doc.title || 'Document',
              url: doc.url,
              type: doc.type as any,
              experienceId,
              studentId: experience.studentId,
            },
          })
        )
      );

      logger.info('Experience documents uploaded', {
        experienceId,
        documentsCount: documents.length,
        userId,
      });

      return createdDocuments;
    } catch (error) {
      logger.error('Failed to upload experience documents', { error, experienceId, userId });
      throw error;
    }
  }

  /**
   * Get experience analytics
   */
  async getExperienceAnalytics(query: ExperienceAnalyticsQuery): Promise<any> {
    try {
      const { 
        period = '30d', 
        metrics, 
        groupBy, 
        startDate, 
        endDate, 
        organizationId, 
        studentId 
      } = query;

      // Calculate date range
      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      } else {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
        dateFilter = {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        };
      }

      const baseWhere = {
        createdAt: dateFilter,
        ...(organizationId && { organizationId }),
        ...(studentId && { studentId }),
      };

      const [
        totalExperiences,
        verifiedExperiences,
        pendingExperiences,
        rejectedExperiences,
      ] = await Promise.all([
        prisma.experience.count({ where: baseWhere }),
        prisma.experience.count({ where: { ...baseWhere, status: 'APPROVED' } }),
        prisma.experience.count({ where: { ...baseWhere, status: 'PENDING' } }),
        prisma.experience.count({ where: { ...baseWhere, status: 'REJECTED' } }),
      ]);

      // TODO: Implement more detailed analytics based on metrics and groupBy

      return {
        overview: {
          totalExperiences,
          verifiedExperiences,
          pendingExperiences,
          rejectedExperiences,
        },
        trends: [], // TODO: Implement trends
        breakdown: {}, // TODO: Implement breakdown by type, level, etc.
      };
    } catch (error) {
      logger.error('Failed to get experience analytics', { error, query });
      throw error;
    }
  }

  /**
   * Create experience template
   */
  async createExperienceTemplate(
    organizationId: string,
    data: CreateExperienceTemplateInput
  ): Promise<any> {
    try {
      // TODO: Implement experience templates in database schema
      // For now, return a placeholder response
      
      logger.info('Experience template created', {
        organizationId,
        templateName: data.name,
      });

      return {
        id: 'template-' + Date.now(),
        ...data,
        organizationId,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error('Failed to create experience template', { error, organizationId, data });
      throw error;
    }
  }

  /**
   * Submit experience feedback
   */
  async submitExperienceFeedback(
    experienceId: string,
    data: ExperienceFeedbackInput,
    userId: string
  ): Promise<any> {
    try {
      // TODO: Implement feedback system in database schema
      // For now, return a placeholder response
      
      logger.info('Experience feedback submitted', {
        experienceId,
        rating: data.rating,
        userId,
        anonymous: data.anonymous,
      });

      return {
        id: 'feedback-' + Date.now(),
        experienceId,
        ...data,
        userId: data.anonymous ? null : userId,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error('Failed to submit experience feedback', { error, experienceId, data, userId });
      throw error;
    }
  }

  /**
   * Helper method to get public experiences sort order
   */
  private getPublicExperiencesSortOrder(sortBy: string): Prisma.ExperienceOrderByWithRelationInput {
    switch (sortBy) {
      case 'popular':
        // TODO: Implement popularity sorting based on views/likes
        return { createdAt: 'desc' };
      case 'featured':
        return { isHighlighted: 'desc' };
      case 'title':
        return { title: 'asc' };
      case 'recent':
      default:
        return { createdAt: 'desc' };
    }
  }
}
