import { beforeAll, afterAll, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { logger } from '../src/config/logger';

// Test database instance
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_experience_verification',
    },
  },
});

// Global test setup
beforeAll(async () => {
  try {
    // Connect to test database
    await testPrisma.$connect();
    
    // Reset database schema
    execSync('npx prisma migrate reset --force --skip-generate', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_experience_verification',
      },
    });
    
    // Run migrations
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_experience_verification',
      },
    });
    
    logger.info('Test database setup completed');
  } catch (error) {
    logger.error('Test database setup failed', { error });
    throw error;
  }
});

// Global test cleanup
afterAll(async () => {
  try {
    await testPrisma.$disconnect();
    logger.info('Test database disconnected');
  } catch (error) {
    logger.error('Test database cleanup failed', { error });
  }
});

// Clean up data before each test
beforeEach(async () => {
  try {
    // Clear all tables in reverse dependency order
    await testPrisma.auditLog.deleteMany();
    await testPrisma.notification.deleteMany();
    await testPrisma.achievementBadge.deleteMany();
    await testPrisma.portfolioAnalytics.deleteMany();
    await testPrisma.portfolioExperience.deleteMany();
    await testPrisma.portfolioSection.deleteMany();
    await testPrisma.portfolio.deleteMany();
    await testPrisma.document.deleteMany();
    await testPrisma.verificationRequest.deleteMany();
    await testPrisma.studentInvitation.deleteMany();
    await testPrisma.socialLink.deleteMany();
    await testPrisma.studentSkill.deleteMany();
    await testPrisma.experience.deleteMany();
    await testPrisma.organizationStudent.deleteMany();
    await testPrisma.student.deleteMany();
    await testPrisma.organization.deleteMany();
    await testPrisma.user.deleteMany();
    await testPrisma.emailTemplate.deleteMany();
    await testPrisma.settings.deleteMany();
  } catch (error) {
    logger.error('Test data cleanup failed', { error });
    throw error;
  }
});

// Test utilities
export const testUtils = {
  /**
   * Create a test user
   */
  async createTestUser(data: {
    email: string;
    firebaseUid: string;
    role: 'STUDENT' | 'ORGANIZATION' | 'ADMIN';
  }) {
    return await testPrisma.user.create({
      data: {
        email: data.email,
        firebaseUid: data.firebaseUid,
        role: data.role,
        verified: true,
        emailVerified: true,
        isActive: true,
      },
    });
  },

  /**
   * Create a test organization
   */
  async createTestOrganization(userId: string, data?: Partial<{
    name: string;
    description: string;
    slug: string;
  }>) {
    return await testPrisma.organization.create({
      data: {
        name: data?.name || 'Test Organization',
        description: data?.description || 'Test organization description',
        slug: data?.slug || 'test-organization',
        userId,
        verified: true,
        isActive: true,
      },
    });
  },

  /**
   * Create a test student
   */
  async createTestStudent(userId: string, data?: Partial<{
    fullName: string;
    bio: string;
    portfolioSlug: string;
  }>) {
    return await testPrisma.student.create({
      data: {
        fullName: data?.fullName || 'Test Student',
        bio: data?.bio || 'Test student bio',
        portfolioSlug: data?.portfolioSlug || 'test-student',
        userId,
        profileCompleted: true,
        isPublic: true,
      },
    });
  },

  /**
   * Create a test experience
   */
  async createTestExperience(organizationId: string, studentId: string, data?: Partial<{
    title: string;
    description: string;
    type: any;
    level: any;
    status: any;
  }>) {
    return await testPrisma.experience.create({
      data: {
        title: data?.title || 'Test Experience',
        description: data?.description || 'Test experience description',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-06-01'),
        type: data?.type || 'INTERNSHIP',
        level: data?.level || 'BEGINNER',
        status: data?.status || 'PENDING',
        skills: ['JavaScript', 'React'],
        organizationId,
        studentId,
      },
    });
  },

  /**
   * Create a test portfolio
   */
  async createTestPortfolio(studentId: string, data?: Partial<{
    title: string;
    subtitle: string;
    summary: string;
  }>) {
    return await testPrisma.portfolio.create({
      data: {
        title: data?.title || 'Test Portfolio',
        subtitle: data?.subtitle || 'Test portfolio subtitle',
        summary: data?.summary || 'Test portfolio summary',
        studentId,
        isPublic: true,
      },
    });
  },

  /**
   * Generate mock JWT token (for testing)
   */
  generateMockToken(userId: string, role: string): string {
    // In real tests, you might want to use the actual JWT library
    // For now, return a simple mock token
    return `mock.jwt.token.${userId}.${role}`;
  },

  /**
   * Wait for async operations to complete
   */
  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Generate random string for testing
   */
  randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Generate random email for testing
   */
  randomEmail(): string {
    return `test.${this.randomString(8)}@example.com`;
  },
};

// Mock external services for testing
export const mockServices = {
  firebase: {
    verifyIdToken: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    setCustomClaims: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByUid: jest.fn(),
    generateEmailVerificationLink: jest.fn(),
    generatePasswordResetLink: jest.fn(),
    revokeRefreshTokens: jest.fn(),
    checkRevoked: jest.fn(),
    disableUser: jest.fn(),
    enableUser: jest.fn(),
  },
  
  cloudinary: {
    uploadFile: jest.fn(),
    uploadBuffer: jest.fn(),
    deleteFile: jest.fn(),
    generateOptimizedUrl: jest.fn(),
    generateThumbnailUrl: jest.fn(),
    getFileInfo: jest.fn(),
    validateFile: jest.fn(),
  },
  
  email: {
    sendEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
    sendInvitationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendVerificationEmail: jest.fn(),
  },
};

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
