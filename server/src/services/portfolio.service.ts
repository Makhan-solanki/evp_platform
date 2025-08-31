import { Prisma, Portfolio, Student, PortfolioSection, PortfolioExperience, PortfolioAnalytics } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError,
  AuthorizationError 
} from '../middleware/error';
import {
  UpdatePortfolioInput,
  AddPortfolioSectionInput,
  UpdatePortfolioSectionInput,
  ReorderPortfolioSectionsInput,
  AddPortfolioExperienceInput,
  UpdatePortfolioExperienceInput,
  BulkUpdatePortfolioExperiencesInput,
  PortfolioThemeInput,
  GetPublicPortfolioQuery,
  PortfolioSearchQuery,
  PortfolioAnalyticsQuery,
  GeneratePortfolioPDFInput,
  SharePortfolioInput,
  PortfolioTemplateInput,
  PortfolioBackupInput,
  PortfolioRestoreInput,
} from '../schemas/portfolio';

export class PortfolioService {
  /**
   * Get portfolio by student ID
   */
  async getPortfolioByStudentId(studentId: string): Promise<Portfolio & {
    portfolioSections: PortfolioSection[];
    experiences: Array<PortfolioExperience & {
      experience: {
        id: string;
        title: string;
        description: string;
        type: string;
        level: string;
        skills: string[];
        startDate: Date;
        endDate?: Date;
        organization: {
          id: string;
          name: string;
          logo?: string;
        };
      };
    }>;
  }> {
    try {
      // Get or create portfolio
      let portfolio = await prisma.portfolio.findUnique({
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
            where: { isVisible: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      if (!portfolio) {
        // Create default portfolio
        portfolio = await this.createDefaultPortfolio(studentId);
      }

      return portfolio as any;
    } catch (error) {
      logger.error('Failed to get portfolio', { error, studentId });
      throw error;
    }
  }

  /**
   * Get public portfolio by slug
   */
  async getPublicPortfolio(slug: string, trackView: boolean = true, viewerInfo?: any): Promise<{
    portfolio: Portfolio & {
      student: {
        id: string;
        fullName: string;
        firstName?: string;
        lastName?: string;
        bio?: string;
        avatar?: string;
        city?: string;
        state?: string;
        country?: string;
        linkedinUrl?: string;
        githubUrl?: string;
        portfolioUrl?: string;
      };
      portfolioSections: PortfolioSection[];
      experiences: Array<PortfolioExperience & {
        experience: any;
      }>;
    };
  }> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { slug },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              firstName: true,
              lastName: true,
              bio: true,
              avatar: true,
              city: true,
              state: true,
              country: true,
              linkedinUrl: true,
              githubUrl: true,
              portfolioUrl: true,
            },
          },
          portfolioSections: {
            where: { isVisible: true },
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
            where: { isVisible: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      if (!portfolio || !portfolio.isPublic) {
        throw new NotFoundError('Portfolio not found or not public');
      }

      // Track portfolio view
      if (trackView) {
        await this.trackPortfolioView(portfolio.id, viewerInfo);
      }

      return { portfolio };
    } catch (error) {
      logger.error('Failed to get public portfolio', { error, slug });
      throw error;
    }
  }

  /**
   * Update portfolio
   */
  async updatePortfolio(studentId: string, data: UpdatePortfolioInput): Promise<Portfolio> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { studentId },
      });

      if (!portfolio) {
        throw new NotFoundError('Portfolio not found');
      }

      // Check if custom domain is available (if provided)
      if (data.customDomain && data.customDomain !== portfolio.customDomain) {
        const existingDomain = await prisma.portfolio.findFirst({
          where: {
            customDomain: data.customDomain,
            id: { not: portfolio.id },
          },
        });

        if (existingDomain) {
          throw new ConflictError('Custom domain is already taken');
        }
      }

      const updatedPortfolio = await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          bio: data.bio,
          headline: data.headline,
          summary: data.summary,
          isPublic: data.isPublic,
          theme: data.theme,
          customDomain: data.customDomain,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          seoKeywords: data.seoKeywords,
          socialLinks: data.socialLinks,
          settings: data.settings,
          metadata: data.metadata,
        },
      });

      logger.info('Portfolio updated', {
        portfolioId: portfolio.id,
        studentId,
        updatedFields: Object.keys(data),
      });

      return updatedPortfolio;
    } catch (error) {
      logger.error('Failed to update portfolio', { error, studentId });
      throw error;
    }
  }

  /**
   * Add portfolio section
   */
  async addPortfolioSection(studentId: string, data: AddPortfolioSectionInput): Promise<PortfolioSection> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { studentId },
      });

      if (!portfolio) {
        throw new NotFoundError('Portfolio not found');
      }

      const section = await prisma.portfolioSection.create({
        data: {
          portfolioId: portfolio.id,
          type: data.type,
          title: data.title,
          content: data.content,
          isVisible: data.isVisible,
          order: data.order,
          settings: data.settings,
        },
      });

      logger.info('Portfolio section added', {
        sectionId: section.id,
        portfolioId: portfolio.id,
        type: section.type,
      });

      return section;
    } catch (error) {
      logger.error('Failed to add portfolio section', { error, studentId });
      throw error;
    }
  }

  /**
   * Update portfolio section
   */
  async updatePortfolioSection(
    studentId: string,
    sectionId: string,
    data: UpdatePortfolioSectionInput
  ): Promise<PortfolioSection> {
    try {
      const section = await prisma.portfolioSection.findFirst({
        where: {
          id: sectionId,
          portfolio: { studentId },
        },
      });

      if (!section) {
        throw new NotFoundError('Portfolio section not found');
      }

      const updatedSection = await prisma.portfolioSection.update({
        where: { id: sectionId },
        data: {
          type: data.type,
          title: data.title,
          content: data.content,
          isVisible: data.isVisible,
          order: data.order,
          settings: data.settings,
        },
      });

      logger.info('Portfolio section updated', {
        sectionId,
        portfolioId: section.portfolioId,
        studentId,
      });

      return updatedSection;
    } catch (error) {
      logger.error('Failed to update portfolio section', { error, studentId, sectionId });
      throw error;
    }
  }

  /**
   * Delete portfolio section
   */
  async deletePortfolioSection(studentId: string, sectionId: string): Promise<void> {
    try {
      const section = await prisma.portfolioSection.findFirst({
        where: {
          id: sectionId,
          portfolio: { studentId },
        },
      });

      if (!section) {
        throw new NotFoundError('Portfolio section not found');
      }

      await prisma.portfolioSection.delete({
        where: { id: sectionId },
      });

      logger.info('Portfolio section deleted', {
        sectionId,
        portfolioId: section.portfolioId,
        studentId,
      });
    } catch (error) {
      logger.error('Failed to delete portfolio section', { error, studentId, sectionId });
      throw error;
    }
  }

  /**
   * Reorder portfolio sections
   */
  async reorderPortfolioSections(
    studentId: string,
    data: ReorderPortfolioSectionsInput
  ): Promise<PortfolioSection[]> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { studentId },
        include: { portfolioSections: true },
      });

      if (!portfolio) {
        throw new NotFoundError('Portfolio not found');
      }

      // Update section orders in transaction
      const updatedSections = await prisma.$transaction(
        data.sections.map((section) =>
          prisma.portfolioSection.update({
            where: { id: section.id },
            data: { order: section.order },
          })
        )
      );

      logger.info('Portfolio sections reordered', {
        portfolioId: portfolio.id,
        studentId,
        sectionsCount: data.sections.length,
      });

      return updatedSections;
    } catch (error) {
      logger.error('Failed to reorder portfolio sections', { error, studentId });
      throw error;
    }
  }

  /**
   * Add experience to portfolio
   */
  async addPortfolioExperience(
    studentId: string,
    data: AddPortfolioExperienceInput
  ): Promise<PortfolioExperience> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { studentId },
      });

      if (!portfolio) {
        throw new NotFoundError('Portfolio not found');
      }

      // Verify experience belongs to student
      const experience = await prisma.experience.findFirst({
        where: {
          id: data.experienceId,
          studentId,
        },
      });

      if (!experience) {
        throw new NotFoundError('Experience not found or not owned by student');
      }

      // Check if experience is already in portfolio
      const existingPortfolioExperience = await prisma.portfolioExperience.findFirst({
        where: {
          portfolioId: portfolio.id,
          experienceId: data.experienceId,
        },
      });

      if (existingPortfolioExperience) {
        throw new ConflictError('Experience is already in portfolio');
      }

      const portfolioExperience = await prisma.portfolioExperience.create({
        data: {
          portfolioId: portfolio.id,
          experienceId: data.experienceId,
          isHighlighted: data.isHighlighted,
          customTitle: data.customTitle,
          customDescription: data.customDescription,
          displayOrder: data.displayOrder,
          isVisible: data.isVisible,
          settings: data.settings,
        },
      });

      logger.info('Experience added to portfolio', {
        portfolioExperienceId: portfolioExperience.id,
        portfolioId: portfolio.id,
        experienceId: data.experienceId,
        studentId,
      });

      return portfolioExperience;
    } catch (error) {
      logger.error('Failed to add experience to portfolio', { error, studentId });
      throw error;
    }
  }

  /**
   * Update portfolio experience
   */
  async updatePortfolioExperience(
    studentId: string,
    portfolioExperienceId: string,
    data: UpdatePortfolioExperienceInput
  ): Promise<PortfolioExperience> {
    try {
      const portfolioExperience = await prisma.portfolioExperience.findFirst({
        where: {
          id: portfolioExperienceId,
          portfolio: { studentId },
        },
      });

      if (!portfolioExperience) {
        throw new NotFoundError('Portfolio experience not found');
      }

      const updatedPortfolioExperience = await prisma.portfolioExperience.update({
        where: { id: portfolioExperienceId },
        data: {
          isHighlighted: data.isHighlighted,
          customTitle: data.customTitle,
          customDescription: data.customDescription,
          displayOrder: data.displayOrder,
          isVisible: data.isVisible,
          settings: data.settings,
        },
      });

      logger.info('Portfolio experience updated', {
        portfolioExperienceId,
        studentId,
      });

      return updatedPortfolioExperience;
    } catch (error) {
      logger.error('Failed to update portfolio experience', { error, studentId, portfolioExperienceId });
      throw error;
    }
  }

  /**
   * Remove experience from portfolio
   */
  async removePortfolioExperience(studentId: string, portfolioExperienceId: string): Promise<void> {
    try {
      const portfolioExperience = await prisma.portfolioExperience.findFirst({
        where: {
          id: portfolioExperienceId,
          portfolio: { studentId },
        },
      });

      if (!portfolioExperience) {
        throw new NotFoundError('Portfolio experience not found');
      }

      await prisma.portfolioExperience.delete({
        where: { id: portfolioExperienceId },
      });

      logger.info('Experience removed from portfolio', {
        portfolioExperienceId,
        studentId,
      });
    } catch (error) {
      logger.error('Failed to remove experience from portfolio', { error, studentId, portfolioExperienceId });
      throw error;
    }
  }

  /**
   * Bulk update portfolio experiences
   */
  async bulkUpdatePortfolioExperiences(
    studentId: string,
    data: BulkUpdatePortfolioExperiencesInput
  ): Promise<PortfolioExperience[]> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { studentId },
      });

      if (!portfolio) {
        throw new NotFoundError('Portfolio not found');
      }

      const updatedExperiences = await prisma.$transaction(
        data.experiences.map((exp) =>
          prisma.portfolioExperience.update({
            where: { id: exp.id },
            data: {
              isHighlighted: exp.isHighlighted,
              isVisible: exp.isVisible,
              displayOrder: exp.displayOrder,
            },
          })
        )
      );

      logger.info('Portfolio experiences bulk updated', {
        portfolioId: portfolio.id,
        studentId,
        experiencesCount: data.experiences.length,
      });

      return updatedExperiences;
    } catch (error) {
      logger.error('Failed to bulk update portfolio experiences', { error, studentId });
      throw error;
    }
  }

  /**
   * Search public portfolios
   */
  async searchPortfolios(query: PortfolioSearchQuery): Promise<{
    portfolios: Array<{
      id: string;
      slug: string;
      title: string;
      bio?: string;
      theme?: string;
      student: {
        id: string;
        fullName: string;
        avatar?: string;
        city?: string;
        state?: string;
        country?: string;
      };
      _count: {
        experiences: number;
      };
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
        experienceTypes, 
        levels, 
        location, 
        organizations, 
        verified, 
        hasExperiences, 
        theme, 
        page = 1, 
        limit = 12, 
        sortBy = 'updated', 
        sortOrder = 'desc' 
      } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.PortfolioWhereInput = {
        isPublic: true,
        ...(q && {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
            { student: { fullName: { contains: q, mode: 'insensitive' } } },
          ],
        }),
        ...(skills.length > 0 && {
          student: {
            skills: {
              some: {
                name: { in: skills, mode: 'insensitive' },
              },
            },
          },
        }),
        ...(experienceTypes.length > 0 && {
          experiences: {
            some: {
              experience: {
                type: { in: experienceTypes },
              },
            },
          },
        }),
        ...(levels.length > 0 && {
          experiences: {
            some: {
              experience: {
                level: { in: levels },
              },
            },
          },
        }),
        ...(location && {
          student: {
            OR: [
              { city: { contains: location, mode: 'insensitive' } },
              { state: { contains: location, mode: 'insensitive' } },
              { country: { contains: location, mode: 'insensitive' } },
            ],
          },
        }),
        ...(organizations.length > 0 && {
          student: {
            organizations: {
              some: {
                organization: {
                  name: { in: organizations, mode: 'insensitive' },
                },
              },
            },
          },
        }),
        ...(verified !== undefined && {
          student: {
            user: { verified },
          },
        }),
        ...(hasExperiences !== undefined && {
          experiences: hasExperiences ? { some: {} } : { none: {} },
        }),
        ...(theme && { theme }),
      };

      const orderBy = this.getPortfolioSortOrder(sortBy, sortOrder);

      const [portfolios, total] = await Promise.all([
        prisma.portfolio.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
                city: true,
                state: true,
                country: true,
              },
            },
            _count: {
              select: {
                experiences: { where: { isVisible: true } },
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.portfolio.count({ where }),
      ]);

      return {
        portfolios: portfolios.map(portfolio => ({
          id: portfolio.id,
          slug: portfolio.slug,
          title: portfolio.title,
          bio: portfolio.bio,
          theme: portfolio.theme,
          student: portfolio.student,
          _count: portfolio._count,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to search portfolios', { error, query });
      throw error;
    }
  }

  /**
   * Get portfolio analytics
   */
  async getPortfolioAnalytics(
    portfolioId: string,
    query: PortfolioAnalyticsQuery
  ): Promise<any> {
    try {
      const { 
        period = '30d', 
        metrics, 
        groupBy, 
        startDate, 
        endDate, 
        includeGeography, 
        includeReferrers, 
        includeDeviceInfo 
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

      const [totalViews, uniqueVisitors] = await Promise.all([
        prisma.portfolioAnalytics.count({
          where: {
            portfolioId,
            viewedAt: dateFilter,
          },
        }),
        prisma.portfolioAnalytics.groupBy({
          by: ['ipAddress'],
          where: {
            portfolioId,
            viewedAt: dateFilter,
          },
          _count: true,
        }),
      ]);

      // TODO: Implement more detailed analytics based on metrics and groupBy

      return {
        overview: {
          totalViews,
          uniqueVisitors: uniqueVisitors.length,
          // TODO: Calculate bounce rate, time on page, etc.
        },
        trends: [], // TODO: Implement trends
        geography: includeGeography ? [] : undefined,
        referrers: includeReferrers ? [] : undefined,
        devices: includeDeviceInfo ? [] : undefined,
      };
    } catch (error) {
      logger.error('Failed to get portfolio analytics', { error, portfolioId });
      throw error;
    }
  }

  /**
   * Generate portfolio PDF
   */
  async generatePortfolioPDF(
    studentId: string,
    options: GeneratePortfolioPDFInput
  ): Promise<{ pdfUrl: string }> {
    try {
      // TODO: Implement PDF generation using a service like Puppeteer or PDFKit
      
      logger.info('Portfolio PDF generation requested', {
        studentId,
        options,
      });

      // Placeholder response
      return {
        pdfUrl: `https://example.com/portfolio-${studentId}-${Date.now()}.pdf`,
      };
    } catch (error) {
      logger.error('Failed to generate portfolio PDF', { error, studentId });
      throw error;
    }
  }

  /**
   * Share portfolio
   */
  async sharePortfolio(
    portfolioId: string,
    data: SharePortfolioInput
  ): Promise<{ shareUrl: string; message: string }> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: { student: true },
      });

      if (!portfolio) {
        throw new NotFoundError('Portfolio not found');
      }

      // TODO: Implement sharing functionality based on method
      // - Email sharing
      // - Social media sharing
      // - QR code generation
      // - Link generation with tracking

      const shareUrl = `${process.env.CLIENT_URL}/portfolio/${portfolio.slug}`;

      logger.info('Portfolio shared', {
        portfolioId,
        method: data.method,
        trackClicks: data.trackClicks,
      });

      return {
        shareUrl,
        message: 'Portfolio shared successfully',
      };
    } catch (error) {
      logger.error('Failed to share portfolio', { error, portfolioId });
      throw error;
    }
  }

  /**
   * Create default portfolio
   */
  private async createDefaultPortfolio(studentId: string): Promise<Portfolio> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        throw new NotFoundError('Student not found');
      }

      // Generate unique slug
      const slug = await this.generateUniqueSlug(student.fullName || 'portfolio');

      const portfolio = await prisma.portfolio.create({
        data: {
          studentId,
          title: `${student.fullName}'s Portfolio`,
          slug,
          bio: student.bio,
          isPublic: false,
          theme: 'modern',
        },
        include: {
          portfolioSections: true,
          experiences: true,
        },
      });

      logger.info('Default portfolio created', {
        portfolioId: portfolio.id,
        studentId,
        slug,
      });

      return portfolio as any;
    } catch (error) {
      logger.error('Failed to create default portfolio', { error, studentId });
      throw error;
    }
  }

  /**
   * Generate unique portfolio slug
   */
  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await prisma.portfolio.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Track portfolio view
   */
  private async trackPortfolioView(portfolioId: string, viewerInfo?: any): Promise<void> {
    try {
      await prisma.portfolioAnalytics.create({
        data: {
          portfolioId,
          viewedAt: new Date(),
          ipAddress: viewerInfo?.ipAddress,
          userAgent: viewerInfo?.userAgent,
          referrer: viewerInfo?.referrer,
          userId: viewerInfo?.userId,
        },
      });
    } catch (error) {
      logger.error('Failed to track portfolio view', { error, portfolioId });
      // Don't throw error for analytics tracking
    }
  }

  /**
   * Get portfolio sort order
   */
  private getPortfolioSortOrder(sortBy: string, sortOrder: string): Prisma.PortfolioOrderByWithRelationInput {
    const order = sortOrder as 'asc' | 'desc';
    
    switch (sortBy) {
      case 'name':
        return { title: order };
      case 'views':
        // TODO: Implement sorting by view count
        return { updatedAt: order };
      case 'experiences':
        return { experiences: { _count: order } };
      case 'skills':
        // TODO: Implement sorting by skills count
        return { updatedAt: order };
      case 'updated':
      default:
        return { updatedAt: order };
    }
  }
}
