import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { OrganizationService } from '../services/organization.service';
import { logger } from '../config/logger';
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
import { asyncHandler } from '../middleware/error';

export class OrganizationController {
  private organizationService: OrganizationService;

  constructor() {
    this.organizationService = new OrganizationService();
  }

  /**
   * Create organization
   */
  createOrganization = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const data: CreateOrganizationInput = req.body;
    const organization = await this.organizationService.createOrganization(req.user.id, data);

    logger.info('Organization created successfully', {
      organizationId: organization.id,
      userId: req.user.id,
      name: organization.name,
    });

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          description: organization.description,
          verified: organization.verified,
          createdAt: organization.createdAt,
        },
      },
    });
  });

  /**
   * Get organization profile
   */
  getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    const organization = await this.organizationService.getOrganizationProfile(req.user.organization.id);

    res.json({
      success: true,
      message: 'Organization profile retrieved successfully',
      data: {
        organization,
      },
    });
  });

  /**
   * Update organization profile
   */
  updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    const data: UpdateOrganizationProfileInput = req.body;
    const organization = await this.organizationService.updateOrganizationProfile(
      req.user.organization.id, 
      data
    );

    logger.info('Organization profile updated', {
      organizationId: organization.id,
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: 'Organization profile updated successfully',
      data: {
        organization,
      },
    });
  });

  /**
   * Get organization students
   */
  getStudents = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    const query: GetOrganizationStudentsQuery = req.query as any;
    const result = await this.organizationService.getOrganizationStudents(
      req.user.organization.id, 
      query
    );

    res.json({
      success: true,
      message: 'Students retrieved successfully',
      data: {
        students: result.students,
        pagination: result.pagination,
      },
    });
  });

  /**
   * Invite student
   */
  inviteStudent = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    const data: InviteStudentInput = req.body;
    const invitation = await this.organizationService.inviteStudent(req.user.organization.id, data);

    logger.info('Student invited successfully', {
      organizationId: req.user.organization.id,
      email: data.email,
      invitationId: invitation.id,
    });

    res.status(201).json({
      success: true,
      message: 'Student invitation sent successfully',
      data: {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          token: invitation.token,
          expiresAt: invitation.expiresAt,
        },
      },
    });
  });

  /**
   * Bulk invite students
   */
  bulkInviteStudents = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    const data: BulkInviteStudentsInput = req.body;
    const result = await this.organizationService.bulkInviteStudents(req.user.organization.id, data);

    logger.info('Bulk student invitations processed', {
      organizationId: req.user.organization.id,
      total: data.invitations.length,
      successful: result.successful,
      failed: result.failed.length,
    });

    res.json({
      success: true,
      message: 'Bulk invitations processed',
      data: {
        successful: result.successful,
        failed: result.failed,
        total: data.invitations.length,
      },
    });
  });

  /**
   * CSV bulk invite students
   */
  csvBulkInvite = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    // TODO: Implement CSV parsing and bulk invite
    res.json({
      success: true,
      message: 'CSV bulk invite feature coming soon',
    });
  });

  /**
   * Remove student from organization
   */
  removeStudent = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    const { id: studentId } = req.params;
    const data: RemoveStudentInput = req.body;

    await this.organizationService.removeStudent(req.user.organization.id, studentId, data);

    logger.info('Student removed from organization', {
      organizationId: req.user.organization.id,
      studentId,
      reason: data.reason,
    });

    res.json({
      success: true,
      message: 'Student removed from organization successfully',
    });
  });

  /**
   * Update student role in organization
   */
  updateStudentRole = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    const { id: studentId } = req.params;
    const data: UpdateStudentRoleInput = req.body;

    const updatedRelation = await this.organizationService.updateStudentRole(
      req.user.organization.id, 
      studentId, 
      data
    );

    logger.info('Student role updated in organization', {
      organizationId: req.user.organization.id,
      studentId,
      newRole: data.role,
    });

    res.json({
      success: true,
      message: 'Student role updated successfully',
      data: {
        relation: updatedRelation,
      },
    });
  });

  /**
   * Get organization experiences
   */
  getExperiences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    const query: GetOrganizationExperiencesQuery = req.query as any;
    const result = await this.organizationService.getOrganizationExperiences(
      req.user.organization.id, 
      query
    );

    res.json({
      success: true,
      message: 'Experiences retrieved successfully',
      data: {
        experiences: result.experiences,
        pagination: result.pagination,
      },
    });
  });

  /**
   * Get organization analytics
   */
  getAnalytics = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    const query: OrganizationAnalyticsQuery = req.query as any;
    const analytics = await this.organizationService.getOrganizationAnalytics(
      req.user.organization.id, 
      query
    );

    res.json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: analytics,
    });
  });

  /**
   * Get verification queue
   */
  getVerificationQueue = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    const query: VerificationQueueQuery = req.query as any;
    const result = await this.organizationService.getVerificationQueue(
      req.user.organization.id, 
      query
    );

    res.json({
      success: true,
      message: 'Verification queue retrieved successfully',
      data: {
        requests: result.requests,
        pagination: result.pagination,
      },
    });
  });

  /**
   * Update organization settings
   */
  updateSettings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    const settings: UpdateOrganizationSettingsInput = req.body;
    const organization = await this.organizationService.updateOrganizationSettings(
      req.user.organization.id, 
      settings
    );

    logger.info('Organization settings updated', {
      organizationId: organization.id,
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: 'Organization settings updated successfully',
      data: {
        organization,
      },
    });
  });

  /**
   * List all organizations (admin only)
   */
  listOrganizations = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // This would be an admin-only endpoint to list all organizations
    // Implementation would be similar to user search but for organizations
    
    res.json({
      success: true,
      message: 'Organizations list feature coming soon',
      data: {
        organizations: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      },
    });
  });

  /**
   * Get organization by slug (public)
   */
  getOrganizationBySlug = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { slug } = req.params;
    const organization = await this.organizationService.getOrganizationBySlug(slug);

    if (!organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'No organization found with this slug',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Organization retrieved successfully',
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          description: organization.description,
          logo: organization.logo,
          website: organization.website,
          verified: organization.verified,
          establishedYear: organization.establishedYear,
          industryType: organization.industryType,
          organizationType: organization.organizationType,
          _count: organization._count,
        },
      },
    });
  });

  /**
   * Get organization dashboard stats
   */
  getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(404).json({
        success: false,
        message: 'Organization not found',
        error: 'User does not have an organization',
      });
      return;
    }

    const analytics = await this.organizationService.getOrganizationAnalytics(
      req.user.organization.id, 
      { period: '30d' }
    );

    res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        stats: analytics.overview,
        trends: analytics.trends,
      },
    });
  });
}
