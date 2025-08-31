// App configuration
export const APP_NAME = 'ExperienceHub';
export const APP_DESCRIPTION = 'Verify, showcase, and discover student experiences';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Authentication
export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user_data';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  
  // Student routes
  STUDENT_DASHBOARD: '/student',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_EXPERIENCES: '/student/experiences',
  STUDENT_PORTFOLIO: '/student/portfolio',
  STUDENT_PORTFOLIO_BUILDER: '/student/portfolio-builder',
  STUDENT_VERIFICATION: '/student/verification',
  STUDENT_SETTINGS: '/student/settings',
  
  // Organization routes
  ORGANIZATION_DASHBOARD: '/organization',
  ORGANIZATION_PROFILE: '/organization/profile',
  ORGANIZATION_STUDENTS: '/organization/students',
  ORGANIZATION_REQUESTS: '/organization/requests',
  ORGANIZATION_ANALYTICS: '/organization/analytics',
  ORGANIZATION_SETTINGS: '/organization/settings',
  
  // Public routes
  PORTFOLIO: '/portfolio/:slug',
  EXPLORE: '/explore',
  SEARCH: '/search',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

// Experience types
export const EXPERIENCE_TYPES = [
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'PROJECT', label: 'Project' },
  { value: 'COURSE', label: 'Course' },
  { value: 'CERTIFICATION', label: 'Certification' },
  { value: 'COMPETITION', label: 'Competition' },
  { value: 'VOLUNTEER', label: 'Volunteer Work' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'WORK', label: 'Work Experience' },
  { value: 'ACHIEVEMENT', label: 'Achievement' },
  { value: 'OTHER', label: 'Other' },
] as const;

// Achievement levels
export const ACHIEVEMENT_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'EXPERT', label: 'Expert' },
] as const;

// Verification statuses
export const VERIFICATION_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'warning' },
  { value: 'APPROVED', label: 'Verified', color: 'success' },
  { value: 'REJECTED', label: 'Rejected', color: 'error' },
] as const;

// User roles
export const USER_ROLES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'ORGANIZATION', label: 'Organization' },
  { value: 'ADMIN', label: 'Administrator' },
] as const;

// File upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Social platforms
export const SOCIAL_PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { value: 'github', label: 'GitHub', icon: 'github' },
  { value: 'twitter', label: 'Twitter', icon: 'twitter' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram' },
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'youtube', label: 'YouTube', icon: 'youtube' },
  { value: 'website', label: 'Website', icon: 'globe' },
  { value: 'portfolio', label: 'Portfolio', icon: 'briefcase' },
  { value: 'blog', label: 'Blog', icon: 'rss' },
  { value: 'other', label: 'Other', icon: 'link' },
] as const;

// Portfolio themes
export const PORTFOLIO_THEMES = [
  { value: 'modern', label: 'Modern', preview: '/themes/modern.jpg' },
  { value: 'classic', label: 'Classic', preview: '/themes/classic.jpg' },
  { value: 'minimal', label: 'Minimal', preview: '/themes/minimal.jpg' },
  { value: 'creative', label: 'Creative', preview: '/themes/creative.jpg' },
  { value: 'professional', label: 'Professional', preview: '/themes/professional.jpg' },
] as const;

// Skill categories
export const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Cloud Platforms',
  'DevOps & Tools',
  'Design & UI/UX',
  'Data Science & Analytics',
  'Mobile Development',
  'Web Development',
  'Machine Learning',
  'Cybersecurity',
  'Project Management',
  'Languages',
  'Soft Skills',
  'Other',
] as const;

// Common skills (for autocomplete)
export const COMMON_SKILLS = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  
  // Frontend
  'React', 'Vue.js', 'Angular', 'HTML', 'CSS', 'Sass', 'TailwindCSS', 'Bootstrap',
  
  // Backend
  'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails',
  
  // Databases
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
  
  // Cloud & DevOps
  'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'CI/CD',
  
  // Design
  'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Sketch', 'UI/UX Design', 'Graphic Design',
  
  // Data Science
  'Machine Learning', 'Data Analysis', 'Python', 'R', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
  
  // Soft Skills
  'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Project Management',
] as const;

// Notification types
export const NOTIFICATION_TYPES = [
  { value: 'EXPERIENCE_CREATED', label: 'Experience Created', icon: 'plus' },
  { value: 'EXPERIENCE_VERIFIED', label: 'Experience Verified', icon: 'check' },
  { value: 'EXPERIENCE_REJECTED', label: 'Experience Rejected', icon: 'x' },
  { value: 'INVITATION_RECEIVED', label: 'Invitation Received', icon: 'mail' },
  { value: 'PORTFOLIO_VIEWED', label: 'Portfolio Viewed', icon: 'eye' },
  { value: 'SYSTEM_UPDATE', label: 'System Update', icon: 'bell' },
] as const;

// Dashboard stats colors
export const STAT_COLORS = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-blue-500',
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Breakpoints (matches Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  RECENT_SEARCHES: 'recent_searches',
  DRAFT_EXPERIENCE: 'draft_experience',
  PORTFOLIO_SETTINGS: 'portfolio_settings',
} as const;
