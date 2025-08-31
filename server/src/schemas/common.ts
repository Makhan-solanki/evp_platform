import { z } from 'zod';

/**
 * Common ID parameter schema
 */
export const idParamSchema = z.object({
  id: z
    .string()
    .min(1, 'ID is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid ID format'),
});

/**
 * Pagination query schema
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Page must be greater than 0'),
  
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  
  search: z.string().optional(),
  
  sortBy: z.string().optional(),
  
  sortOrder: z
    .string()
    .optional()
    .transform((val) => val?.toLowerCase())
    .refine((val) => !val || ['asc', 'desc'].includes(val), 'Sort order must be "asc" or "desc"'),
});

/**
 * Date range filter schema
 */
export const dateRangeSchema = z.object({
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
 * File upload schema
 */
export const fileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  buffer: z.instanceof(Buffer).optional(),
  destination: z.string().optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
});

/**
 * Email schema
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters');

/**
 * URL schema
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .optional()
  .or(z.literal(''));

/**
 * Phone number schema
 */
export const phoneSchema = z
  .string()
  .regex(
    /^[\+]?[1-9][\d]{0,15}$/,
    'Invalid phone number format'
  )
  .optional()
  .or(z.literal(''));

/**
 * Color hex schema
 */
export const colorHexSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format')
  .optional();

/**
 * Slug schema
 */
export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be less than 50 characters')
  .regex(
    /^[a-z0-9-]+$/,
    'Slug can only contain lowercase letters, numbers, and hyphens'
  );

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(255, 'Search query must be less than 255 characters'),
  
  type: z.string().optional(),
  
  category: z.string().optional(),
  
  tags: z
    .string()
    .optional()
    .transform((val) => val ? val.split(',').map(tag => tag.trim()) : []),
  
  ...paginationSchema.shape,
});

/**
 * Bulk operation schema
 */
export const bulkOperationSchema = z.object({
  ids: z
    .array(z.string().min(1, 'ID is required'))
    .min(1, 'At least one ID is required')
    .max(100, 'Maximum 100 items allowed'),
  
  operation: z.enum(['delete', 'activate', 'deactivate', 'verify', 'reject']),
  
  note: z.string().optional(),
});

/**
 * CSV upload schema
 */
export const csvUploadSchema = z.object({
  mapping: z.record(
    z.string(),
    z.string().min(1, 'Column mapping is required')
  ),
  
  hasHeader: z.boolean().default(true),
  
  delimiter: z.string().default(','),
});

/**
 * Filter schema
 */
export const filterSchema = z.object({
  field: z.string().min(1, 'Filter field is required'),
  
  operator: z.enum([
    'eq', // equals
    'ne', // not equals
    'gt', // greater than
    'gte', // greater than or equal
    'lt', // less than
    'lte', // less than or equal
    'in', // in array
    'nin', // not in array
    'contains', // string contains
    'startsWith', // string starts with
    'endsWith', // string ends with
    'between', // between two values
  ]),
  
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number()])),
  ]),
});

/**
 * Sort schema
 */
export const sortSchema = z.object({
  field: z.string().min(1, 'Sort field is required'),
  
  direction: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Geolocation schema
 */
export const geolocationSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  
  accuracy: z.number().optional(),
});

/**
 * Address schema
 */
export const addressSchema = z.object({
  street: z.string().optional(),
  
  city: z.string().optional(),
  
  state: z.string().optional(),
  
  country: z.string().optional(),
  
  postalCode: z
    .string()
    .regex(/^[\w\s-]{3,10}$/, 'Invalid postal code format')
    .optional(),
  
  geolocation: geolocationSchema.optional(),
});

/**
 * Social media link schema
 */
export const socialLinkSchema = z.object({
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
  
  username: z.string().optional(),
});

/**
 * Notification settings schema
 */
export const notificationSettingsSchema = z.object({
  email: z.boolean().default(true),
  
  push: z.boolean().default(true),
  
  sms: z.boolean().default(false),
  
  categories: z.object({
    verification: z.boolean().default(true),
    invitations: z.boolean().default(true),
    experiences: z.boolean().default(true),
    messages: z.boolean().default(true),
    marketing: z.boolean().default(false),
  }),
});

/**
 * Privacy settings schema
 */
export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'connections']).default('public'),
  
  experienceVisibility: z.enum(['public', 'private', 'connections']).default('public'),
  
  contactInfoVisibility: z.enum(['public', 'private', 'connections']).default('connections'),
  
  allowDirectMessages: z.boolean().default(true),
  
  allowEmailContact: z.boolean().default(true),
  
  showOnlineStatus: z.boolean().default(true),
});

/**
 * Export types
 */
export type IdParam = z.infer<typeof idParamSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type BulkOperation = z.infer<typeof bulkOperationSchema>;
export type CsvUpload = z.infer<typeof csvUploadSchema>;
export type Filter = z.infer<typeof filterSchema>;
export type Sort = z.infer<typeof sortSchema>;
export type Geolocation = z.infer<typeof geolocationSchema>;
export type Address = z.infer<typeof addressSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type PrivacySettings = z.infer<typeof privacySettingsSchema>;
