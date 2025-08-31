import { z } from 'zod';
import { ExperienceType, AchievementLevel, VerificationStatus } from '@prisma/client';

/**
 * Dashboard analytics query schema
 */
export const dashboardAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  
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
  
  timezone: z
    .string()
    .max(50, 'Timezone must be less than 50 characters')
    .optional(),
  
  includeComparison: z.boolean().default(false),
  
  comparisonPeriod: z.enum(['previous', 'year_ago']).optional(),
});

/**
 * Experience analytics query schema
 */
export const experienceAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  
  metrics: z
    .array(z.enum([
      'total_experiences',
      'verified_experiences',
      'pending_experiences',
      'rejected_experiences',
      'experiences_by_type',
      'experiences_by_level',
      'experiences_by_organization',
      'experiences_by_student',
      'verification_time',
      'popular_skills',
      'trending_experiences'
    ]))
    .optional(),
  
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  
  filters: z.object({
    types: z.array(z.nativeEnum(ExperienceType)).optional(),
    levels: z.array(z.nativeEnum(AchievementLevel)).optional(),
    statuses: z.array(z.nativeEnum(VerificationStatus)).optional(),
    organizationIds: z.array(z.string()).optional(),
    studentIds: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    location: z.string().optional(),
  }).optional(),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
  
  timezone: z.string().optional(),
});

/**
 * Student analytics query schema
 */
export const studentAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  
  metrics: z
    .array(z.enum([
      'total_students',
      'active_students',
      'new_registrations',
      'students_by_organization',
      'students_by_location',
      'portfolio_completion',
      'skill_distribution',
      'experience_completion',
      'verification_rates',
      'engagement_metrics'
    ]))
    .optional(),
  
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  
  filters: z.object({
    organizationIds: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    skillCategories: z.array(z.string()).optional(),
    registrationSource: z.string().optional(),
    isPublic: z.boolean().optional(),
    hasPortfolio: z.boolean().optional(),
  }).optional(),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
  
  segmentation: z.enum(['none', 'by_cohort', 'by_skills', 'by_location']).optional(),
});

/**
 * Portfolio analytics query schema
 */
export const portfolioAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  
  metrics: z
    .array(z.enum([
      'total_views',
      'unique_visitors',
      'bounce_rate',
      'time_on_page',
      'popular_portfolios',
      'portfolio_completion_rate',
      'experience_click_rate',
      'contact_conversion_rate',
      'download_rate',
      'share_rate'
    ]))
    .optional(),
  
  groupBy: z.enum(['day', 'week', 'month']).optional(),
  
  portfolioIds: z.array(z.string()).optional(),
  
  studentIds: z.array(z.string()).optional(),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
  
  includeGeography: z.boolean().default(false),
  
  includeReferrers: z.boolean().default(false),
  
  includeDeviceInfo: z.boolean().default(false),
});

/**
 * Organization analytics query schema
 */
export const organizationAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  
  metrics: z
    .array(z.enum([
      'total_organizations',
      'active_organizations',
      'verified_organizations',
      'organizations_by_type',
      'organizations_by_industry',
      'student_engagement',
      'experience_creation_rate',
      'verification_efficiency',
      'growth_metrics'
    ]))
    .optional(),
  
  groupBy: z.enum(['day', 'week', 'month', 'quarter']).optional(),
  
  organizationIds: z.array(z.string()).optional(),
  
  filters: z.object({
    organizationTypes: z.array(z.string()).optional(),
    industries: z.array(z.string()).optional(),
    verified: z.boolean().optional(),
    active: z.boolean().optional(),
    minStudents: z.number().optional(),
    maxStudents: z.number().optional(),
  }).optional(),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
});

/**
 * System analytics query schema
 */
export const systemAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  
  metrics: z
    .array(z.enum([
      'total_users',
      'active_users',
      'user_registrations',
      'user_logins',
      'api_requests',
      'file_uploads',
      'storage_usage',
      'bandwidth_usage',
      'error_rates',
      'response_times',
      'feature_usage'
    ]))
    .optional(),
  
  groupBy: z.enum(['hour', 'day', 'week', 'month']).optional(),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
  
  includeComparison: z.boolean().default(false),
});

/**
 * Export analytics schema
 */
export const exportAnalyticsSchema = z.object({
  reportType: z.enum([
    'dashboard',
    'experiences',
    'students',
    'portfolios',
    'organizations',
    'system',
    'custom'
  ]),
  
  format: z.enum(['csv', 'xlsx', 'pdf', 'json']).default('csv'),
  
  period: z.enum(['7d', '30d', '90d', '1y', 'all', 'custom']).default('30d'),
  
  startDate: z.string().optional(),
  
  endDate: z.string().optional(),
  
  metrics: z.array(z.string()).optional(),
  
  filters: z.record(z.any()).optional(),
  
  groupBy: z.string().optional(),
  
  includeCharts: z.boolean().default(false),
  
  includeRawData: z.boolean().default(false),
  
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  
  schedule: z.object({
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly']).default('once'),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  }).optional(),
});

/**
 * Custom analytics query schema
 */
export const customAnalyticsQuerySchema = z.object({
  name: z
    .string()
    .min(1, 'Query name is required')
    .max(100, 'Query name must be less than 100 characters'),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  query: z.object({
    entity: z.enum(['users', 'students', 'organizations', 'experiences', 'portfolios', 'documents']),
    
    metrics: z.array(z.object({
      field: z.string(),
      aggregation: z.enum(['count', 'sum', 'avg', 'min', 'max', 'distinct']),
      alias: z.string().optional(),
    })),
    
    filters: z.array(z.object({
      field: z.string(),
      operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'startsWith', 'endsWith']),
      value: z.any(),
      logicalOperator: z.enum(['AND', 'OR']).optional(),
    })).optional(),
    
    groupBy: z.array(z.string()).optional(),
    
    orderBy: z.array(z.object({
      field: z.string(),
      direction: z.enum(['asc', 'desc']).default('desc'),
    })).optional(),
    
    limit: z.number().min(1).max(10000).optional(),
  }),
  
  visualization: z.object({
    type: z.enum(['table', 'line', 'bar', 'pie', 'doughnut', 'area', 'scatter']),
    xAxis: z.string().optional(),
    yAxis: z.string().optional(),
    colorBy: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
  }).optional(),
  
  schedule: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    recipients: z.array(z.string().email()).optional(),
  }).optional(),
  
  isPublic: z.boolean().default(false),
  
  tags: z.array(z.string()).max(10).optional(),
});

/**
 * Real-time analytics schema
 */
export const realtimeAnalyticsQuerySchema = z.object({
  metrics: z
    .array(z.enum([
      'active_users',
      'concurrent_sessions',
      'api_requests_per_minute',
      'new_registrations',
      'recent_experiences',
      'recent_verifications',
      'system_health'
    ]))
    .min(1, 'At least one metric is required'),
  
  interval: z.enum(['1m', '5m', '15m', '30m', '1h']).default('5m'),
  
  duration: z.enum(['1h', '6h', '12h', '24h']).default('1h'),
  
  autoRefresh: z.boolean().default(true),
  
  refreshInterval: z.number().min(30).max(300).default(60), // seconds
});

/**
 * Analytics dashboard configuration schema
 */
export const dashboardConfigSchema = z.object({
  name: z
    .string()
    .min(1, 'Dashboard name is required')
    .max(100, 'Dashboard name must be less than 100 characters'),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  layout: z.object({
    columns: z.number().min(1).max(12).default(12),
    
    widgets: z.array(z.object({
      id: z.string(),
      type: z.enum(['metric', 'chart', 'table', 'text', 'iframe']),
      title: z.string(),
      span: z.number().min(1).max(12).default(6),
      height: z.number().min(200).max(800).default(300),
      position: z.object({
        x: z.number().min(0),
        y: z.number().min(0),
      }),
      config: z.record(z.any()),
      dataSource: z.string(),
      refreshInterval: z.number().optional(),
    })),
  }),
  
  filters: z.array(z.object({
    field: z.string(),
    type: z.enum(['select', 'multiselect', 'date', 'daterange', 'number', 'text']),
    label: z.string(),
    defaultValue: z.any().optional(),
    options: z.array(z.any()).optional(),
  })).optional(),
  
  permissions: z.object({
    isPublic: z.boolean().default(false),
    allowedRoles: z.array(z.string()).optional(),
    allowedUsers: z.array(z.string()).optional(),
  }).optional(),
  
  settings: z.object({
    autoRefresh: z.boolean().default(false),
    refreshInterval: z.number().optional(),
    timezone: z.string().optional(),
  }).optional(),
});

// Export types
export type DashboardAnalyticsQuery = z.infer<typeof dashboardAnalyticsQuerySchema>;
export type ExperienceAnalyticsQuery = z.infer<typeof experienceAnalyticsQuerySchema>;
export type StudentAnalyticsQuery = z.infer<typeof studentAnalyticsQuerySchema>;
export type PortfolioAnalyticsQuery = z.infer<typeof portfolioAnalyticsQuerySchema>;
export type OrganizationAnalyticsQuery = z.infer<typeof organizationAnalyticsQuerySchema>;
export type SystemAnalyticsQuery = z.infer<typeof systemAnalyticsQuerySchema>;
export type ExportAnalyticsInput = z.infer<typeof exportAnalyticsSchema>;
export type CustomAnalyticsQuery = z.infer<typeof customAnalyticsQuerySchema>;
export type RealtimeAnalyticsQuery = z.infer<typeof realtimeAnalyticsQuerySchema>;
export type DashboardConfig = z.infer<typeof dashboardConfigSchema>;
