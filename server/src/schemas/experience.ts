import { z } from 'zod';
import { ExperienceType, AchievementLevel, VerificationStatus } from '@prisma/client';
import { urlSchema, dateRangeSchema } from './common';

/**
 * Create experience schema
 */
export const createExperienceSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  
  shortDescription: z
    .string()
    .max(300, 'Short description must be less than 300 characters')
    .optional(),
  
  startDate: z
    .string()
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), 'Invalid start date'),
  
  endDate: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((val) => !val || !isNaN(val.getTime()), 'Invalid end date'),
  
  isOngoing: z.boolean().default(false),
  
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  
  type: z.nativeEnum(ExperienceType),
  
  level: z.nativeEnum(AchievementLevel),
  
  skills: z
    .array(z.string().min(1).max(50))
    .min(1, 'At least one skill is required')
    .max(20, 'Maximum 20 skills allowed'),
  
  technologies: z
    .array(z.string().min(1).max(50))
    .max(15, 'Maximum 15 technologies allowed')
    .optional(),
  
  responsibilities: z
    .array(z.string().min(5).max(500))
    .max(10, 'Maximum 10 responsibilities allowed')
    .optional(),
  
  achievements: z
    .array(z.string().min(5).max(500))
    .max(10, 'Maximum 10 achievements allowed')
    .optional(),
  
  hoursDedicated: z
    .number()
    .int()
    .min(1, 'Hours dedicated must be at least 1')
    .max(10000, 'Hours dedicated must be realistic')
    .optional(),
  
  certificateUrl: urlSchema,
  
  projectUrl: urlSchema,
  
  githubUrl: urlSchema,
  
  studentId: z.string().min(1, 'Student ID is required'),
  
  isHighlighted: z.boolean().default(false),
  
  isPublic: z.boolean().default(true),
  
  metadata: z.record(z.any()).optional(),
}).refine(
  (data) => {
    if (data.endDate && !data.isOngoing) {
      return data.startDate <= data.endDate;
    }
    if (data.isOngoing && data.endDate) {
      return false; // Cannot have end date if ongoing
    }
    return true;
  },
  {
    message: 'End date must be after start date, and ongoing experiences cannot have an end date',
    path: ['endDate'],
  }
);

/**
 * Update experience schema
 */
export const updateExperienceSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  
  shortDescription: z
    .string()
    .max(300, 'Short description must be less than 300 characters')
    .optional(),
  
  startDate: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((val) => !val || !isNaN(val.getTime()), 'Invalid start date'),
  
  endDate: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((val) => !val || !isNaN(val.getTime()), 'Invalid end date'),
  
  isOngoing: z.boolean().optional(),
  
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  
  type: z.nativeEnum(ExperienceType).optional(),
  
  level: z.nativeEnum(AchievementLevel).optional(),
  
  skills: z
    .array(z.string().min(1).max(50))
    .min(1, 'At least one skill is required')
    .max(20, 'Maximum 20 skills allowed')
    .optional(),
  
  technologies: z
    .array(z.string().min(1).max(50))
    .max(15, 'Maximum 15 technologies allowed')
    .optional(),
  
  responsibilities: z
    .array(z.string().min(5).max(500))
    .max(10, 'Maximum 10 responsibilities allowed')
    .optional(),
  
  achievements: z
    .array(z.string().min(5).max(500))
    .max(10, 'Maximum 10 achievements allowed')
    .optional(),
  
  hoursDedicated: z
    .number()
    .int()
    .min(1, 'Hours dedicated must be at least 1')
    .max(10000, 'Hours dedicated must be realistic')
    .optional(),
  
  certificateUrl: urlSchema,
  
  projectUrl: urlSchema,
  
  githubUrl: urlSchema,
  
  isHighlighted: z.boolean().optional(),
  
  isPublic: z.boolean().optional(),
  
  metadata: z.record(z.any()).optional(),
});

/**
 * Verify experience schema
 */
export const verifyExperienceSchema = z.object({
  status: z.nativeEnum(VerificationStatus),
  
  verificationNote: z
    .string()
    .max(1000, 'Verification note must be less than 1000 characters')
    .optional(),
  
  rejectionReason: z
    .string()
    .max(1000, 'Rejection reason must be less than 1000 characters')
    .optional(),
  
  requestedChanges: z
    .array(z.string().max(300))
    .max(10, 'Maximum 10 requested changes')
    .optional(),
  
  verificationDocuments: z
    .array(z.string())
    .max(5, 'Maximum 5 verification documents')
    .optional(),
}).refine(
  (data) => {
    if (data.status === 'REJECTED' && !data.rejectionReason) {
      return false;
    }
    return true;
  },
  {
    message: 'Rejection reason is required when rejecting an experience',
    path: ['rejectionReason'],
  }
);

/**
 * Get experiences query schema
 */
export const getExperiencesQuerySchema = z.object({
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
  
  search: z.string().optional(),
  
  type: z
    .string()
    .optional()
    .transform((val) => val ? val.split(',') : [])
    .refine((val) => val.every(v => Object.values(ExperienceType).includes(v as ExperienceType)), 'Invalid experience type'),
  
  level: z
    .string()
    .optional()
    .transform((val) => val ? val.split(',') : [])
    .refine((val) => val.every(v => Object.values(AchievementLevel).includes(v as AchievementLevel)), 'Invalid achievement level'),
  
  status: z
    .string()
    .optional()
    .transform((val) => val ? val.split(',') : [])
    .refine((val) => val.every(v => Object.values(VerificationStatus).includes(v as VerificationStatus)), 'Invalid verification status'),
  
  organizationId: z.string().optional(),
  
  studentId: z.string().optional(),
  
  skills: z
    .string()
    .optional()
    .transform((val) => val ? val.split(',').map(skill => skill.trim()) : []),
  
  isHighlighted: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  isPublic: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
  
  location: z.string().optional(),
  
  sortBy: z.enum([
    'title',
    'startDate',
    'endDate',
    'createdAt',
    'updatedAt',
    'status',
    'level',
    'type'
  ]).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Public experiences query schema
 */
export const getPublicExperiencesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 12)),
  
  search: z.string().optional(),
  
  type: z.string().optional(),
  
  level: z.string().optional(),
  
  skills: z
    .string()
    .optional()
    .transform((val) => val ? val.split(',').map(skill => skill.trim()) : []),
  
  organization: z.string().optional(),
  
  location: z.string().optional(),
  
  featured: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  
  sortBy: z.enum(['recent', 'popular', 'featured', 'title']).optional(),
});

/**
 * Experience analytics query schema
 */
export const experienceAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  
  metrics: z
    .array(z.enum([
      'total',
      'verified',
      'pending',
      'rejected',
      'by_type',
      'by_level',
      'by_organization',
      'by_student'
    ]))
    .optional(),
  
  groupBy: z.enum(['day', 'week', 'month']).optional(),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
  
  organizationId: z.string().optional(),
  
  studentId: z.string().optional(),
});

/**
 * Bulk experience operations schema
 */
export const bulkExperienceOperationsSchema = z.object({
  experienceIds: z
    .array(z.string().min(1))
    .min(1, 'At least one experience ID is required')
    .max(100, 'Maximum 100 experiences allowed'),
  
  operation: z.enum(['verify', 'reject', 'delete', 'highlight', 'unhighlight', 'publish', 'unpublish']),
  
  note: z
    .string()
    .max(1000, 'Note must be less than 1000 characters')
    .optional(),
  
  verificationNote: z
    .string()
    .max(1000, 'Verification note must be less than 1000 characters')
    .optional(),
  
  rejectionReason: z
    .string()
    .max(1000, 'Rejection reason must be less than 1000 characters')
    .optional(),
});

/**
 * Experience template schema
 */
export const createExperienceTemplateSchema = z.object({
  name: z
    .string()
    .min(3, 'Template name must be at least 3 characters')
    .max(100, 'Template name must be less than 100 characters'),
  
  description: z
    .string()
    .max(500, 'Template description must be less than 500 characters')
    .optional(),
  
  type: z.nativeEnum(ExperienceType),
  
  level: z.nativeEnum(AchievementLevel),
  
  template: z.object({
    titleTemplate: z.string().optional(),
    descriptionTemplate: z.string().optional(),
    defaultSkills: z.array(z.string()).optional(),
    defaultTechnologies: z.array(z.string()).optional(),
    defaultResponsibilities: z.array(z.string()).optional(),
    requiredFields: z.array(z.string()).optional(),
    validationRules: z.record(z.any()).optional(),
  }),
  
  isActive: z.boolean().default(true),
  
  organizationId: z.string().min(1, 'Organization ID is required'),
});

/**
 * Experience feedback schema
 */
export const experienceFeedbackSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  
  feedback: z
    .string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(2000, 'Feedback must be less than 2000 characters'),
  
  categories: z.object({
    communication: z.number().int().min(1).max(5).optional(),
    mentorship: z.number().int().min(1).max(5).optional(),
    learningOpportunity: z.number().int().min(1).max(5).optional(),
    workEnvironment: z.number().int().min(1).max(5).optional(),
    skillDevelopment: z.number().int().min(1).max(5).optional(),
  }).optional(),
  
  wouldRecommend: z.boolean(),
  
  anonymous: z.boolean().default(false),
  
  tags: z
    .array(z.string().max(30))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

// Export types
export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
export type VerifyExperienceInput = z.infer<typeof verifyExperienceSchema>;
export type GetExperiencesQuery = z.infer<typeof getExperiencesQuerySchema>;
export type GetPublicExperiencesQuery = z.infer<typeof getPublicExperiencesQuerySchema>;
export type ExperienceAnalyticsQuery = z.infer<typeof experienceAnalyticsQuerySchema>;
export type BulkExperienceOperationsInput = z.infer<typeof bulkExperienceOperationsSchema>;
export type CreateExperienceTemplateInput = z.infer<typeof createExperienceTemplateSchema>;
export type ExperienceFeedbackInput = z.infer<typeof experienceFeedbackSchema>;
