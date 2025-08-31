import { Request } from 'express';
import { User, Role, VerificationStatus, ExperienceType, AchievementLevel, DocumentType, NotificationType, Organization, Student } from '@prisma/client';
import { Socket } from 'socket.io';

// Auth Types
export interface AuthRequest extends Request {
  user?: User & { organization?: Organization; student?: Student };
  userId?: string;
  userRole?: Role;
}

// WebSocket Auth Types
export interface AuthenticatedSocket extends Socket {
  user?: User & { organization?: Organization; student?: Student };
}

export interface DecodedToken {
  uid: string;
  email: string;
  role?: Role;
  iat: number;
  exp: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, unknown>;
}

// User DTOs
export interface CreateUserDto {
  email: string;
  firebaseUid: string;
  role: Role;
}

export interface UpdateProfileDto {
  fullName?: string;
  bio?: string;
  phone?: string;
  address?: string;
}

// Organization DTOs
export interface CreateOrganizationDto {
  name: string;
  description?: string;
  website?: string;
  address?: string;
  phone?: string;
  establishedYear?: number;
  industryType?: string;
  organizationType?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
  address?: string;
  phone?: string;
  establishedYear?: number;
  industryType?: string;
  organizationType?: string;
  socialLinks?: Record<string, string>;
}

// Student DTOs
export interface CreateStudentDto {
  fullName: string;
  bio?: string;
  dateOfBirth?: Date;
  phone?: string;
  address?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface UpdateStudentDto {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  dateOfBirth?: Date;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isPublic?: boolean;
}

// Experience DTOs
export interface CreateExperienceDto {
  title: string;
  description: string;
  shortDescription?: string;
  startDate: Date;
  endDate?: Date;
  isOngoing: boolean;
  location?: string;
  type: ExperienceType;
  level: AchievementLevel;
  skills: string[];
  technologies?: string[];
  responsibilities?: string[];
  achievements?: string[];
  hoursDedicated?: number;
  certificateUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  studentId: string;
}

export interface UpdateExperienceDto {
  title?: string;
  description?: string;
  shortDescription?: string;
  startDate?: Date;
  endDate?: Date;
  isOngoing?: boolean;
  location?: string;
  type?: ExperienceType;
  level?: AchievementLevel;
  skills?: string[];
  technologies?: string[];
  responsibilities?: string[];
  achievements?: string[];
  hoursDedicated?: number;
  certificateUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  isHighlighted?: boolean;
  isPublic?: boolean;
}

export interface VerifyExperienceDto {
  status: VerificationStatus;
  verificationNote?: string;
  rejectionReason?: string;
}

// Portfolio DTOs
export interface CreatePortfolioDto {
  title: string;
  subtitle?: string;
  summary?: string;
  bio?: string;
  theme?: string;
  isPublic?: boolean;
}

export interface UpdatePortfolioDto {
  title?: string;
  subtitle?: string;
  summary?: string;
  bio?: string;
  theme?: string;
  customCss?: string;
  layout?: Record<string, unknown>;
  sections?: Record<string, unknown>;
  isPublic?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

// File Upload Types
export interface FileUploadResult {
  fileUrl: string;
  publicId: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
}

export interface FileValidationOptions {
  maxSize: number;
  allowedTypes: string[];
  allowedExtensions: string[];
}

// Email Types
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}

export interface EmailTemplateData {
  [key: string]: unknown;
}

// Notification Types
export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  category?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  userId: string;
}

// Analytics Types
export interface DashboardAnalytics {
  totalExperiences: number;
  pendingVerifications: number;
  totalStudents: number;
  totalOrganizations: number;
  recentActivity: RecentActivity[];
  monthlyStats: MonthlyStats[];
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: Date;
  user: {
    name: string;
    avatar?: string;
  };
}

export interface MonthlyStats {
  month: string;
  experiences: number;
  verifications: number;
  students: number;
}

// WebSocket Types
export interface SocketUser {
  id: string;
  socketId: string;
  userId: string;
  role: Role;
  lastActivity: Date;
}

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category?: string;
  actionUrl?: string;
  createdAt: Date;
}

// Invitation Types
export interface SendInvitationDto {
  email: string;
  message?: string;
}

export interface BulkInvitationDto {
  invitations: SendInvitationDto[];
}

export interface CsvStudentRow {
  name: string;
  email: string;
  studentId?: string;
  enrollmentYear?: string;
}

// Skill Types
export interface CreateSkillDto {
  name: string;
  level: number;
  category?: string;
  yearsOfExperience?: number;
}

export interface UpdateSkillDto {
  name?: string;
  level?: number;
  category?: string;
  yearsOfExperience?: number;
}

// Social Link Types
export interface CreateSocialLinkDto {
  platform: string;
  url: string;
  username?: string;
}

// Verification Request Types
export interface CreateVerificationRequestDto {
  type: string;
  title: string;
  description?: string;
  priority?: number;
  message?: string;
  organizationId?: string;
  experienceId?: string;
  documentId?: string;
  attachments?: string[];
}

export interface ProcessVerificationRequestDto {
  status: VerificationStatus;
  responseNote?: string;
}

// Search and Filter Types
export interface ExperienceFilters {
  type?: ExperienceType[];
  level?: AchievementLevel[];
  status?: VerificationStatus[];
  organizationId?: string;
  studentId?: string;
  skills?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface StudentFilters {
  organizationId?: string;
  isPublic?: boolean;
  skills?: string[];
  location?: string;
}

// Export Prisma types for convenience
export {
  User,
  Organization,
  Student,
  Experience,
  Portfolio,
  Document,
  Notification,
  Role,
  VerificationStatus,
  ExperienceType,
  AchievementLevel,
  DocumentType,
  NotificationType
} from '@prisma/client';
