import { Prisma, Organization, Student, Experience, OrganizationStudent, StudentInvitation } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError,
  AuthorizationError 
} from '../middleware/error';
import {
  CreateOrganizationInput,
  UpdateOrganizationProfileInput,
  InviteStudentInput,
  BulkInviteStudentsInput,
  CsvBulkInviteInput,
  RemoveStudentInput,
  UpdateStudentRoleInput,
  GetOrganizationStudentsQuery,
  GetOrganizationExperiencesQuery,
  OrganizationAnalyticsQuery,
  VerificationQueueQuery,
  UpdateOrganizationSettingsInput,
} from '../schemas/organization';
import { randomUUID } from 'crypto';

export class OrganizationService {
  /**
   * Create organization
   */
  async createOrganization(userId: string, data: CreateOrganizationInput): Promise<Organization> {
    try {
      // Check if user already has an organization
      const existingOrg = await prisma.organization.findUnique({
        where: { userId },
      });

      if (existingOrg) {
        throw new ConflictError('User already has an organization');
      }

      // Generate unique slug
      const slug = await this.generateUniqueSlug(data.name);

      const organization = await prisma.organization.create({
        data: {
          name: data.name,
          description: data.description,
          website: data.website,
          address: data.address,
          phone: data.phone,
          establishedYear: data.establishedYear,
          industryType: data.industryType,
          organizationType: data.organizationType,
          socialLinks: data.socialLinks,
          slug,
          userId,
          verified: false,
          isActive: true,
        },
      });

      logger.info('Organization created', {
        organizationId: organization.id,
        userId,
        name: organization.name,
      });

      return organization;
    } catch (error) {
      logger.error('Failed to create organization', { error, userId, data });
      throw error;
    }
  }

  /**
   * Get organization profile
   */
  async getOrganizationProfile(organizationId: string): Promise<Organization & {
    students?: Array<OrganizationStudent & { student: Student }>;
    _count?: {
      students: number;
      experiences: number;
    };
  }> {
    try {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          students: {
            include: {
              student: {
                select: {
                  id: true,
                  fullName: true,
                  avatar: true,
                  isPublic: true,
                },
              },
            },
            where: { isActive: true },
            take: 10, // Limit to recent students
            orderBy: { joinedAt: 'desc' },
          },
          _count: {
            select: {
              students: { where: { isActive: true } },
              experiences: true,
            },
          },
        },
      });

      if (!organization) {
        throw new NotFoundError('Organization not found');
      }

      return organization;
    } catch (error) {
      logger.error('Failed to get organization profile', { error, organizationId });
      throw error;
    }
  }

  /**
   * Update organization profile
   */
  async updateOrganizationProfile(
    organizationId: string, 
    data: UpdateOrganizationProfileInput
  ): Promise<Organization> {
    try {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new NotFoundError('Organization not found');
      }

      const updatedOrganization = await prisma.organization.update({
        where: { id: organizationId },
        data: {
          name: data.name,
          description: data.description,
          logo: data.logo,
          website: data.website,
          address: data.address,
          phone: data.phone,
          establishedYear: data.establishedYear,
          industryType: data.industryType,
          organizationType: data.organizationType,
          socialLinks: data.socialLinks,
          settings: data.settings,
        },
      });

      logger.info('Organization profile updated', {
        organizationId,
        updatedFields: Object.keys(data),
      });

      return updatedOrganization;
    } catch (error) {
      logger.error('Failed to update organization profile', { error, organizationId });
      throw error;
    }
  }

  /**
   * Get organization students
   */
  async getOrganizationStudents(
    organizationId: string, 
    query: GetOrganizationStudentsQuery
  ): Promise<{
    students: Array<OrganizationStudent & { student: Student }>;
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
        department, 
        program, 
        role, 
        isActive, 
        sortBy = 'joinedAt', 
        sortOrder = 'desc' 
      } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.OrganizationStudentWhereInput = {
        organizationId,
        ...(isActive !== undefined && { isActive }),
        ...(department && { department }),
        ...(program && { program }),
        ...(role && { role }),
        ...(search && {
          student: {
            fullName: { contains: search, mode: 'insensitive' },
          },
        }),
      };

      const [students, total] = await Promise.all([
        prisma.organizationStudent.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                phone: true,
                isPublic: true,
                portfolioSlug: true,
                createdAt: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.organizationStudent.count({ where }),
      ]);

      return {
        students,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get organization students', { error, organizationId });
      throw error;
    }
  }

  /**
   * Invite student
   */
  async inviteStudent(organizationId: string, data: InviteStudentInput): Promise<StudentInvitation> {
    try {
      // Check if student is already invited or part of organization
      const existingInvitation = await prisma.studentInvitation.findFirst({
        where: {
          email: data.email,
          organizationId,
          acceptedAt: null,
        },
      });

      if (existingInvitation) {
        throw new ConflictError('Student already has a pending invitation');
      }

      // Check if student is already part of organization
      const existingStudent = await prisma.student.findFirst({
        where: {
          user: { email: data.email },
          organizations: {
            some: {
              organizationId,
              isActive: true,
            },
          },
        },
      });

      if (existingStudent) {
        throw new ConflictError('Student is already part of this organization');
      }

      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

      const invitation = await prisma.studentInvitation.create({
        data: {
          email: data.email,
          message: data.message,
          organizationId,
          token,
          expiresAt,
          metadata: {
            role: data.role,
            department: data.department,
            program: data.program,
            startDate: data.startDate,
            endDate: data.endDate,
          },
        },
      });

      // TODO: Send invitation email
      logger.info('Student invitation created', {
        invitationId: invitation.id,
        organizationId,
        email: data.email,
      });

      return invitation;
    } catch (error) {
      logger.error('Failed to invite student', { error, organizationId, email: data.email });
      throw error;
    }
  }

  /**
   * Bulk invite students
   */
  async bulkInviteStudents(
    organizationId: string, 
    data: BulkInviteStudentsInput
  ): Promise<{
    successful: number;
    failed: Array<{ email: string; error: string }>;
  }> {
    try {
      const results = {
        successful: 0,
        failed: [] as Array<{ email: string; error: string }>,
      };

      for (const invitation of data.invitations) {
        try {
          await this.inviteStudent(organizationId, {
            ...invitation,
            message: invitation.message || data.defaultMessage,
            role: invitation.role || data.defaultRole,
          });
          results.successful++;
        } catch (error) {
          results.failed.push({
            email: invitation.email,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      logger.info('Bulk student invitations processed', {
        organizationId,
        total: data.invitations.length,
        successful: results.successful,
        failed: results.failed.length,
      });

      return results;
    } catch (error) {
      logger.error('Failed to bulk invite students', { error, organizationId });
      throw error;
    }
  }

  /**
   * Remove student from organization
   */
  async removeStudent(
    organizationId: string, 
    studentId: string, 
    data: RemoveStudentInput
  ): Promise<void> {
    try {
      const organizationStudent = await prisma.organizationStudent.findFirst({
        where: {
          organizationId,
          studentId,
          isActive: true,
        },
      });

      if (!organizationStudent) {
        throw new NotFoundError('Student not found in organization');
      }

      // Mark as inactive instead of deleting to preserve history
      await prisma.organizationStudent.update({
        where: { id: organizationStudent.id },
        data: {
          isActive: false,
          leftAt: new Date(),
          notes: data.reason,
        },
      });

      // TODO: Send notification to student if requested
      if (data.notifyStudent) {
        // Send notification
      }

      logger.info('Student removed from organization', {
        organizationId,
        studentId,
        reason: data.reason,
      });
    } catch (error) {
      logger.error('Failed to remove student', { error, organizationId, studentId });
      throw error;
    }
  }

  /**
   * Update student role in organization
   */
  async updateStudentRole(
    organizationId: string, 
    studentId: string, 
    data: UpdateStudentRoleInput
  ): Promise<OrganizationStudent> {
    try {
      const organizationStudent = await prisma.organizationStudent.findFirst({
        where: {
          organizationId,
          studentId,
          isActive: true,
        },
      });

      if (!organizationStudent) {
        throw new NotFoundError('Student not found in organization');
      }

      const updatedRelation = await prisma.organizationStudent.update({
        where: { id: organizationStudent.id },
        data: {
          role: data.role,
          department: data.department,
          program: data.program,
          startDate: data.startDate,
          endDate: data.endDate,
          notes: data.notes,
        },
      });

      logger.info('Student role updated in organization', {
        organizationId,
        studentId,
        newRole: data.role,
      });

      return updatedRelation;
    } catch (error) {
      logger.error('Failed to update student role', { error, organizationId, studentId });
      throw error;
    }
  }

  /**
   * Get organization experiences
   */
  async getOrganizationExperiences(
    organizationId: string, 
    query: GetOrganizationExperiencesQuery
  ): Promise<{
    experiences: Array<Experience & { student: { id: string; fullName: string; avatar?: string } }>;
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
        studentId, 
        startDate, 
        endDate, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.ExperienceWhereInput = {
        organizationId,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(type && { type }),
        ...(level && { level }),
        ...(status && { status }),
        ...(studentId && { studentId }),
        ...(startDate && { startDate: { gte: new Date(startDate) } }),
        ...(endDate && { endDate: { lte: new Date(endDate) } }),
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
      logger.error('Failed to get organization experiences', { error, organizationId });
      throw error;
    }
  }

  /**
   * Get organization analytics
   */
  async getOrganizationAnalytics(
    organizationId: string, 
    query: OrganizationAnalyticsQuery
  ): Promise<{
    overview: {
      totalStudents: number;
      activeStudents: number;
      totalExperiences: number;
      verifiedExperiences: number;
      pendingVerifications: number;
    };
    trends: any[];
    metrics: any;
  }> {
    try {
      const { period = '30d', startDate, endDate } = query;

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

      const [
        totalStudents,
        activeStudents,
        totalExperiences,
        verifiedExperiences,
        pendingVerifications,
      ] = await Promise.all([
        prisma.organizationStudent.count({
          where: { organizationId },
        }),
        prisma.organizationStudent.count({
          where: { organizationId, isActive: true },
        }),
        prisma.experience.count({
          where: { organizationId },
        }),
        prisma.experience.count({
          where: { organizationId, status: 'APPROVED' },
        }),
        prisma.experience.count({
          where: { organizationId, status: 'PENDING' },
        }),
      ]);

      const overview = {
        totalStudents,
        activeStudents,
        totalExperiences,
        verifiedExperiences,
        pendingVerifications,
      };

      // TODO: Implement trends and detailed metrics
      const trends: any[] = [];
      const metrics = {};

      logger.info('Organization analytics retrieved', {
        organizationId,
        period,
      });

      return {
        overview,
        trends,
        metrics,
      };
    } catch (error) {
      logger.error('Failed to get organization analytics', { error, organizationId });
      throw error;
    }
  }

  /**
   * Get verification queue
   */
  async getVerificationQueue(
    organizationId: string, 
    query: VerificationQueueQuery
  ): Promise<{
    requests: any[];
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
        status, 
        type, 
        priority, 
        assignedTo, 
        studentId, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.VerificationRequestWhereInput = {
        organizationId,
        ...(status && { status }),
        ...(type && { type }),
        ...(priority && { priority }),
        ...(assignedTo && { assignedTo }),
        ...(studentId && { studentId }),
      };

      const [requests, total] = await Promise.all([
        prisma.verificationRequest.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.verificationRequest.count({ where }),
      ]);

      return {
        requests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get verification queue', { error, organizationId });
      throw error;
    }
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(
    organizationId: string, 
    settings: UpdateOrganizationSettingsInput
  ): Promise<Organization> {
    try {
      const organization = await prisma.organization.update({
        where: { id: organizationId },
        data: {
          settings: settings as any,
        },
      });

      logger.info('Organization settings updated', {
        organizationId,
        updatedSettings: Object.keys(settings),
      });

      return organization;
    } catch (error) {
      logger.error('Failed to update organization settings', { error, organizationId });
      throw error;
    }
  }

  /**
   * Generate unique organization slug
   */
  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Get organization by slug
   */
  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    try {
      return await prisma.organization.findUnique({
        where: { slug },
        include: {
          _count: {
            select: {
              students: { where: { isActive: true } },
              experiences: { where: { status: 'APPROVED' } },
            },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to get organization by slug', { error, slug });
      throw error;
    }
  }
}
