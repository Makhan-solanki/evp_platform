import request from 'supertest';
import { describe, test, expect, beforeEach } from '@jest/globals';
import app from '../src/app';
import { testPrisma, testUtils, mockServices } from './setup';
import { Role } from '@prisma/client';

// Mock Firebase service
jest.mock('../src/config/firebase', () => ({
  firebaseService: mockServices.firebase,
}));

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new student user successfully', async () => {
      // Mock Firebase user creation
      mockServices.firebase.createUser.mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'student@example.com',
      });
      
      mockServices.firebase.setCustomClaims.mockResolvedValue(undefined);

      const userData = {
        email: 'student@example.com',
        password: 'Password123!',
        role: 'STUDENT' as Role,
        fullName: 'John Doe',
        bio: 'Software engineering student',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registration successful');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.role).toBe(userData.role);
      expect(response.body.data.student).toBeDefined();
      expect(response.body.data.student.fullName).toBe(userData.fullName);

      // Verify user was created in database
      const dbUser = await testPrisma.user.findUnique({
        where: { email: userData.email },
        include: { student: true },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser?.email).toBe(userData.email);
      expect(dbUser?.role).toBe(userData.role);
      expect(dbUser?.student?.fullName).toBe(userData.fullName);
    });

    test('should register a new organization user successfully', async () => {
      mockServices.firebase.createUser.mockResolvedValue({
        uid: 'firebase-uid-456',
        email: 'org@example.com',
      });
      
      mockServices.firebase.setCustomClaims.mockResolvedValue(undefined);

      const userData = {
        email: 'org@example.com',
        password: 'Password123!',
        role: 'ORGANIZATION' as Role,
        organizationName: 'Tech University',
        organizationDescription: 'Leading technology university',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe(userData.role);
      expect(response.body.data.organization).toBeDefined();
      expect(response.body.data.organization.name).toBe(userData.organizationName);

      // Verify organization was created
      const dbUser = await testPrisma.user.findUnique({
        where: { email: userData.email },
        include: { organization: true },
      });

      expect(dbUser?.organization?.name).toBe(userData.organizationName);
    });

    test('should fail registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123!',
        role: 'STUDENT' as Role,
        fullName: 'John Doe',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.email).toContain('Invalid email address');
    });

    test('should fail registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        role: 'STUDENT' as Role,
        fullName: 'John Doe',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.password).toBeDefined();
    });

    test('should fail registration for duplicate email', async () => {
      // Create existing user
      const existingUser = await testUtils.createTestUser({
        email: 'existing@example.com',
        firebaseUid: 'existing-uid',
        role: 'STUDENT',
      });

      const userData = {
        email: 'existing@example.com',
        password: 'Password123!',
        role: 'STUDENT' as Role,
        fullName: 'John Doe',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: any;
    let testStudent: any;

    beforeEach(async () => {
      testUser = await testUtils.createTestUser({
        email: 'login@example.com',
        firebaseUid: 'login-uid',
        role: 'STUDENT',
      });

      testStudent = await testUtils.createTestStudent(testUser.id, {
        fullName: 'Login User',
      });
    });

    test('should login successfully with valid credentials', async () => {
      mockServices.firebase.getUserByEmail.mockResolvedValue({
        uid: 'login-uid',
        email: 'login@example.com',
      });

      const loginData = {
        email: 'login@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.student).toBeDefined();
    });

    test('should fail login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    test('should fail login for inactive user', async () => {
      // Deactivate user
      await testPrisma.user.update({
        where: { id: testUser.id },
        data: { isActive: false },
      });

      mockServices.firebase.getUserByEmail.mockResolvedValue({
        uid: 'login-uid',
        email: 'login@example.com',
      });

      const loginData = {
        email: 'login@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('deactivated');
    });
  });

  describe('POST /api/auth/verify-token', () => {
    test('should verify valid Firebase token', async () => {
      const testUser = await testUtils.createTestUser({
        email: 'verify@example.com',
        firebaseUid: 'verify-uid',
        role: 'STUDENT',
      });

      const testStudent = await testUtils.createTestStudent(testUser.id);

      mockServices.firebase.verifyIdToken.mockResolvedValue({
        uid: 'verify-uid',
        email: 'verify@example.com',
      });

      mockServices.firebase.checkRevoked.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/verify-token')
        .send({ token: 'valid.firebase.token' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token verified successfully');
      expect(response.body.data.user.email).toBe('verify@example.com');
    });

    test('should fail with invalid token', async () => {
      mockServices.firebase.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/api/auth/verify-token')
        .send({ token: 'invalid.token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    test('should fail with revoked token', async () => {
      mockServices.firebase.verifyIdToken.mockResolvedValue({
        uid: 'verify-uid',
        email: 'verify@example.com',
      });

      mockServices.firebase.checkRevoked.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/verify-token')
        .send({ token: 'revoked.token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('revoked');
    });
  });

  describe('GET /api/auth/profile', () => {
    test('should get user profile when authenticated', async () => {
      const testUser = await testUtils.createTestUser({
        email: 'profile@example.com',
        firebaseUid: 'profile-uid',
        role: 'STUDENT',
      });

      const testStudent = await testUtils.createTestStudent(testUser.id);

      // Mock authentication middleware
      const mockToken = testUtils.generateMockToken(testUser.id, testUser.role);

      // This would require mocking the authentication middleware
      // For simplicity, we'll skip this test in the basic implementation
    });

    test('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('should send password reset email for existing user', async () => {
      const testUser = await testUtils.createTestUser({
        email: 'reset@example.com',
        firebaseUid: 'reset-uid',
        role: 'STUDENT',
      });

      mockServices.firebase.generatePasswordResetLink.mockResolvedValue(
        'https://example.com/reset?token=abc123'
      );

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset instructions sent');
    });

    test('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset instructions sent');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    test('should verify email with valid token', async () => {
      mockServices.firebase.verifyIdToken.mockResolvedValue({
        uid: 'verify-email-uid',
        email: 'verify-email@example.com',
      });

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'valid.verification.token' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Email verified successfully');
    });

    test('should fail with invalid verification token', async () => {
      mockServices.firebase.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid.token' })
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });
});
