import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

export const phoneSchema = z
  .string()
  .optional()
  .refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), {
    message: 'Please enter a valid phone number',
  });

export const urlSchema = z
  .string()
  .optional()
  .refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL',
  });

// Form validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    fullName: nameSchema,
    role: z.enum(['STUDENT', 'ORGANIZATION']),
    organizationName: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.role === 'ORGANIZATION') {
        return data.organizationName && data.organizationName.length >= 2;
      }
      return true;
    },
    {
      message: 'Organization name is required',
      path: ['organizationName'],
    }
  );

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const updateProfileSchema = z.object({
  fullName: nameSchema.optional(),
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: phoneSchema,
  address: z.string().max(100, 'Address must be less than 100 characters').optional(),
  city: z.string().max(50, 'City must be less than 50 characters').optional(),
  state: z.string().max(50, 'State must be less than 50 characters').optional(),
  country: z.string().max(50, 'Country must be less than 50 characters').optional(),
  postalCode: z.string().max(20, 'Postal code must be less than 20 characters').optional(),
  linkedinUrl: urlSchema,
  githubUrl: urlSchema,
  portfolioUrl: urlSchema,
  isPublic: z.boolean().optional(),
});

export const experienceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  shortDescription: z.string().max(200, 'Short description must be less than 200 characters').optional(),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date().optional(),
  isOngoing: z.boolean(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  type: z.enum(['INTERNSHIP', 'PROJECT', 'COURSE', 'CERTIFICATION', 'COMPETITION', 'VOLUNTEER', 'RESEARCH', 'WORK', 'ACHIEVEMENT', 'OTHER']),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  technologies: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  hoursDedicated: z.number().min(1, 'Hours must be at least 1').max(10000, 'Hours must be less than 10000').optional(),
  certificateUrl: urlSchema,
  projectUrl: urlSchema,
  githubUrl: urlSchema,
  isHighlighted: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export const skillSchema = z.object({
  name: z.string().min(2, 'Skill name must be at least 2 characters').max(50, 'Skill name must be less than 50 characters'),
  level: z.number().min(1, 'Level must be between 1 and 5').max(5, 'Level must be between 1 and 5'),
  category: z.string().max(50, 'Category must be less than 50 characters').optional(),
  yearsOfExperience: z.number().min(0, 'Years of experience cannot be negative').max(50, 'Years of experience must be less than 50').optional(),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(2, 'Platform name is required'),
  url: z.string().url('Please enter a valid URL'),
  username: z.string().optional(),
});

export const portfolioSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  headline: z.string().max(100, 'Headline must be less than 100 characters').optional(),
  summary: z.string().max(1000, 'Summary must be less than 1000 characters').optional(),
  isPublic: z.boolean(),
  theme: z.string().optional(),
  customDomain: z.string().optional(),
  seoTitle: z.string().max(60, 'SEO title must be less than 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must be less than 160 characters').optional(),
  seoKeywords: z.array(z.string()).optional(),
});

// Utility functions
export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

export const validateUrl = (url: string): boolean => {
  return z.string().url().safeParse(url).success;
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 8) return 'weak';
  
  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  
  if (score < 3) return 'weak';
  if (score < 5) return 'medium';
  return 'strong';
};

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ExperienceFormData = z.infer<typeof experienceSchema>;
export type SkillFormData = z.infer<typeof skillSchema>;
export type SocialLinkFormData = z.infer<typeof socialLinkSchema>;
export type PortfolioFormData = z.infer<typeof portfolioSchema>;
