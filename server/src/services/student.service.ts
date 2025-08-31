import { Prisma, Student, Organization, Experience, Portfolio, StudentSkill, SocialLink, OrganizationStudent } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError,
  AuthorizationError 
} from '../middleware/error';
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

export class StudentService {
  /**
   * Get student profile with all related data
   */
  async getStudentProfile(studentId: string): Promise<Student & {
    skills: StudentSkill[];
    socialLinks: SocialLink[];
    portfolio?: Portfolio;
    organizations: Array<OrganizationStudent & { organization: Organization }>;
    _count: {
      experiences: number;
      verifiedExperiences: number;
    };
  }> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          skills: {
            orderBy: { level: 'desc' },
          },
          socialLinks: {
            orderBy: { createdAt: 'desc' },
          },
          portfolio: true,
          organizations: {
            where: { isActive: true },
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                  verified: true,
                  organizationType: true,
                },
              },
            },
            orderBy: { joinedAt: 'desc' },
          },
          _count: {
            select: {
              experiences: true,
              verifiedExperiences: {
                where: { status: 'APPROVED' },
              },
            },
          },
        },
      });

      if (!student) {
        throw new NotFoundError('Student not found');
      }

      return student as any;
    } catch (error) {
      logger.error('Failed to get student profile', { error, studentId });
      throw error;
    }
  }

  /**
   * Update student profile
   */
  async updateStudentProfile(studentId: string, data: UpdateStudentProfileInput): Promise<Student> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        throw new NotFoundError('Student not found');
      }

      // Check if portfolio slug is unique (if provided)
      if (data.portfolioSlug && data.portfolioSlug !== student.portfolioSlug) {
        const existingSlug = await prisma.student.findFirst({
          where: {
            portfolioSlug: data.portfolioSlug,
            id: { not: studentId },
          },
        });

        if (existingSlug) {
          throw new ConflictError('Portfolio slug is already taken');
        }
      }

      const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: {
          fullName: data.fullName,
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
          avatar: data.avatar,
          dateOfBirth: data.dateOfBirth,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          portfolioUrl: data.portfolioUrl,
          isPublic: data.isPublic,
          portfolioSlug: data.portfolioSlug,
          preferences: data.preferences,
          metadata: data.metadata,
        },
      });

      logger.info('Student profile updated', {
        studentId,
        updatedFields: Object.keys(data),
      });

      return updatedStudent;
    } catch (error) {
      logger.error('Failed to update student profile', { error, studentId });
      throw error;
    }
  }

  /**
   * Get student organizations
   */
  async getStudentOrganizations(
    studentId: string, 
    query: GetStudentOrganizationsQuery
  ): Promise<{
    organizations: Array<OrganizationStudent & { organization: Organization }>;
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
        isActive, 
        role, 
        sortBy = 'joinedAt', 
        sortOrder = 'desc' 
      } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.OrganizationStudentWhereInput = {
        studentId,
        ...(isActive !== undefined && { isActive }),
        ...(role && { role }),
      };

      const [organizations, total] = await Promise.all([
        prisma.organizationStudent.findMany({
          where,
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                description: true,
                logo: true,
                website: true,
                verified: true,
                organizationType: true,
                industryType: true,
                _count: {
                  select: {
                    students: { where: { isActive: true } },
                  },
                },
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
        organizations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get student organizations', { error, studentId });
      throw error;
    }
  }

  /**
   * Request to join organization
   */
  async requestToJoinOrganization(
    studentId: string, 
    data: OrganizationJoinRequestInput
  ): Promise<{ requestId: string; message: string }> {
    try {
      // Check if student is already part of the organization
      const existingMembership = await prisma.organizationStudent.findFirst({
        where: {
          studentId,
          organizationId: data.organizationId,
          isActive: true,
        },
      });

      if (existingMembership) {
        throw new ConflictError('Student is already a member of this organization');
      }

      // Check for pending request
      const pendingRequest = await prisma.studentInvitation.findFirst({
        where: {
          studentId,
          organizationId: data.organizationId,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (pendingRequest) {
        throw new ConflictError('A request is already pending for this organization');
      }

      // Create join request (using StudentInvitation table but in reverse)
      const request = await prisma.studentInvitation.create({
        data: {
          organizationId: data.organizationId,
          studentId,
          message: data.message,
          token: `student-request-${Date.now()}`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          metadata: {
            type: 'student_request',
            program: data.program,
            expectedStartDate: data.expectedStartDate,
            expectedEndDate: data.expectedEndDate,
          },
        },
      });

      // TODO: Send notification to organization

      logger.info('Student requested to join organization', {
        studentId,
        organizationId: data.organizationId,
        requestId: request.id,
      });

      return {
        requestId: request.id,
        message: 'Join request sent successfully',
      };
    } catch (error) {
      logger.error('Failed to create organization join request', { error, studentId });
      throw error;
    }
  }

  /**
   * Get student experiences
   */
  async getStudentExperiences(
    studentId: string, 
    query: GetStudentExperiencesQuery
  ): Promise<{
    experiences: Array<Experience & { organization: { id: string; name: string; logo?: string } }>;
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
        isHighlighted, 
        startDate, 
        endDate, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.ExperienceWhereInput = {
        studentId,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(type && { type }),
        ...(level && { level }),
        ...(status && { status }),
        ...(organizationId && { organizationId }),
        ...(isHighlighted !== undefined && { isHighlighted }),
        ...(startDate && { startDate: { gte: new Date(startDate) } }),
        ...(endDate && { endDate: { lte: new Date(endDate) } }),
      };

      const [experiences, total] = await Promise.all([
        prisma.experience.findMany({
          where,
          include: {
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
      logger.error('Failed to get student experiences', { error, studentId });
      throw error;
    }
  }

  /**
   * Respond to experience (accept/decline)
   */
  async respondToExperience(
    studentId: string, 
    experienceId: string, 
    data: ExperienceResponseInput
  ): Promise<Experience> {
    try {
      const experience = await prisma.experience.findFirst({
        where: {
          id: experienceId,
          studentId,
          status: 'PENDING',
        },
      });

      if (!experience) {
        throw new NotFoundError('Experience not found or already processed');
      }

      const updatedExperience = await prisma.experience.update({
        where: { id: experienceId },
        data: {
          status: data.response === 'accept' ? 'APPROVED' : 'REJECTED',
          metadata: {
            ...experience.metadata as any,
            studentResponse: {
              response: data.response,
              message: data.message,
              requestChanges: data.requestChanges,
              suggestedChanges: data.suggestedChanges,
              respondedAt: new Date(),
            },
          },
        },
      });

      // TODO: Send notification to organization

      logger.info('Student responded to experience', {
        studentId,
        experienceId,
        response: data.response,
      });

      return updatedExperience;
    } catch (error) {
      logger.error('Failed to respond to experience', { error, studentId, experienceId });
      throw error;
    }
  }

  /**
   * Get student portfolio
   */
  async getStudentPortfolio(studentId: string): Promise<Portfolio | null> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { studentId },
        include: {
          portfolioSections: {
            orderBy: { order: 'asc' },
          },
          experiences: {
            include: {
              experience: {
                include: {
                  organization: {
                    select: {
                      id: true,
                      name: true,
                      logo: true,
                    },
                  },
                },
              },
            },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return portfolio;
    } catch (error) {
      logger.error('Failed to get student portfolio', { error, studentId });
      throw error;
    }
  }

  /**
   * Update portfolio settings
   */
  async updatePortfolioSettings(
    studentId: string, 
    data: UpdatePortfolioSettingsInput
  ): Promise<Portfolio> {
    try {
      // Get or create portfolio
      let portfolio = await prisma.portfolio.findUnique({
        where: { studentId },
      });

      if (!portfolio) {
        portfolio = await prisma.portfolio.create({
          data: {
            studentId,
            title: 'My Portfolio',
            isPublic: true,
          },
        });
      }

      const updatedPortfolio = await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          isPublic: data.isPublic,
          theme: data.theme,
          customDomain: data.customDomain,
          seoSettings: data.seoSettings,
          analyticsSettings: data.analytics,
        },
      });

      logger.info('Portfolio settings updated', {
        studentId,
        portfolioId: portfolio.id,
      });

      return updatedPortfolio;
    } catch (error) {
      logger.error('Failed to update portfolio settings', { error, studentId });
      throw error;
    }
  }

  /**
   * Add skill
   */
  async addSkill(studentId: string, data: AddSkillInput): Promise<StudentSkill> {
    try {
      // Check if skill already exists
      const existingSkill = await prisma.studentSkill.findFirst({
        where: {
          studentId,
          name: { equals: data.name, mode: 'insensitive' },
        },
      });

      if (existingSkill) {
        throw new ConflictError('Skill already exists');
      }

      const skill = await prisma.studentSkill.create({
        data: {
          studentId,
          name: data.name,
          level: data.level,
          category: data.category,
          yearsOfExperience: data.yearsOfExperience,
          isVerified: data.isVerified,
          verifiedBy: data.verifiedBy,
        },
      });

      logger.info('Skill added to student', {
        studentId,
        skillId: skill.id,
        skillName: skill.name,
      });

      return skill;
    } catch (error) {
      logger.error('Failed to add skill', { error, studentId });
      throw error;
    }
  }

  /**
   * Update skill
   */
  async updateSkill(
    studentId: string, 
    skillId: string, 
    data: UpdateSkillInput
  ): Promise<StudentSkill> {
    try {
      const skill = await prisma.studentSkill.findFirst({
        where: {
          id: skillId,
          studentId,
        },
      });

      if (!skill) {
        throw new NotFoundError('Skill not found');
      }

      const updatedSkill = await prisma.studentSkill.update({
        where: { id: skillId },
        data: {
          name: data.name,
          level: data.level,
          category: data.category,
          yearsOfExperience: data.yearsOfExperience,
        },
      });

      logger.info('Student skill updated', {
        studentId,
        skillId,
        skillName: updatedSkill.name,
      });

      return updatedSkill;
    } catch (error) {
      logger.error('Failed to update skill', { error, studentId, skillId });
      throw error;
    }
  }

  /**
   * Remove skill
   */
  async removeSkill(studentId: string, skillId: string): Promise<void> {
    try {
      const skill = await prisma.studentSkill.findFirst({
        where: {
          id: skillId,
          studentId,
        },
      });

      if (!skill) {
        throw new NotFoundError('Skill not found');
      }

      await prisma.studentSkill.delete({
        where: { id: skillId },
      });

      logger.info('Student skill removed', {
        studentId,
        skillId,
        skillName: skill.name,
      });
    } catch (error) {
      logger.error('Failed to remove skill', { error, studentId, skillId });
      throw error;
    }
  }

  /**
   * Add social link
   */
  async addSocialLink(studentId: string, data: AddSocialLinkInput): Promise<SocialLink> {
    try {
      // Check if platform already exists
      const existingLink = await prisma.socialLink.findFirst({
        where: {
          studentId,
          platform: data.platform,
        },
      });

      if (existingLink) {
        throw new ConflictError('Social link for this platform already exists');
      }

      const socialLink = await prisma.socialLink.create({
        data: {
          studentId,
          platform: data.platform,
          url: data.url,
          username: data.username,
          isVerified: data.isVerified,
        },
      });

      logger.info('Social link added to student', {
        studentId,
        socialLinkId: socialLink.id,
        platform: socialLink.platform,
      });

      return socialLink;
    } catch (error) {
      logger.error('Failed to add social link', { error, studentId });
      throw error;
    }
  }

  /**
   * Remove social link
   */
  async removeSocialLink(studentId: string, socialLinkId: string): Promise<void> {
    try {
      const socialLink = await prisma.socialLink.findFirst({
        where: {
          id: socialLinkId,
          studentId,
        },
      });

      if (!socialLink) {
        throw new NotFoundError('Social link not found');
      }

      await prisma.socialLink.delete({
        where: { id: socialLinkId },
      });

      logger.info('Social link removed', {
        studentId,
        socialLinkId,
        platform: socialLink.platform,
      });
    } catch (error) {
      logger.error('Failed to remove social link', { error, studentId, socialLinkId });
      throw error;
    }
  }

  /**
   * Search students (public)
   */
  async searchStudents(query: StudentSearchQuery): Promise<{
    students: Array<Student & { 
      skills: StudentSkill[];
      _count: { verifiedExperiences: number };
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
        q, 
        skills, 
        location, 
        organizationId, 
        experienceType, 
        isPublic, 
        verified, 
        page = 1, 
        limit = 12, 
        sortBy = 'updated', 
        sortOrder = 'desc' 
      } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.StudentWhereInput = {
        isPublic: isPublic !== false ? true : undefined,
        ...(q && {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
          ],
        }),
        ...(skills.length > 0 && {
          skills: {
            some: {
              name: { in: skills, mode: 'insensitive' },
            },
          },
        }),
        ...(location && {
          OR: [
            { city: { contains: location, mode: 'insensitive' } },
            { state: { contains: location, mode: 'insensitive' } },
            { country: { contains: location, mode: 'insensitive' } },
          ],
        }),
        ...(organizationId && {
          organizations: {
            some: {
              organizationId,
              isActive: true,
            },
          },
        }),
        ...(experienceType && {
          experiences: {
            some: {
              type: experienceType as any,
              status: 'APPROVED',
            },
          },
        }),
        ...(verified !== undefined && {
          user: { verified },
        }),
      };

      const orderBy = this.getStudentSortOrder(sortBy, sortOrder);

      const [students, total] = await Promise.all([
        prisma.student.findMany({
          where,
          include: {
            skills: {
              orderBy: { level: 'desc' },
              take: 5, // Top 5 skills
            },
            _count: {
              select: {
                verifiedExperiences: {
                  where: { status: 'APPROVED' },
                },
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.student.count({ where }),
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
      logger.error('Failed to search students', { error, query });
      throw error;
    }
  }

  /**
   * Add achievement
   */
  async addAchievement(studentId: string, data: AddAchievementInput): Promise<any> {
    try {
      // Create achievement badge
      const achievement = await prisma.achievementBadge.create({
        data: {
          studentId,
          title: data.title,
          description: data.description,
          issuer: data.issuer,
          dateEarned: data.dateEarned,
          expiryDate: data.expiryDate,
          credentialId: data.credentialId,
          credentialUrl: data.credentialUrl,
          category: data.category,
          tags: data.tags,
        },
      });

      logger.info('Achievement added to student', {
        studentId,
        achievementId: achievement.id,
        title: achievement.title,
      });

      return achievement;
    } catch (error) {
      logger.error('Failed to add achievement', { error, studentId });
      throw error;
    }
  }

  /**
   * Update student preferences
   */
  async updateStudentPreferences(
    studentId: string, 
    data: UpdateStudentPreferencesInput
  ): Promise<Student> {
    try {
      const student = await prisma.student.update({
        where: { id: studentId },
        data: {
          preferences: {
            ...data,
          },
        },
      });

      logger.info('Student preferences updated', { studentId });

      return student;
    } catch (error) {
      logger.error('Failed to update student preferences', { error, studentId });
      throw error;
    }
  }

  /**
   * Get student statistics
   */
  async getStudentStatistics(studentId: string): Promise<{
    totalExperiences: number;
    verifiedExperiences: number;
    pendingExperiences: number;
    skillsCount: number;
    organizationsCount: number;
    portfolioViews: number;
    achievementsCount: number;
  }> {
    try {
      const [
        totalExperiences,
        verifiedExperiences,
        pendingExperiences,
        skillsCount,
        organizationsCount,
        achievementsCount,
        portfolioViews,
      ] = await Promise.all([
        prisma.experience.count({
          where: { studentId },
        }),
        prisma.experience.count({
          where: { studentId, status: 'APPROVED' },
        }),
        prisma.experience.count({
          where: { studentId, status: 'PENDING' },
        }),
        prisma.studentSkill.count({
          where: { studentId },
        }),
        prisma.organizationStudent.count({
          where: { studentId, isActive: true },
        }),
        prisma.achievementBadge.count({
          where: { studentId },
        }),
        prisma.portfolioAnalytics.aggregate({
          where: {
            portfolio: { studentId },
          },
          _sum: { views: true },
        }),
      ]);

      return {
        totalExperiences,
        verifiedExperiences,
        pendingExperiences,
        skillsCount,
        organizationsCount,
        portfolioViews: portfolioViews._sum.views || 0,
        achievementsCount,
      };
    } catch (error) {
      logger.error('Failed to get student statistics', { error, studentId });
      throw error;
    }
  }

  /**
   * Helper method to get student sort order
   */
  private getStudentSortOrder(sortBy: string, sortOrder: string): Prisma.StudentOrderByWithRelationInput {
    const order = sortOrder as 'asc' | 'desc';
    
    switch (sortBy) {
      case 'name':
        return { fullName: order };
      case 'experience':
        return { experiences: { _count: order } };
      case 'skills':
        return { skills: { _count: order } };
      case 'location':
        return { city: order };
      case 'updated':
      default:
        return { updatedAt: order };
    }
  }
}
