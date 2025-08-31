import { z } from 'zod';
import { phoneSchema, urlSchema, addressSchema } from './common';

/**
 * Update user profile schema
 */
export const updateUserProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must be less than 255 characters')
    .optional(),
  
  bio: z
    .string()
    .max(1000, 'Bio must be less than 1000 characters')
    .optional(),
  
  phone: phoneSchema,
  
  address: z.string().max(500, 'Address must be less than 500 characters').optional(),
  
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  
  state: z.string().max(100, 'State must be less than 100 characters').optional(),
  
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  
  postalCode: z
    .string()
    .regex(/^[\w\s-]{3,10}$/, 'Invalid postal code format')
    .optional(),
  
  avatar: urlSchema,
  
  linkedinUrl: urlSchema,
  
  githubUrl: urlSchema,
  
  portfolioUrl: urlSchema,
  
  resumeUrl: urlSchema,
  
  dateOfBirth: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((val) => !val || !isNaN(val.getTime()), 'Invalid date of birth'),
  
  isPublic: z.boolean().optional(),
});

/**
 * Delete user account schema
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required for account deletion'),
  
  confirmEmail: z.string().email('Invalid email address'),
  
  reason: z.string().optional(),
}).refine(
  (data) => data.confirmEmail,
  {
    message: 'Email confirmation is required',
    path: ['confirmEmail'],
  }
);

/**
 * Update notification settings schema
 */
export const updateNotificationSettingsSchema = z.object({
  email: z.boolean().default(true),
  
  push: z.boolean().default(true),
  
  sms: z.boolean().default(false),
  
  categories: z.object({
    verification: z.boolean().default(true),
    invitations: z.boolean().default(true),
    experiences: z.boolean().default(true),
    messages: z.boolean().default(true),
    marketing: z.boolean().default(false),
  }).optional(),
});

/**
 * Update privacy settings schema
 */
export const updatePrivacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'connections']).default('public'),
  
  experienceVisibility: z.enum(['public', 'private', 'connections']).default('public'),
  
  contactInfoVisibility: z.enum(['public', 'private', 'connections']).default('connections'),
  
  allowDirectMessages: z.boolean().default(true),
  
  allowEmailContact: z.boolean().default(true),
  
  showOnlineStatus: z.boolean().default(true),
});

/**
 * Get notifications query schema
 */
export const getNotificationsQuerySchema = z.object({
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
  
  type: z.string().optional(),
  
  category: z.string().optional(),
  
  isRead: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
});

/**
 * Mark notification as read schema
 */
export const markNotificationReadSchema = z.object({
  notificationIds: z
    .array(z.string().min(1, 'Notification ID is required'))
    .min(1, 'At least one notification ID is required')
    .max(100, 'Maximum 100 notifications can be marked at once'),
});

/**
 * User search query schema
 */
export const userSearchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(255, 'Search query must be less than 255 characters'),
  
  role: z.enum(['STUDENT', 'ORGANIZATION', 'ADMIN']).optional(),
  
  verified: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  active: z
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
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  
  sortBy: z.enum(['name', 'email', 'createdAt', 'lastLogin']).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Export data schema
 */
export const exportDataSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  
  includePersonalData: z.boolean().default(true),
  
  includeExperiences: z.boolean().default(true),
  
  includeDocuments: z.boolean().default(false),
  
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
});

/**
 * Block/unblock user schema
 */
export const blockUserSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be less than 500 characters'),
  
  duration: z.enum(['24h', '7d', '30d', 'permanent']).default('permanent'),
});

/**
 * Report user schema
 */
export const reportUserSchema = z.object({
  reason: z.enum([
    'inappropriate_content',
    'harassment',
    'spam',
    'fake_profile',
    'copyright_violation',
    'other'
  ]),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  
  evidence: z.array(z.string().url()).optional(),
});

// Export types
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type UpdateNotificationSettingsInput = z.infer<typeof updateNotificationSettingsSchema>;
export type UpdatePrivacySettingsInput = z.infer<typeof updatePrivacySettingsSchema>;
export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;
export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;
export type UserSearchQuery = z.infer<typeof userSearchQuerySchema>;
export type ExportDataInput = z.infer<typeof exportDataSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;
export type ReportUserInput = z.infer<typeof reportUserSchema>;
