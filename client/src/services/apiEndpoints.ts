import { apiService } from './api';
import { 
  User, 
  Student, 
  Organization, 
  Experience, 
  Portfolio, 
  VerificationRequest,
  Notification,
  DashboardStats,
  AnalyticsData 
} from '@/types';

// ================================
// AUTH API ENDPOINTS
// ================================
export const authAPI = {
  /**
   * Register a new user
   */
  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    role: 'STUDENT' | 'ORGANIZATION';
    organizationName?: string;
  }) => {
    return apiService.post('/auth/register', userData);
  },

  /**
   * Login user
   */
  login: async (credentials: {
    email: string;
    password: string;
  }) => {
    return apiService.post('/auth/login', credentials);
  },

  /**
   * Logout user
   */
  logout: async () => {
    return apiService.post('/auth/logout');
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async () => {
    return apiService.post('/auth/refresh');
  },

  /**
   * Send password reset email
   */
  forgotPassword: async (email: string) => {
    return apiService.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, password: string) => {
    return apiService.post('/auth/reset-password', { token, password });
  },

  /**
   * Verify email address
   */
  verifyEmail: async (token: string) => {
    return apiService.post('/auth/verify-email', { token });
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    return apiService.get<User>('/auth/me');
  },
};

// ================================
// USER API ENDPOINTS
// ================================
export const userAPI = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    return apiService.get<User>('/users/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>) => {
    return apiService.put<User>('/users/profile', data);
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (file: File, onProgress?: (progress: number) => void) => {
    return apiService.uploadFile('/users/avatar', file, onProgress);
  },

  /**
   * Update user notification settings
   */
  updateNotificationSettings: async (settings: any) => {
    return apiService.put('/users/notification-settings', settings);
  },

  /**
   * Update user privacy settings
   */
  updatePrivacySettings: async (settings: any) => {
    return apiService.put('/users/privacy-settings', settings);
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiService.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Delete user account
   */
  deleteAccount: async () => {
    return apiService.delete('/users/account');
  },

  /**
   * Search users
   */
  searchUsers: async (query: string, filters?: any) => {
    return apiService.get<User[]>('/users/search', {
      params: { query, ...filters },
    });
  },
};

// ================================
// STUDENT API ENDPOINTS
// ================================
export const studentAPI = {
  /**
   * Get student dashboard data
   */
  getDashboard: async () => {
    return apiService.get<DashboardStats>('/students/dashboard');
  },

  /**
   * Get student profile
   */
  getProfile: async () => {
    return apiService.get<Student>('/students/profile');
  },

  /**
   * Update student profile
   */
  updateProfile: async (data: Partial<Student>) => {
    return apiService.put<Student>('/students/profile', data);
  },

  /**
   * Get student experiences
   */
  getExperiences: async (params?: { status?: string; type?: string }) => {
    return apiService.get<Experience[]>('/students/experiences', { params });
  },

  /**
   * Create new experience
   */
  createExperience: async (data: Partial<Experience>) => {
    return apiService.post<Experience>('/students/experiences', data);
  },

  /**
   * Update experience
   */
  updateExperience: async (id: string, data: Partial<Experience>) => {
    return apiService.put<Experience>(`/students/experiences/${id}`, data);
  },

  /**
   * Delete experience
   */
  deleteExperience: async (id: string) => {
    return apiService.delete(`/students/experiences/${id}`);
  },

  /**
   * Get student portfolio
   */
  getPortfolio: async () => {
    return apiService.get<Portfolio>('/students/portfolio');
  },

  /**
   * Update student portfolio
   */
  updatePortfolio: async (data: Partial<Portfolio>) => {
    return apiService.put<Portfolio>('/students/portfolio', data);
  },

  /**
   * Get verification requests sent by student
   */
  getVerificationRequests: async () => {
    return apiService.get<VerificationRequest[]>('/students/verification-requests');
  },

  /**
   * Create verification request
   */
  createVerificationRequest: async (data: {
    organizationId: string;
    experienceId: string;
    message?: string;
  }) => {
    return apiService.post<VerificationRequest>('/students/verification-requests', data);
  },

  /**
   * Accept experience offer from organization
   */
  acceptExperience: async (requestId: string) => {
    return apiService.post(`/students/experiences/${requestId}/accept`);
  },

  /**
   * Decline experience offer from organization
   */
  declineExperience: async (requestId: string, reason?: string) => {
    return apiService.post(`/students/experiences/${requestId}/decline`, { reason });
  },

  /**
   * Get student notifications
   */
  getNotifications: async (params?: { type?: string; read?: boolean }) => {
    return apiService.get<Notification[]>('/students/notifications', { params });
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (id: string) => {
    return apiService.put(`/students/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async () => {
    return apiService.put('/students/notifications/read-all');
  },

  /**
   * Add skill to student profile
   */
  addSkill: async (skill: string) => {
    return apiService.post('/students/skills', { skill });
  },

  /**
   * Remove skill from student profile
   */
  removeSkill: async (skillId: string) => {
    return apiService.delete(`/students/skills/${skillId}`);
  },

  /**
   * Add social link
   */
  addSocialLink: async (data: { platform: string; url: string }) => {
    return apiService.post('/students/social-links', data);
  },

  /**
   * Update social link
   */
  updateSocialLink: async (id: string, data: { platform: string; url: string }) => {
    return apiService.put(`/students/social-links/${id}`, data);
  },

  /**
   * Remove social link
   */
  removeSocialLink: async (id: string) => {
    return apiService.delete(`/students/social-links/${id}`);
  },
};

// ================================
// ORGANIZATION API ENDPOINTS
// ================================
export const organizationAPI = {
  /**
   * Get organization dashboard data
   */
  getDashboard: async () => {
    return apiService.get<DashboardStats>('/organizations/dashboard');
  },

  /**
   * Get organization profile
   */
  getProfile: async () => {
    return apiService.get<Organization>('/organizations/profile');
  },

  /**
   * Update organization profile
   */
  updateProfile: async (data: Partial<Organization>) => {
    return apiService.put<Organization>('/organizations/profile', data);
  },

  /**
   * Get organization students
   */
  getStudents: async (params?: { 
    search?: string; 
    status?: string; 
    page?: number; 
    limit?: number; 
  }) => {
    return apiService.get<{ students: Student[]; pagination: any }>('/organizations/students', { params });
  },

  /**
   * Invite student to organization
   */
  inviteStudent: async (email: string) => {
    return apiService.post('/organizations/students/invite', { email });
  },

  /**
   * Bulk invite students
   */
  bulkInviteStudents: async (emails: string[]) => {
    return apiService.post('/organizations/students/bulk-invite', { emails });
  },

  /**
   * Remove student from organization
   */
  removeStudent: async (studentId: string) => {
    return apiService.delete(`/organizations/students/${studentId}`);
  },

  /**
   * Create experience for organization
   */
  createExperience: async (data: Partial<Experience>) => {
    return apiService.post<Experience>('/organizations/experiences', data);
  },

  /**
   * Get verification requests for organization
   */
  getVerificationRequests: async (params?: { 
    status?: string; 
    studentId?: string; 
    page?: number; 
    limit?: number; 
  }) => {
    return apiService.get<{ requests: VerificationRequest[]; pagination: any }>('/organizations/verification-requests', { params });
  },

  /**
   * Approve verification request
   */
  approveVerification: async (requestId: string, data?: { notes?: string }) => {
    return apiService.post(`/organizations/verification-requests/${requestId}/approve`, data);
  },

  /**
   * Reject verification request
   */
  rejectVerification: async (requestId: string, data: { reason: string; notes?: string }) => {
    return apiService.post(`/organizations/verification-requests/${requestId}/reject`, data);
  },

  /**
   * Request more information for verification
   */
  requestMoreInfo: async (requestId: string, message: string) => {
    return apiService.post(`/organizations/verification-requests/${requestId}/request-info`, { message });
  },

  /**
   * Get organization analytics
   */
  getAnalytics: async (params?: { 
    startDate?: string; 
    endDate?: string; 
    type?: string; 
  }) => {
    return apiService.get<AnalyticsData>('/organizations/analytics', { params });
  },

  /**
   * Export organization data
   */
  exportData: async (type: 'students' | 'experiences' | 'analytics') => {
    return apiService.downloadFile(`/organizations/export/${type}`, `${type}_export.csv`);
  },

  /**
   * Get verification queue
   */
  getVerificationQueue: async (params?: any) => {
    return apiService.get('/organizations/verification-queue', { params });
  },
};

// ================================
// EXPERIENCE API ENDPOINTS
// ================================
export const experienceAPI = {
  /**
   * Get experience by ID
   */
  getExperience: async (id: string) => {
    return apiService.get<Experience>(`/experiences/${id}`);
  },

  /**
   * Update experience
   */
  updateExperience: async (id: string, data: Partial<Experience>) => {
    return apiService.put<Experience>(`/experiences/${id}`, data);
  },

  /**
   * Upload documents for experience
   */
  uploadDocuments: async (id: string, files: File[], onProgress?: (progress: number) => void) => {
    return apiService.uploadFiles(`/experiences/${id}/documents`, files, onProgress);
  },

  /**
   * Get experience documents
   */
  getDocuments: async (id: string) => {
    return apiService.get(`/experiences/${id}/documents`);
  },

  /**
   * Delete experience document
   */
  deleteDocument: async (id: string, documentId: string) => {
    return apiService.delete(`/experiences/${id}/documents/${documentId}`);
  },

  /**
   * Submit experience for verification
   */
  submitForVerification: async (id: string, organizationId: string) => {
    return apiService.post(`/experiences/${id}/submit-verification`, { organizationId });
  },

  /**
   * Withdraw verification request
   */
  withdrawVerification: async (id: string) => {
    return apiService.post(`/experiences/${id}/withdraw-verification`);
  },
};

// ================================
// PORTFOLIO API ENDPOINTS
// ================================
export const portfolioAPI = {
  /**
   * Get public portfolio by slug
   */
  getPublicPortfolio: async (slug: string) => {
    return apiService.get<Portfolio>(`/portfolios/${slug}`);
  },

  /**
   * Generate portfolio PDF
   */
  generatePDF: async (slug: string) => {
    return apiService.downloadFile(`/portfolios/${slug}/pdf`, `portfolio_${slug}.pdf`);
  },

  /**
   * Get portfolio analytics
   */
  getPortfolioAnalytics: async (slug: string, params?: { startDate?: string; endDate?: string }) => {
    return apiService.get(`/portfolios/${slug}/analytics`, { params });
  },

  /**
   * Check portfolio slug availability
   */
  checkSlugAvailability: async (slug: string) => {
    return apiService.get(`/portfolios/check-slug/${slug}`);
  },
};

// ================================
// FILE API ENDPOINTS
// ================================
export const fileAPI = {
  /**
   * Upload single file
   */
  uploadFile: async (file: File, type: string, onProgress?: (progress: number) => void) => {
    return apiService.uploadFile(`/files/upload/${type}`, file, onProgress);
  },

  /**
   * Upload multiple files
   */
  uploadFiles: async (files: File[], type: string, onProgress?: (progress: number) => void) => {
    return apiService.uploadFiles(`/files/upload/${type}`, files, onProgress);
  },

  /**
   * Delete file
   */
  deleteFile: async (fileId: string) => {
    return apiService.delete(`/files/${fileId}`);
  },

  /**
   * Get file URL
   */
  getFileUrl: async (fileId: string) => {
    return apiService.get(`/files/${fileId}/url`);
  },

  /**
   * Get file details
   */
  getFileDetails: async (fileId: string) => {
    return apiService.get(`/files/${fileId}`);
  },
};

// ================================
// ANALYTICS API ENDPOINTS
// ================================
const analyticsAPI = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (userType: 'student' | 'organization') => {
    return apiService.get<DashboardStats>(`/analytics/dashboard/${userType}`);
  },

  /**
   * Get experience analytics
   */
  getExperienceAnalytics: async (params?: any) => {
    return apiService.get('/analytics/experiences', { params });
  },

  /**
   * Get student analytics
   */
  getStudentAnalytics: async (params?: any) => {
    return apiService.get('/analytics/students', { params });
  },

  /**
   * Export analytics data
   */
  exportAnalytics: async (type: string, format: 'csv' | 'json' = 'csv') => {
    return apiService.downloadFile(`/analytics/export/${type}?format=${format}`, `analytics_${type}.${format}`);
  },
};

// Export all APIs
export {
  userAPI,
  studentAPI,
  organizationAPI,
  experienceAPI,
  portfolioAPI,
  fileAPI,
  analyticsAPI,
};
