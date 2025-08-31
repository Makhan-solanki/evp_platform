import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../config/logger';

/**
 * Middleware to validate request body using Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.reduce((acc, curr) => {
          const path = curr.path.join('.');
          acc[path] = curr.message;
          return acc;
        }, {} as Record<string, string>);

        logger.warn('Request body validation failed', {
          errors: errorMessages,
          body: req.body,
        });

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages,
        });
      } else {
        logger.error('Unexpected validation error', { error });
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'Validation error',
        });
      }
    }
  };
};

/**
 * Middleware to validate request params using Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.reduce((acc, curr) => {
          const path = curr.path.join('.');
          acc[path] = curr.message;
          return acc;
        }, {} as Record<string, string>);

        logger.warn('Request params validation failed', {
          errors: errorMessages,
          params: req.params,
        });

        res.status(400).json({
          success: false,
          message: 'Invalid parameters',
          errors: errorMessages,
        });
      } else {
        logger.error('Unexpected params validation error', { error });
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'Validation error',
        });
      }
    }
  };
};

/**
 * Middleware to validate request query using Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.reduce((acc, curr) => {
          const path = curr.path.join('.');
          acc[path] = curr.message;
          return acc;
        }, {} as Record<string, string>);

        logger.warn('Request query validation failed', {
          errors: errorMessages,
          query: req.query,
        });

        res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: errorMessages,
        });
      } else {
        logger.error('Unexpected query validation error', { error });
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'Validation error',
        });
      }
    }
  };
};

/**
 * Middleware to validate file uploads
 */
export const validateFile = (options: {
  required?: boolean;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
  maxFiles?: number;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const {
      required = false,
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
      maxFiles = 1,
    } = options;

    const files = req.files as Express.Multer.File[] | undefined;
    const file = req.file as Express.Multer.File | undefined;

    // Check if file is required
    if (required && !file && (!files || files.length === 0)) {
      res.status(400).json({
        success: false,
        message: 'File is required',
        error: 'No file uploaded',
      });
      return;
    }

    // If no file and not required, continue
    if (!file && (!files || files.length === 0)) {
      next();
      return;
    }

    const filesToValidate = files || (file ? [file] : []);

    // Check number of files
    if (filesToValidate.length > maxFiles) {
      res.status(400).json({
        success: false,
        message: `Maximum ${maxFiles} file(s) allowed`,
        error: 'Too many files',
      });
      return;
    }

    // Validate each file
    for (const uploadedFile of filesToValidate) {
      // Check file size
      if (uploadedFile.size > maxSize) {
        res.status(400).json({
          success: false,
          message: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
          error: 'File too large',
        });
        return;
      }

      // Check file type
      if (!allowedTypes.includes(uploadedFile.mimetype)) {
        res.status(400).json({
          success: false,
          message: `File type ${uploadedFile.mimetype} is not allowed`,
          error: 'Invalid file type',
        });
        return;
      }

      // Check file extension
      const extension = uploadedFile.originalname
        .toLowerCase()
        .substring(uploadedFile.originalname.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(extension)) {
        res.status(400).json({
          success: false,
          message: `File extension ${extension} is not allowed`,
          error: 'Invalid file extension',
        });
        return;
      }

      // Additional security checks
      if (uploadedFile.originalname.includes('..') || uploadedFile.originalname.includes('/')) {
        res.status(400).json({
          success: false,
          message: 'Invalid file name',
          error: 'Security violation in filename',
        });
        return;
      }
    }

    next();
  };
};

/**
 * Middleware to sanitize input data
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query as Record<string, unknown>);
  }

  next();
};

/**
 * Middleware to validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (page < 1) {
    res.status(400).json({
      success: false,
      message: 'Page must be greater than 0',
      error: 'Invalid page parameter',
    });
    return;
  }

  if (limit < 1 || limit > 100) {
    res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100',
      error: 'Invalid limit parameter',
    });
    return;
  }

  req.query.page = page.toString();
  req.query.limit = limit.toString();

  next();
};

/**
 * Middleware to validate sort parameters
 */
export const validateSort = (allowedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as string;

    if (sortBy && !allowedFields.includes(sortBy)) {
      res.status(400).json({
        success: false,
        message: `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`,
        error: 'Invalid sortBy parameter',
      });
      return;
    }

    if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
      res.status(400).json({
        success: false,
        message: 'Sort order must be "asc" or "desc"',
        error: 'Invalid sortOrder parameter',
      });
      return;
    }

    if (sortOrder) {
      req.query.sortOrder = sortOrder.toLowerCase();
    }

    next();
  };
};
