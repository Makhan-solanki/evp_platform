import { z } from 'zod';
import { phoneSchema, urlSchema, socialLinkSchema } from './common';

/**
 * Update student profile schema
 */
export const updateStudentProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must be less than 255 characters')
    .optional(),
  
  firstName: z
    .string()
    .min(1, 'First name must be at least 1 character')
    .max(100, 'First name must be less than 100 characters')
    .optional(),
  
  lastName: z
    .string()
    .min(1, 'Last name must be at least 1 character')
    .max(100, 'Last name must be less than 100 characters')
    .optional(),
  
  bio: z
    .string()
    .max(1000, 'Bio must be less than 1000 characters')
    .optional(),
  
  avatar: urlSchema,
  
  dateOfBirth: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((val) => !val || !isNaN(val.getTime()), 'Invalid date of birth'),
  
  phone: phoneSchema,
  
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional(),
  
  city: z
    .string()
    .max(100, 'City must be less than 100 characters')
    .optional(),
  
  state: z
    .string()
    .max(100, 'State must be less than 100 characters')
    .optional(),
  
  country: z
    .string()
    .max(100, 'Country must be less than 100 characters')
    .optional(),
  
  postalCode: z
    .string()
    .regex(/^[\w\s-]{3,10}$/, 'Invalid postal code format')
    .optional(),
  
  linkedinUrl: urlSchema,
  
  githubUrl: urlSchema,
  
  portfolioUrl: urlSchema,
  
  resumeUrl: urlSchema,
  
  isPublic: z.boolean().optional(),
  
  portfolioSlug: z
    .string()
    .min(3, 'Portfolio slug must be at least 3 characters')
    .max(50, 'Portfolio slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Portfolio slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  
  preferences: z.record(z.any()).optional(),
  
  metadata: z.record(z.any()).optional(),
});

/**
 * Organization join request schema
 */
export const organizationJoinRequestSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  
  message: z
    .string()
    .max(1000, 'Message must be less than 1000 characters')
    .optional(),
  
  studentId: z.string().optional(),
  
  program: z
    .string()
    .max(100, 'Program must be less than 100 characters')
    .optional(),
  
  expectedStartDate: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((val) => !val || !isNaN(val.getTime()), 'Invalid start date'),
  
  expectedEndDate: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((val) => !val || !isNaN(val.getTime()), 'Invalid end date'),
});

/**
 * Accept/decline experience schema
 */
export const experienceResponseSchema = z.object({
  response: z.enum(['accept', 'decline']),
  
  message: z
    .string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
  
  requestChanges: z.boolean().default(false),
  
  suggestedChanges: z
    .array(z.string())
    .max(10, 'Maximum 10 suggested changes')
    .optional(),
});

/**
 * Add skill schema
 */
export const addSkillSchema = z.object({
  name: z
    .string()
    .min(1, 'Skill name is required')
    .max(100, 'Skill name must be less than 100 characters'),
  
  level: z
    .number()
    .int()
    .min(1, 'Skill level must be at least 1')
    .max(5, 'Skill level must be at most 5'),
  
  category: z
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional(),
  
  yearsOfExperience: z
    .number()
    .int()
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience must be realistic')
    .optional(),
  
  isVerified: z.boolean().default(false),
  
  verifiedBy: z.string().optional(),
});

/**
 * Update skill schema
 */
export const updateSkillSchema = z.object({
  name: z
    .string()
    .min(1, 'Skill name is required')
    .max(100, 'Skill name must be less than 100 characters')
    .optional(),
  
  level: z
    .number()
    .int()
    .min(1, 'Skill level must be at least 1')
    .max(5, 'Skill level must be at most 5')
    .optional(),
  
  category: z
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional(),
  
  yearsOfExperience: z
    .number()
    .int()
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience must be realistic')
    .optional(),
});

/**
 * Add social link schema
 */
export const addSocialLinkSchema = z.object({
  platform: z.enum([
    'linkedin',
    'github',
    'twitter',
    'facebook',
    'instagram',
    'behance',
    'dribbble',
    'youtube',
    'tiktok',
    'discord',
    'slack',
    'website',
    'other',
  ]),
  
  url: z.string().url('Invalid URL format'),
  
  username: z
    .string()
    .max(100, 'Username must be less than 100 characters')
    .optional(),
  
  isVerified: z.boolean().default(false),
});

/**
 * Get student organizations query schema
 */
export const getStudentOrganizationsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Page must be greater than 0'),
  
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  
  isActive: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  role: z.string().optional(),
  
  sortBy: z.enum(['name', 'joinedAt', 'role']).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Get student experiences query schema
 */
export const getStudentExperiencesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  
  search: z.string().optional(),
  
  type: z.string().optional(),
  
  level: z.string().optional(),
  
  status: z.string().optional(),
  
  organizationId: z.string().optional(),
  
  isHighlighted: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
  
  sortBy: z.enum(['title', 'startDate', 'createdAt', 'status']).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Student search query schema
 */
export const studentSearchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(255, 'Search query must be less than 255 characters'),
  
  skills: z
    .string()
    .optional()
    .transform((val) => val ? val.split(',').map(skill => skill.trim()) : []),
  
  location: z.string().optional(),
  
  organizationId: z.string().optional(),
  
  experienceType: z.string().optional(),
  
  isPublic: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  verified: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 12)),
  
  sortBy: z.enum(['name', 'experience', 'skills', 'location', 'updated']).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Student portfolio settings schema
 */
export const updatePortfolioSettingsSchema = z.object({
  isPublic: z.boolean().optional(),
  
  theme: z
    .string()
    .max(50, 'Theme must be less than 50 characters')
    .optional(),
  
  customDomain: z
    .string()
    .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/, 'Invalid domain format')
    .optional(),
  
  seoSettings: z.object({
    title: z.string().max(60, 'SEO title must be less than 60 characters').optional(),
    description: z.string().max(160, 'SEO description must be less than 160 characters').optional(),
    keywords: z.array(z.string()).max(10, 'Maximum 10 SEO keywords').optional(),
  }).optional(),
  
  analytics: z.object({
    enableTracking: z.boolean().optional(),
    googleAnalyticsId: z.string().optional(),
  }).optional(),
});

/**
 * Student achievement schema
 */
export const addAchievementSchema = z.object({
  title: z
    .string()
    .min(1, 'Achievement title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  issuer: z
    .string()
    .max(200, 'Issuer must be less than 200 characters')
    .optional(),
  
  dateEarned: z
    .string()
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), 'Invalid date'),
  
  expiryDate: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((val) => !val || !isNaN(val.getTime()), 'Invalid expiry date'),
  
  credentialId: z
    .string()
    .max(100, 'Credential ID must be less than 100 characters')
    .optional(),
  
  credentialUrl: urlSchema,
  
  category: z
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional(),
  
  tags: z
    .array(z.string().max(30))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

/**
 * Student preferences schema
 */
export const updateStudentPreferencesSchema = z.object({
  jobAlerts: z.boolean().optional(),
  
  experienceRecommendations: z.boolean().optional(),
  
  networkingOpportunities: z.boolean().optional(),
  
  mentorshipPrograms: z.boolean().optional(),
  
  preferredIndustries: z
    .array(z.string())
    .max(10, 'Maximum 10 preferred industries')
    .optional(),
  
  preferredRoles: z
    .array(z.string())
    .max(10, 'Maximum 10 preferred roles')
    .optional(),
  
  preferredLocations: z
    .array(z.string())
    .max(10, 'Maximum 10 preferred locations')
    .optional(),
  
  salaryExpectation: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
  }).optional(),
  
  availability: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    hoursPerWeek: z.number().min(1).max(80).optional(),
    flexible: z.boolean().optional(),
  }).optional(),
});

// Export types
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type OrganizationJoinRequestInput = z.infer<typeof organizationJoinRequestSchema>;
export type ExperienceResponseInput = z.infer<typeof experienceResponseSchema>;
export type AddSkillInput = z.infer<typeof addSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
export type AddSocialLinkInput = z.infer<typeof addSocialLinkSchema>;
export type GetStudentOrganizationsQuery = z.infer<typeof getStudentOrganizationsQuerySchema>;
export type GetStudentExperiencesQuery = z.infer<typeof getStudentExperiencesQuerySchema>;
export type StudentSearchQuery = z.infer<typeof studentSearchQuerySchema>;
export type UpdatePortfolioSettingsInput = z.infer<typeof updatePortfolioSettingsSchema>;
export type AddAchievementInput = z.infer<typeof addAchievementSchema>;
export type UpdateStudentPreferencesInput = z.infer<typeof updateStudentPreferencesSchema>;
