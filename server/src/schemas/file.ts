import { z } from 'zod';
import { DocumentType } from '@prisma/client';
import { urlSchema } from './common';

/**
 * File upload schema
 */
export const uploadFileSchema = z.object({
  file: z.any(), // File object from multer
  
  type: z.nativeEnum(DocumentType),
  
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  category: z
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional(),
  
  tags: z
    .array(z.string().max(30))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  
  isPublic: z.boolean().default(false),
  
  experienceId: z.string().optional(),
  
  portfolioId: z.string().optional(),
  
  metadata: z.record(z.any()).optional(),
});

/**
 * Bulk file upload schema
 */
export const bulkUploadFilesSchema = z.object({
  files: z.array(z.any()).min(1, 'At least one file is required').max(10, 'Maximum 10 files allowed'),
  
  type: z.nativeEnum(DocumentType),
  
  category: z
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional(),
  
  defaultTitle: z
    .string()
    .max(200, 'Default title must be less than 200 characters')
    .optional(),
  
  defaultDescription: z
    .string()
    .max(1000, 'Default description must be less than 1000 characters')
    .optional(),
  
  defaultTags: z
    .array(z.string().max(30))
    .max(10, 'Maximum 10 default tags allowed')
    .optional(),
  
  isPublic: z.boolean().default(false),
  
  experienceId: z.string().optional(),
  
  portfolioId: z.string().optional(),
});

/**
 * Update file schema
 */
export const updateFileSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  category: z
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional(),
  
  tags: z
    .array(z.string().max(30))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  
  isPublic: z.boolean().optional(),
  
  metadata: z.record(z.any()).optional(),
});

/**
 * Get files query schema
 */
export const getFilesQuerySchema = z.object({
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
    .refine((val) => val.every(v => Object.values(DocumentType).includes(v as DocumentType)), 'Invalid document type'),
  
  category: z.string().optional(),
  
  tags: z
    .string()
    .optional()
    .transform((val) => val ? val.split(',').map(tag => tag.trim()) : []),
  
  isPublic: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  experienceId: z.string().optional(),
  
  portfolioId: z.string().optional(),
  
  studentId: z.string().optional(),
  
  organizationId: z.string().optional(),
  
  uploadedAfter: z.string().optional(),
  
  uploadedBefore: z.string().optional(),
  
  minSize: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined),
  
  maxSize: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined),
  
  sortBy: z.enum([
    'title',
    'uploadedAt',
    'size',
    'type',
    'category'
  ]).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * File sharing schema
 */
export const shareFileSchema = z.object({
  shareWith: z.enum(['public', 'organization', 'specific']),
  
  userIds: z
    .array(z.string().min(1))
    .max(50, 'Maximum 50 users can be shared with')
    .optional(),
  
  expiresAt: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((val) => !val || val > new Date(), 'Expiry date must be in the future'),
  
  allowDownload: z.boolean().default(true),
  
  allowCopy: z.boolean().default(false),
  
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional(),
  
  message: z
    .string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
});

/**
 * File compression schema
 */
export const compressFileSchema = z.object({
  quality: z
    .number()
    .min(10, 'Quality must be at least 10')
    .max(100, 'Quality must be at most 100')
    .default(80),
  
  format: z.enum(['jpeg', 'png', 'webp']).optional(),
  
  maxWidth: z
    .number()
    .min(100, 'Max width must be at least 100px')
    .max(4000, 'Max width must be at most 4000px')
    .optional(),
  
  maxHeight: z
    .number()
    .min(100, 'Max height must be at least 100px')
    .max(4000, 'Max height must be at most 4000px')
    .optional(),
  
  preserveMetadata: z.boolean().default(false),
});

/**
 * File conversion schema
 */
export const convertFileSchema = z.object({
  targetFormat: z.enum(['pdf', 'docx', 'txt', 'jpeg', 'png', 'webp']),
  
  options: z.object({
    quality: z.number().min(10).max(100).optional(),
    includeMetadata: z.boolean().default(false),
    password: z.string().optional(),
    watermark: z.string().optional(),
  }).optional(),
});

/**
 * File analytics schema
 */
export const fileAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  
  metrics: z
    .array(z.enum([
      'uploads',
      'downloads',
      'views',
      'storage_used',
      'by_type',
      'by_category',
      'popular_files'
    ]))
    .optional(),
  
  groupBy: z.enum(['day', 'week', 'month']).optional(),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
  
  fileIds: z.array(z.string()).optional(),
});

/**
 * File backup schema
 */
export const backupFilesSchema = z.object({
  fileIds: z
    .array(z.string().min(1))
    .min(1, 'At least one file ID is required')
    .max(100, 'Maximum 100 files can be backed up at once'),
  
  destination: z.enum(['cloud', 'local', 'external']).default('cloud'),
  
  includeMetadata: z.boolean().default(true),
  
  compression: z.enum(['none', 'zip', 'gzip']).default('zip'),
  
  encryption: z.boolean().default(false),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional(),
  
  schedule: z.object({
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly']).default('once'),
    time: z.string().optional(),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
  }).optional(),
});

/**
 * File versioning schema
 */
export const createFileVersionSchema = z.object({
  versionNote: z
    .string()
    .max(500, 'Version note must be less than 500 characters')
    .optional(),
  
  isMinor: z.boolean().default(false),
  
  preservePrevious: z.boolean().default(true),
  
  file: z.any(), // New file version
});

/**
 * Restore file version schema
 */
export const restoreFileVersionSchema = z.object({
  versionId: z.string().min(1, 'Version ID is required'),
  
  createBackup: z.boolean().default(true),
  
  note: z
    .string()
    .max(500, 'Note must be less than 500 characters')
    .optional(),
});

// Export types
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type BulkUploadFilesInput = z.infer<typeof bulkUploadFilesSchema>;
export type UpdateFileInput = z.infer<typeof updateFileSchema>;
export type GetFilesQuery = z.infer<typeof getFilesQuerySchema>;
export type ShareFileInput = z.infer<typeof shareFileSchema>;
export type CompressFileInput = z.infer<typeof compressFileSchema>;
export type ConvertFileInput = z.infer<typeof convertFileSchema>;
export type FileAnalyticsQuery = z.infer<typeof fileAnalyticsQuerySchema>;
export type BackupFilesInput = z.infer<typeof backupFilesSchema>;
export type CreateFileVersionInput = z.infer<typeof createFileVersionSchema>;
export type RestoreFileVersionInput = z.infer<typeof restoreFileVersionSchema>;
