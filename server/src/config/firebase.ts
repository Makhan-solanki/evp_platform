import { logger } from './logger';

// Stub Firebase Service for backend-only authentication
class FirebaseService {
  constructor() {
    logger.info('Firebase service disabled - using backend-only authentication');
  }

  // Stub methods that return errors
  async verifyIdToken(idToken: string): Promise<any> {
    throw new Error('Firebase authentication is disabled');
  }

  async getUserByUid(uid: string): Promise<any> {
    throw new Error('Firebase authentication is disabled');
  }

  async getUserByEmail(email: string): Promise<any> {
    throw new Error('Firebase authentication is disabled');
  }

  async createUser(userData: any): Promise<any> {
    throw new Error('Firebase authentication is disabled');
  }

  async updateUser(uid: string, userData: any): Promise<any> {
    throw new Error('Firebase authentication is disabled');
  }

  async deleteUser(uid: string): Promise<void> {
    throw new Error('Firebase authentication is disabled');
  }

  async setCustomClaims(uid: string, claims: any): Promise<void> {
    throw new Error('Firebase authentication is disabled');
  }

  async generatePasswordResetLink(email: string): Promise<string> {
    throw new Error('Firebase authentication is disabled');
  }

  async generateEmailVerificationLink(email: string): Promise<string> {
    throw new Error('Firebase authentication is disabled');
  }

  async revokeRefreshTokens(uid: string): Promise<void> {
    throw new Error('Firebase authentication is disabled');
  }

  async disableUser(uid: string): Promise<void> {
    throw new Error('Firebase authentication is disabled');
  }

  async enableUser(uid: string): Promise<void> {
    throw new Error('Firebase authentication is disabled');
  }

  async checkRevoked(decodedToken: any): Promise<boolean> {
    throw new Error('Firebase authentication is disabled');
  }
}

export const firebaseService = new FirebaseService();
