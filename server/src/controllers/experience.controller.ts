import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ExperienceService } from '../services/experience.service';
import { logger } from '../config/logger';
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
import { asyncHandler } from '../middleware/error';

export class ExperienceController {
  private experienceService: ExperienceService;

  constructor() {
    this.experienceService = new ExperienceService();
  }

  /**
   * Create experience
   */
  createExperience = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(403).json({
        success: false,
        message: 'Only organizations can create experiences',
        error: 'Access denied',
      });
      return;
    }

    const data: CreateExperienceInput = req.body;
    const experience = await this.experienceService.createExperience(req.user.organization.id, data);

    logger.info('Experience created successfully', {
      experienceId: experience.id,
      organizationId: req.user.organization.id,
      studentId: data.studentId,
      title: experience.title,
    });

    res.status(201).json({
      success: true,
      message: 'Experience created successfully',
      data: {
        experience,
      },
    });
  });

  /**
   * Get experience by ID
   */
  getExperience = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id: experienceId } = req.params;
    const experience = await this.experienceService.getExperienceById(experienceId, req.user?.id);

    res.json({
      success: true,
      message: 'Experience retrieved successfully',
      data: {
        experience,
      },
    });
  });

  /**
   * Update experience
   */
  updateExperience = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const { id: experienceId } = req.params;
    const data: UpdateExperienceInput = req.body;
    const experience = await this.experienceService.updateExperience(experienceId, data, req.user.id);

    logger.info('Experience updated successfully', {
      experienceId,
      userId: req.user.id,
      updatedFields: Object.keys(data),
    });

    res.json({
      success: true,
      message: 'Experience updated successfully',
      data: {
        experience,
      },
    });
  });

  /**
   * Delete experience
   */
  deleteExperience = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const { id: experienceId } = req.params;
    await this.experienceService.deleteExperience(experienceId, req.user.id);

    logger.info('Experience deleted successfully', {
      experienceId,
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: 'Experience deleted successfully',
    });
  });

  /**
   * Verify experience
   */
  verifyExperience = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const { id: experienceId } = req.params;
    const data: VerifyExperienceInput = req.body;
    const experience = await this.experienceService.verifyExperience(experienceId, data, req.user.id);

    logger.info('Experience verification updated', {
      experienceId,
      status: data.status,
      verifiedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Experience verification updated successfully',
      data: {
        experience,
      },
    });
  });

  /**
   * Reject experience
   */
  rejectExperience = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const { id: experienceId } = req.params;
    const data: VerifyExperienceInput = {
      status: 'REJECTED',
      rejectionReason: req.body.rejectionReason,
      requestedChanges: req.body.requestedChanges,
    };

    const experience = await this.experienceService.verifyExperience(experienceId, data, req.user.id);

    logger.info('Experience rejected', {
      experienceId,
      rejectedBy: req.user.id,
      reason: data.rejectionReason,
    });

    res.json({
      success: true,
      message: 'Experience rejected successfully',
      data: {
        experience,
      },
    });
  });

  /**
   * Get experiences with filters
   */
  getExperiences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const query: GetExperiencesQuery = req.query as any;
    const result = await this.experienceService.getExperiences(query);

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
   * Get public experiences
   */
  getPublicExperiences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const query: GetPublicExperiencesQuery = req.query as any;
    const result = await this.experienceService.getPublicExperiences(query);

    res.json({
      success: true,
      message: 'Public experiences retrieved successfully',
      data: {
        experiences: result.experiences,
        pagination: result.pagination,
      },
    });
  });

  /**
   * Bulk experience operations
   */
  bulkOperations = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const data: BulkExperienceOperationsInput = req.body;
    const result = await this.experienceService.bulkExperienceOperations(data, req.user.id);

    logger.info('Bulk experience operations completed', {
      operation: data.operation,
      total: data.experienceIds.length,
      successful: result.successful,
      failed: result.failed.length,
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: 'Bulk operations completed',
      data: {
        successful: result.successful,
        failed: result.failed,
        total: data.experienceIds.length,
      },
    });
  });

  /**
   * Upload experience documents
   */
  uploadDocuments = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const { id: experienceId } = req.params;
    const { documents } = req.body;

    const uploadedDocuments = await this.experienceService.uploadExperienceDocuments(
      experienceId,
      documents,
      req.user.id
    );

    logger.info('Experience documents uploaded', {
      experienceId,
      documentsCount: documents.length,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: {
        documents: uploadedDocuments,
      },
    });
  });

  /**
   * Get experience analytics
   */
  getAnalytics = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const query: ExperienceAnalyticsQuery = req.query as any;
    const analytics = await this.experienceService.getExperienceAnalytics(query);

    res.json({
      success: true,
      message: 'Experience analytics retrieved successfully',
      data: analytics,
    });
  });

  /**
   * Create experience template
   */
  createTemplate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.organization) {
      res.status(403).json({
        success: false,
        message: 'Only organizations can create experience templates',
        error: 'Access denied',
      });
      return;
    }

    const data: CreateExperienceTemplateInput = req.body;
    const template = await this.experienceService.createExperienceTemplate(req.user.organization.id, data);

    logger.info('Experience template created', {
      templateId: template.id,
      organizationId: req.user.organization.id,
      templateName: template.name,
    });

    res.status(201).json({
      success: true,
      message: 'Experience template created successfully',
      data: {
        template,
      },
    });
  });

  /**
   * Submit experience feedback
   */
  submitFeedback = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const { id: experienceId } = req.params;
    const data: ExperienceFeedbackInput = req.body;
    const feedback = await this.experienceService.submitExperienceFeedback(experienceId, data, req.user.id);

    logger.info('Experience feedback submitted', {
      experienceId,
      feedbackId: feedback.id,
      rating: data.rating,
      userId: req.user.id,
      anonymous: data.anonymous,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        feedback,
      },
    });
  });

  /**
   * Get trending experiences
   */
  getTrendingExperiences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const query: GetPublicExperiencesQuery = {
      ...req.query as any,
      sortBy: 'popular',
      limit: 10,
    };

    const result = await this.experienceService.getPublicExperiences(query);

    res.json({
      success: true,
      message: 'Trending experiences retrieved successfully',
      data: {
        experiences: result.experiences,
      },
    });
  });

  /**
   * Get featured experiences
   */
  getFeaturedExperiences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const query: GetPublicExperiencesQuery = {
      ...req.query as any,
      featured: true,
      sortBy: 'recent',
      limit: 6,
    };

    const result = await this.experienceService.getPublicExperiences(query);

    res.json({
      success: true,
      message: 'Featured experiences retrieved successfully',
      data: {
        experiences: result.experiences,
      },
    });
  });

  /**
   * Get experience statistics
   */
  getStatistics = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { organizationId, studentId } = req.query;
    
    const analytics = await this.experienceService.getExperienceAnalytics({
      period: '30d',
      organizationId: organizationId as string,
      studentId: studentId as string,
    });

    res.json({
      success: true,
      message: 'Experience statistics retrieved successfully',
      data: analytics.overview,
    });
  });

  /**
   * Search experiences by skills
   */
  searchBySkills = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { skills } = req.query;
    
    if (!skills || typeof skills !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Skills parameter is required',
        error: 'Invalid skills parameter',
      });
      return;
    }

    const skillsArray = skills.split(',').map(skill => skill.trim());
    
    const query: GetPublicExperiencesQuery = {
      skills: skillsArray,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 12,
      sortBy: 'recent',
    };

    const result = await this.experienceService.getPublicExperiences(query);

    res.json({
      success: true,
      message: 'Experiences found by skills',
      data: {
        experiences: result.experiences,
        pagination: result.pagination,
        searchedSkills: skillsArray,
      },
    });
  });
}
