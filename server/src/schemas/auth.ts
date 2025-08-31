import { z } from 'zod';
import { Role } from '@prisma/client';

/**
 * User registration schema (for traditional email/password)
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  
  role: z.enum(['ORGANIZATION', 'STUDENT'] as const),
  
  // Organization specific fields
  organizationName: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(255, 'Organization name must be less than 255 characters')
    .optional(),
  
  organizationDescription: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  // Student specific fields
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must be less than 255 characters')
    .optional(),
  
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
}).refine(
  (data) => {
    // If role is ORGANIZATION, organizationName is required
    if (data.role === 'ORGANIZATION') {
      return !!data.organizationName;
    }
    // If role is STUDENT, fullName is required
    if (data.role === 'STUDENT') {
      return !!data.fullName;
    }
    return true;
  },
  {
    message: 'Organization name is required for organizations, full name is required for students',
    path: ['organizationName', 'fullName'],
  }
);



/**
 * User login schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  
  password: z
    .string()
    .min(1, 'Password is required'),
  
  rememberMe: z.boolean().optional(),
});





/**
 * Update user role schema (admin only)
 */
export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});







// Export types derived from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;


export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;


