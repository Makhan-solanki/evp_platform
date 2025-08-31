import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { StudentService } from '../services/student.service';
import { logger } from '../config/logger';
import {
  UpdateStudentProfileInput,
  OrganizationJoinRequestInput,
  ExperienceResponseInput,
  AddSkillInput,
  UpdateSkillInput,
  AddSocialLinkInput,
  GetStudentOrganizationsQuery,
  GetStudentExperiencesQuery,
  StudentSearchQuery,
  UpdatePortfolioSettingsInput,
  AddAchievementInput,
  UpdateStudentPreferencesInput,
} from '../schemas/student';
import { asyncHandler } from '../middleware/error';

export class StudentController {
  private studentService: StudentService;

  constructor() {
    this.studentService = new StudentService();
  }

  /**
   * Get student profile
   */
  getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const student = await this.studentService.getStudentProfile(req.user.student.id);

    res.json({
      success: true,
      message: 'Student profile retrieved successfully',
      data: {
        student,
      },
    });
  });

  /**
   * Update student profile
   */
  updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const data: UpdateStudentProfileInput = req.body;
    const student = await this.studentService.updateStudentProfile(req.user.student.id, data);

    logger.info('Student profile updated', {
      studentId: req.user.student.id,
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: 'Student profile updated successfully',
      data: {
        student,
      },
    });
  });

  /**
   * Get student organizations
   */
  getOrganizations = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const query: GetStudentOrganizationsQuery = req.query as any;
    const result = await this.studentService.getStudentOrganizations(req.user.student.id, query);

    res.json({
      success: true,
      message: 'Organizations retrieved successfully',
      data: {
        organizations: result.organizations,
        pagination: result.pagination,
      },
    });
  });

  /**
   * Request to join organization
   */
  requestToJoinOrganization = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const data: OrganizationJoinRequestInput = req.body;
    const result = await this.studentService.requestToJoinOrganization(req.user.student.id, data);

    logger.info('Student requested to join organization', {
      studentId: req.user.student.id,
      organizationId: data.organizationId,
      requestId: result.requestId,
    });

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        requestId: result.requestId,
      },
    });
  });

  /**
   * Get student experiences
   */
  getExperiences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const query: GetStudentExperiencesQuery = req.query as any;
    const result = await this.studentService.getStudentExperiences(req.user.student.id, query);

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
   * Accept experience
   */
  acceptExperience = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const { id: experienceId } = req.params;
    const data: ExperienceResponseInput = { 
      response: 'accept', 
      message: req.body.message 
    };

    const experience = await this.studentService.respondToExperience(
      req.user.student.id, 
      experienceId, 
      data
    );

    logger.info('Student accepted experience', {
      studentId: req.user.student.id,
      experienceId,
    });

    res.json({
      success: true,
      message: 'Experience accepted successfully',
      data: {
        experience,
      },
    });
  });

  /**
   * Decline experience
   */
  declineExperience = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const { id: experienceId } = req.params;
    const data: ExperienceResponseInput = { 
      response: 'decline', 
      message: req.body.message,
      requestChanges: req.body.requestChanges,
      suggestedChanges: req.body.suggestedChanges,
    };

    const experience = await this.studentService.respondToExperience(
      req.user.student.id, 
      experienceId, 
      data
    );

    logger.info('Student declined experience', {
      studentId: req.user.student.id,
      experienceId,
    });

    res.json({
      success: true,
      message: 'Experience declined successfully',
      data: {
        experience,
      },
    });
  });

  /**
   * Get student portfolio
   */
  getPortfolio = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const portfolio = await this.studentService.getStudentPortfolio(req.user.student.id);

    res.json({
      success: true,
      message: 'Portfolio retrieved successfully',
      data: {
        portfolio,
      },
    });
  });

  /**
   * Update portfolio settings
   */
  updatePortfolio = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const data: UpdatePortfolioSettingsInput = req.body;
    const portfolio = await this.studentService.updatePortfolioSettings(req.user.student.id, data);

    logger.info('Student portfolio updated', {
      studentId: req.user.student.id,
      portfolioId: portfolio.id,
    });

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: {
        portfolio,
      },
    });
  });

  /**
   * Add skill
   */
  addSkill = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const data: AddSkillInput = req.body;
    const skill = await this.studentService.addSkill(req.user.student.id, data);

    logger.info('Skill added to student', {
      studentId: req.user.student.id,
      skillId: skill.id,
      skillName: skill.name,
    });

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: {
        skill,
      },
    });
  });

  /**
   * Update skill
   */
  updateSkill = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const { id: skillId } = req.params;
    const data: UpdateSkillInput = req.body;
    const skill = await this.studentService.updateSkill(req.user.student.id, skillId, data);

    logger.info('Student skill updated', {
      studentId: req.user.student.id,
      skillId,
    });

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: {
        skill,
      },
    });
  });

  /**
   * Remove skill
   */
  removeSkill = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const { id: skillId } = req.params;
    await this.studentService.removeSkill(req.user.student.id, skillId);

    logger.info('Student skill removed', {
      studentId: req.user.student.id,
      skillId,
    });

    res.json({
      success: true,
      message: 'Skill removed successfully',
    });
  });

  /**
   * Add social link
   */
  addSocialLink = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const data: AddSocialLinkInput = req.body;
    const socialLink = await this.studentService.addSocialLink(req.user.student.id, data);

    logger.info('Social link added to student', {
      studentId: req.user.student.id,
      socialLinkId: socialLink.id,
      platform: socialLink.platform,
    });

    res.status(201).json({
      success: true,
      message: 'Social link added successfully',
      data: {
        socialLink,
      },
    });
  });

  /**
   * Remove social link
   */
  removeSocialLink = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const { id: socialLinkId } = req.params;
    await this.studentService.removeSocialLink(req.user.student.id, socialLinkId);

    logger.info('Social link removed', {
      studentId: req.user.student.id,
      socialLinkId,
    });

    res.json({
      success: true,
      message: 'Social link removed successfully',
    });
  });

  /**
   * Search students (public)
   */
  searchStudents = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const query: StudentSearchQuery = req.query as any;
    const result = await this.studentService.searchStudents(query);

    res.json({
      success: true,
      message: 'Students retrieved successfully',
      data: {
        students: result.students.map(student => ({
          id: student.id,
          fullName: student.fullName,
          bio: student.bio,
          avatar: student.avatar,
          city: student.city,
          state: student.state,
          country: student.country,
          portfolioSlug: student.portfolioSlug,
          skills: student.skills,
          verifiedExperiencesCount: student._count.verifiedExperiences,
          isPublic: student.isPublic,
        })),
        pagination: result.pagination,
      },
    });
  });

  /**
   * Add achievement
   */
  addAchievement = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const data: AddAchievementInput = req.body;
    const achievement = await this.studentService.addAchievement(req.user.student.id, data);

    logger.info('Achievement added to student', {
      studentId: req.user.student.id,
      achievementId: achievement.id,
    });

    res.status(201).json({
      success: true,
      message: 'Achievement added successfully',
      data: {
        achievement,
      },
    });
  });

  /**
   * Update student preferences
   */
  updatePreferences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const data: UpdateStudentPreferencesInput = req.body;
    const student = await this.studentService.updateStudentPreferences(req.user.student.id, data);

    logger.info('Student preferences updated', {
      studentId: req.user.student.id,
    });

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: student.preferences,
      },
    });
  });

  /**
   * Get student statistics
   */
  getStatistics = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    const statistics = await this.studentService.getStudentStatistics(req.user.student.id);

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: statistics,
    });
  });

  /**
   * Get student dashboard data
   */
  getDashboard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.student) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'User does not have a student profile',
      });
      return;
    }

    // Get combined dashboard data
    const [statistics, recentExperiences, portfolio] = await Promise.all([
      this.studentService.getStudentStatistics(req.user.student.id),
      this.studentService.getStudentExperiences(req.user.student.id, { 
        page: 1, 
        limit: 5, 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      }),
      this.studentService.getStudentPortfolio(req.user.student.id),
    ]);

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        statistics,
        recentExperiences: recentExperiences.experiences,
        portfolio: portfolio ? {
          id: portfolio.id,
          isPublic: portfolio.isPublic,
          slug: portfolio.slug,
          views: 0, // TODO: Get from analytics
        } : null,
      },
    });
  });

  /**
   * Get student by ID (public)
   */
  getStudentById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id: studentId } = req.params;
    const student = await this.studentService.getStudentProfile(studentId);

    // Filter data for public view
    const publicData = {
      id: student.id,
      fullName: student.fullName,
      bio: student.bio,
      avatar: student.avatar,
      city: student.city,
      state: student.state,
      country: student.country,
      portfolioSlug: student.portfolioSlug,
      skills: student.skills,
      socialLinks: student.socialLinks,
      isPublic: student.isPublic,
      _count: student._count,
    };

    res.json({
      success: true,
      message: 'Student profile retrieved successfully',
      data: {
        student: publicData,
      },
    });
  });
}
