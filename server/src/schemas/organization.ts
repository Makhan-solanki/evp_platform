import { z } from 'zod';
import { phoneSchema, urlSchema, slugSchema } from './common';

/**
 * Create organization schema
 */
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(255, 'Organization name must be less than 255 characters'),
  
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  
  website: urlSchema,
  
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional(),
  
  phone: phoneSchema,
  
  establishedYear: z
    .number()
    .int()
    .min(1800, 'Established year must be after 1800')
    .max(new Date().getFullYear(), 'Established year cannot be in the future')
    .optional(),
  
  industryType: z
    .string()
    .max(100, 'Industry type must be less than 100 characters')
    .optional(),
  
  organizationType: z.enum([
    'university',
    'college',
    'school',
    'company',
    'nonprofit',
    'government',
    'startup',
    'other'
  ]).optional(),
  
  socialLinks: z.record(z.string().url()).optional(),
});

/**
 * Update organization profile schema
 */
export const updateOrganizationProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(255, 'Organization name must be less than 255 characters')
    .optional(),
  
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  
  logo: urlSchema,
  
  website: urlSchema,
  
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional(),
  
  phone: phoneSchema,
  
  establishedYear: z
    .number()
    .int()
    .min(1800, 'Established year must be after 1800')
    .max(new Date().getFullYear(), 'Established year cannot be in the future')
    .optional(),
  
  industryType: z
    .string()
    .max(100, 'Industry type must be less than 100 characters')
    .optional(),
  
  organizationType: z.enum([
    'university',
    'college',
    'school',
    'company',
    'nonprofit',
    'government',
    'startup',
    'other'
  ]).optional(),
  
  socialLinks: z.record(z.string().url()).optional(),
  
  settings: z.record(z.any()).optional(),
});

/**
 * Invite student schema
 */
export const inviteStudentSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  
  message: z
    .string()
    .max(1000, 'Message must be less than 1000 characters')
    .optional(),
  
  role: z
    .string()
    .max(100, 'Role must be less than 100 characters')
    .optional(),
  
  department: z
    .string()
    .max(100, 'Department must be less than 100 characters')
    .optional(),
  
  program: z
    .string()
    .max(100, 'Program must be less than 100 characters')
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
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  }
);

/**
 * Bulk invite students schema
 */
export const bulkInviteStudentsSchema = z.object({
  invitations: z
    .array(inviteStudentSchema)
    .min(1, 'At least one invitation is required')
    .max(100, 'Maximum 100 invitations allowed at once'),
  
  defaultMessage: z
    .string()
    .max(1000, 'Default message must be less than 1000 characters')
    .optional(),
  
  defaultRole: z
    .string()
    .max(100, 'Default role must be less than 100 characters')
    .optional(),
});

/**
 * CSV bulk invite schema
 */
export const csvBulkInviteSchema = z.object({
  mapping: z.object({
    email: z.string().min(1, 'Email column mapping is required'),
    name: z.string().optional(),
    studentId: z.string().optional(),
    enrollmentYear: z.string().optional(),
    program: z.string().optional(),
    department: z.string().optional(),
  }),
  
  hasHeader: z.boolean().default(true),
  
  delimiter: z.string().default(','),
  
  defaultMessage: z
    .string()
    .max(1000, 'Default message must be less than 1000 characters')
    .optional(),
});

/**
 * Remove student schema
 */
export const removeStudentSchema = z.object({
  reason: z
    .string()
    .max(500, 'Reason must be less than 500 characters')
    .optional(),
  
  notifyStudent: z.boolean().default(true),
});

/**
 * Update student role schema
 */
export const updateStudentRoleSchema = z.object({
  role: z
    .string()
    .max(100, 'Role must be less than 100 characters')
    .optional(),
  
  department: z
    .string()
    .max(100, 'Department must be less than 100 characters')
    .optional(),
  
  program: z
    .string()
    .max(100, 'Program must be less than 100 characters')
    .optional(),
  
  startDate: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined),
  
  endDate: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined),
  
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

/**
 * Get organization students query schema
 */
export const getOrganizationStudentsQuerySchema = z.object({
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
  
  department: z.string().optional(),
  
  program: z.string().optional(),
  
  role: z.string().optional(),
  
  isActive: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  sortBy: z.enum(['name', 'email', 'joinedAt', 'role']).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Get organization experiences query schema
 */
export const getOrganizationExperiencesQuerySchema = z.object({
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
  
  studentId: z.string().optional(),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
  
  sortBy: z.enum(['title', 'createdAt', 'startDate', 'status']).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Organization analytics query schema
 */
export const organizationAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  
  metrics: z
    .array(z.enum([
      'students',
      'experiences',
      'verifications',
      'portfolios',
      'engagement'
    ]))
    .optional(),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
  
  groupBy: z.enum(['day', 'week', 'month']).optional(),
});

/**
 * Verification queue query schema
 */
export const verificationQueueQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  
  type: z.string().optional(),
  
  priority: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined),
  
  assignedTo: z.string().optional(),
  
  studentId: z.string().optional(),
  
  sortBy: z.enum(['createdAt', 'priority', 'dueDate']).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Organization settings schema
 */
export const updateOrganizationSettingsSchema = z.object({
  autoVerification: z.boolean().optional(),
  
  requireApproval: z.boolean().optional(),
  
  emailNotifications: z.boolean().optional(),
  
  publicProfile: z.boolean().optional(),
  
  allowStudentRequests: z.boolean().optional(),
  
  verificationWorkflow: z.enum(['manual', 'auto', 'hybrid']).optional(),
  
  branding: z.object({
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
    secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
    logo: urlSchema,
    banner: urlSchema,
  }).optional(),
});

// Export types
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationProfileInput = z.infer<typeof updateOrganizationProfileSchema>;
export type InviteStudentInput = z.infer<typeof inviteStudentSchema>;
export type BulkInviteStudentsInput = z.infer<typeof bulkInviteStudentsSchema>;
export type CsvBulkInviteInput = z.infer<typeof csvBulkInviteSchema>;
export type RemoveStudentInput = z.infer<typeof removeStudentSchema>;
export type UpdateStudentRoleInput = z.infer<typeof updateStudentRoleSchema>;
export type GetOrganizationStudentsQuery = z.infer<typeof getOrganizationStudentsQuerySchema>;
export type GetOrganizationExperiencesQuery = z.infer<typeof getOrganizationExperiencesQuerySchema>;
export type OrganizationAnalyticsQuery = z.infer<typeof organizationAnalyticsQuerySchema>;
export type VerificationQueueQuery = z.infer<typeof verificationQueueQuerySchema>;
export type UpdateOrganizationSettingsInput = z.infer<typeof updateOrganizationSettingsSchema>;
