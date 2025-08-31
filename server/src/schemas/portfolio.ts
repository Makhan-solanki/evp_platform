import { z } from 'zod';
import { urlSchema, socialLinkSchema } from './common';

/**
 * Update portfolio schema
 */
export const updatePortfolioSchema = z.object({
  bio: z
    .string()
    .max(2000, 'Bio must be less than 2000 characters')
    .optional(),
  
  headline: z
    .string()
    .max(200, 'Headline must be less than 200 characters')
    .optional(),
  
  summary: z
    .string()
    .max(1000, 'Summary must be less than 1000 characters')
    .optional(),
  
  isPublic: z.boolean().optional(),
  
  theme: z
    .string()
    .max(50, 'Theme must be less than 50 characters')
    .optional(),
  
  customDomain: z
    .string()
    .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/, 'Invalid domain format')
    .optional(),
  
  seoTitle: z
    .string()
    .max(60, 'SEO title must be less than 60 characters')
    .optional(),
  
  seoDescription: z
    .string()
    .max(160, 'SEO description must be less than 160 characters')
    .optional(),
  
  seoKeywords: z
    .array(z.string().max(50))
    .max(10, 'Maximum 10 SEO keywords')
    .optional(),
  
  socialLinks: z
    .array(socialLinkSchema)
    .max(10, 'Maximum 10 social links')
    .optional(),
  
  settings: z.record(z.any()).optional(),
  
  metadata: z.record(z.any()).optional(),
});

/**
 * Portfolio section schema
 */
export const portfolioSectionSchema = z.object({
  type: z.enum([
    'about',
    'experience',
    'education',
    'skills',
    'projects',
    'achievements',
    'testimonials',
    'contact',
    'custom'
  ]),
  
  title: z
    .string()
    .min(1, 'Section title is required')
    .max(100, 'Section title must be less than 100 characters'),
  
  content: z.record(z.any()),
  
  isVisible: z.boolean().default(true),
  
  order: z.number().int().min(0).default(0),
  
  settings: z.record(z.any()).optional(),
});

/**
 * Add portfolio section schema
 */
export const addPortfolioSectionSchema = portfolioSectionSchema;

/**
 * Update portfolio section schema
 */
export const updatePortfolioSectionSchema = portfolioSectionSchema.partial();

/**
 * Reorder portfolio sections schema
 */
export const reorderPortfolioSectionsSchema = z.object({
  sections: z
    .array(z.object({
      id: z.string().min(1, 'Section ID is required'),
      order: z.number().int().min(0),
    }))
    .min(1, 'At least one section is required'),
});

/**
 * Portfolio experience schema
 */
export const portfolioExperienceSchema = z.object({
  experienceId: z.string().min(1, 'Experience ID is required'),
  
  isHighlighted: z.boolean().default(false),
  
  customTitle: z
    .string()
    .max(200, 'Custom title must be less than 200 characters')
    .optional(),
  
  customDescription: z
    .string()
    .max(1000, 'Custom description must be less than 1000 characters')
    .optional(),
  
  displayOrder: z.number().int().min(0).default(0),
  
  isVisible: z.boolean().default(true),
  
  settings: z.record(z.any()).optional(),
});

/**
 * Add portfolio experience schema
 */
export const addPortfolioExperienceSchema = portfolioExperienceSchema;

/**
 * Update portfolio experience schema
 */
export const updatePortfolioExperienceSchema = portfolioExperienceSchema.partial();

/**
 * Bulk update portfolio experiences schema
 */
export const bulkUpdatePortfolioExperiencesSchema = z.object({
  experiences: z
    .array(z.object({
      id: z.string().min(1, 'Experience ID is required'),
      isHighlighted: z.boolean().optional(),
      isVisible: z.boolean().optional(),
      displayOrder: z.number().int().min(0).optional(),
    }))
    .min(1, 'At least one experience is required')
    .max(50, 'Maximum 50 experiences can be updated at once'),
});

/**
 * Portfolio theme schema
 */
export const portfolioThemeSchema = z.object({
  name: z
    .string()
    .min(1, 'Theme name is required')
    .max(50, 'Theme name must be less than 50 characters'),
  
  colors: z.object({
    primary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
    secondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
    accent: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
    background: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
    text: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
  }),
  
  fonts: z.object({
    heading: z.string().max(50),
    body: z.string().max(50),
    accent: z.string().max(50).optional(),
  }),
  
  layout: z.object({
    headerStyle: z.enum(['minimal', 'centered', 'split', 'sidebar']),
    navigationStyle: z.enum(['horizontal', 'vertical', 'hamburger']),
    footerStyle: z.enum(['minimal', 'detailed', 'none']),
    spacing: z.enum(['compact', 'normal', 'spacious']),
  }),
  
  components: z.record(z.any()).optional(),
});

/**
 * Get public portfolio query schema
 */
export const getPublicPortfolioQuerySchema = z.object({
  slug: z
    .string()
    .min(3, 'Portfolio slug must be at least 3 characters')
    .max(50, 'Portfolio slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Portfolio slug can only contain lowercase letters, numbers, and hyphens'),
  
  trackView: z.boolean().default(true),
  
  ref: z
    .string()
    .max(100, 'Referrer must be less than 100 characters')
    .optional(),
});

/**
 * Portfolio search query schema
 */
export const portfolioSearchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(255, 'Search query must be less than 255 characters'),
  
  skills: z
    .string()
    .optional()
    .transform((val) => val ? val.split(',').map(skill => skill.trim()) : []),
  
  experienceTypes: z
    .string()
    .optional()
    .transform((val) => val ? val.split(',') : []),
  
  levels: z
    .string()
    .optional()
    .transform((val) => val ? val.split(',') : []),
  
  location: z.string().optional(),
  
  organizations: z
    .string()
    .optional()
    .transform((val) => val ? val.split(',') : []),
  
  verified: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  hasExperiences: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  theme: z.string().optional(),
  
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 12)),
  
  sortBy: z.enum(['name', 'updated', 'views', 'experiences', 'skills']).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Portfolio analytics query schema
 */
export const portfolioAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  
  metrics: z
    .array(z.enum([
      'views',
      'unique_visitors',
      'bounce_rate',
      'time_on_page',
      'popular_sections',
      'referrers',
      'countries',
      'devices',
      'browsers'
    ]))
    .optional(),
  
  groupBy: z.enum(['day', 'week', 'month']).optional(),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
});

/**
 * Portfolio PDF generation schema
 */
export const generatePortfolioPDFSchema = z.object({
  includeExperiences: z.boolean().default(true),
  
  includeSkills: z.boolean().default(true),
  
  includeContact: z.boolean().default(false),
  
  template: z.enum(['modern', 'classic', 'minimal', 'creative']).default('modern'),
  
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  
  paperSize: z.enum(['A4', 'letter', 'legal']).default('A4'),
  
  sections: z
    .array(z.string())
    .max(20, 'Maximum 20 sections can be included')
    .optional(),
  
  watermark: z
    .string()
    .max(100, 'Watermark text must be less than 100 characters')
    .optional(),
  
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional(),
});

/**
 * Portfolio sharing schema
 */
export const sharePortfolioSchema = z.object({
  method: z.enum(['email', 'link', 'social', 'qr']),
  
  emails: z
    .array(z.string().email('Invalid email address'))
    .max(10, 'Maximum 10 emails allowed')
    .optional(),
  
  message: z
    .string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
  
  platform: z.enum(['linkedin', 'twitter', 'facebook', 'whatsapp']).optional(),
  
  trackClicks: z.boolean().default(true),
  
  expiresAt: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((val) => !val || val > new Date(), 'Expiry date must be in the future'),
});

/**
 * Portfolio template schema
 */
export const portfolioTemplateSchema = z.object({
  name: z
    .string()
    .min(1, 'Template name is required')
    .max(100, 'Template name must be less than 100 characters'),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  category: z
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional(),
  
  preview: urlSchema,
  
  thumbnail: urlSchema,
  
  structure: z.object({
    sections: z.array(portfolioSectionSchema),
    theme: portfolioThemeSchema,
    settings: z.record(z.any()).optional(),
  }),
  
  isPublic: z.boolean().default(false),
  
  isPremium: z.boolean().default(false),
  
  tags: z
    .array(z.string().max(30))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

/**
 * Portfolio backup schema
 */
export const portfolioBackupSchema = z.object({
  includeAnalytics: z.boolean().default(false),
  
  includeSettings: z.boolean().default(true),
  
  format: z.enum(['json', 'zip']).default('json'),
  
  compress: z.boolean().default(false),
});

/**
 * Portfolio restore schema
 */
export const portfolioRestoreSchema = z.object({
  backupData: z.record(z.any()),
  
  overwriteExisting: z.boolean().default(false),
  
  preserveAnalytics: z.boolean().default(true),
  
  preserveCustomizations: z.boolean().default(true),
});

// Export types
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
export type PortfolioSectionInput = z.infer<typeof portfolioSectionSchema>;
export type AddPortfolioSectionInput = z.infer<typeof addPortfolioSectionSchema>;
export type UpdatePortfolioSectionInput = z.infer<typeof updatePortfolioSectionSchema>;
export type ReorderPortfolioSectionsInput = z.infer<typeof reorderPortfolioSectionsSchema>;
export type PortfolioExperienceInput = z.infer<typeof portfolioExperienceSchema>;
export type AddPortfolioExperienceInput = z.infer<typeof addPortfolioExperienceSchema>;
export type UpdatePortfolioExperienceInput = z.infer<typeof updatePortfolioExperienceSchema>;
export type BulkUpdatePortfolioExperiencesInput = z.infer<typeof bulkUpdatePortfolioExperiencesSchema>;
export type PortfolioThemeInput = z.infer<typeof portfolioThemeSchema>;
export type GetPublicPortfolioQuery = z.infer<typeof getPublicPortfolioQuerySchema>;
export type PortfolioSearchQuery = z.infer<typeof portfolioSearchQuerySchema>;
export type PortfolioAnalyticsQuery = z.infer<typeof portfolioAnalyticsQuerySchema>;
export type GeneratePortfolioPDFInput = z.infer<typeof generatePortfolioPDFSchema>;
export type SharePortfolioInput = z.infer<typeof sharePortfolioSchema>;
export type PortfolioTemplateInput = z.infer<typeof portfolioTemplateSchema>;
export type PortfolioBackupInput = z.infer<typeof portfolioBackupSchema>;
export type PortfolioRestoreInput = z.infer<typeof portfolioRestoreSchema>;
