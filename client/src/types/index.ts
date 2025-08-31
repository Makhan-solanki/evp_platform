// User Types
export interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'ORGANIZATION' | 'ADMIN';
  verified: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  userId: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
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
  resumeUrl?: string;
  isPublic: boolean;
  portfolioSlug?: string;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  address?: string;
  phone?: string;
  establishedYear?: number;
  industryType?: string;
  organizationType?: string;
  socialLinks?: Record<string, string>;
  verified: boolean;
  isActive: boolean;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Experience Types
export interface Experience {
  id: string;
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
  organizationId: string;
  status: VerificationStatus;
  isHighlighted: boolean;
  isPublic: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  organization?: {
    id: string;
    name: string;
    logo?: string;
  };
}

export enum ExperienceType {
  INTERNSHIP = 'INTERNSHIP',
  PROJECT = 'PROJECT',
  COURSE = 'COURSE',
  CERTIFICATION = 'CERTIFICATION',
  COMPETITION = 'COMPETITION',
  VOLUNTEER = 'VOLUNTEER',
  RESEARCH = 'RESEARCH',
  WORK = 'WORK',
  ACHIEVEMENT = 'ACHIEVEMENT',
  OTHER = 'OTHER',
}

export enum AchievementLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Portfolio Types
export interface Portfolio {
  id: string;
  studentId: string;
  title: string;
  slug: string;
  bio?: string;
  headline?: string;
  summary?: string;
  isPublic: boolean;
  theme?: string;
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  socialLinks?: Array<{
    platform: string;
    url: string;
    username?: string;
  }>;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioSection {
  id: string;
  portfolioId: string;
  type: string;
  title: string;
  content: Record<string, any>;
  isVisible: boolean;
  order: number;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Skills and Social Links
export interface StudentSkill {
  id: string;
  studentId: string;
  name: string;
  level: number;
  category?: string;
  yearsOfExperience?: number;
  isVerified: boolean;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialLink {
  id: string;
  studentId: string;
  platform: string;
  url: string;
  username?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  category?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
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
  hasNext?: boolean;
  hasPrev?: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: 'STUDENT' | 'ORGANIZATION';
  organizationName?: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileForm {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
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

export interface CreateExperienceForm {
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
  isHighlighted?: boolean;
  isPublic?: boolean;
}

// Search and Filter Types
export interface ExperienceFilters {
  search?: string;
  type?: ExperienceType[];
  level?: AchievementLevel[];
  status?: VerificationStatus[];
  organizationId?: string;
  studentId?: string;
  skills?: string[];
  isHighlighted?: boolean;
  isPublic?: boolean;
  startDate?: string;
  endDate?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface StudentFilters {
  search?: string;
  skills?: string[];
  location?: string;
  organizationId?: string;
  experienceType?: string;
  isPublic?: boolean;
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PortfolioFilters {
  search?: string;
  skills?: string[];
  experienceTypes?: string[];
  levels?: string[];
  location?: string;
  organizations?: string[];
  verified?: boolean;
  hasExperiences?: boolean;
  theme?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Authentication Types
export interface AuthState {
  user: User | null;
  student: Student | null;
  organization: Organization | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  role: 'STUDENT' | 'ORGANIZATION';
  organizationName?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalExperiences: number;
  verifiedExperiences: number;
  pendingExperiences: number;
  portfolioViews: number;
  skillsCount: number;
  organizationsCount: number;
  achievementsCount?: number;
}

export interface AnalyticsData {
  totalStudents: number;
  totalExperiences: number;
  verifiedExperiences: number;
  pendingVerifications: number;
  portfolioViews: number;
  averageVerificationTime: number;
  topSkills: Array<{ skill: string; count: number }>;
  experienceTypes: Array<{ type: string; count: number }>;
  monthlyStats: Array<{ month: string; experiences: number; verifications: number }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    userId: string;
    userName: string;
  }>;
}

export interface OrganizationStats {
  totalStudents: number;
  activeStudents: number;
  totalExperiences: number;
  verifiedExperiences: number;
  pendingVerifications: number;
}

// Component Props Types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

export interface InputProps extends ComponentProps {
  label?: string;
  error?: string;
  help?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

// Route Types
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  roles?: string[];
  title?: string;
}

// WebSocket Types
export interface SocketData {
  userId?: string;
  message?: string;
  type?: string;
  payload?: any;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> 
  & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys];

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent?: string;
  };
  layout: {
    headerStyle: 'minimal' | 'centered' | 'split' | 'sidebar';
    navigationStyle: 'horizontal' | 'vertical' | 'hamburger';
    footerStyle: 'minimal' | 'detailed' | 'none';
    spacing: 'compact' | 'normal' | 'spacious';
  };
}

export default {};
