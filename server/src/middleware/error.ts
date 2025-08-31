import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends AppError {
  public errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string> = {}) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Custom error class for authentication errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

/**
 * Custom error class for authorization errors
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

/**
 * Custom error class for not found errors
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Custom error class for conflict errors
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

/**
 * Custom error class for rate limit errors
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

/**
 * Middleware to handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  next(error);
};

/**
 * Main error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Record<string, string> | undefined;

  // Log error
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    
    if (error instanceof ValidationError) {
      errors = error.errors;
    }
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = error.errors.reduce((acc, curr) => {
      const path = curr.path.join('.');
      acc[path] = curr.message;
      return acc;
    }, {} as Record<string, string>);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(error);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
    errors = prismaError.errors;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    message = 'Database connection error';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'MulterError') {
    const multerError = handleMulterError(error as any);
    statusCode = multerError.statusCode;
    message = multerError.message;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  // Send error response
  const response: any = {
    success: false,
    message,
    error: error.message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
  statusCode: number;
  message: string;
  errors?: Record<string, string>;
} {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const target = error.meta?.target as string[] | undefined;
      const field = target?.[0] || 'field';
      return {
        statusCode: 409,
        message: 'Resource already exists',
        errors: { [field]: `${field} already exists` },
      };

    case 'P2014':
      // Invalid ID
      return {
        statusCode: 400,
        message: 'Invalid ID provided',
      };

    case 'P2003':
      // Foreign key constraint violation
      return {
        statusCode: 400,
        message: 'Invalid reference to related resource',
      };

    case 'P2025':
      // Record not found
      return {
        statusCode: 404,
        message: 'Resource not found',
      };

    case 'P2016':
      // Query interpretation error
      return {
        statusCode: 400,
        message: 'Invalid query parameters',
      };

    case 'P2021':
      // Table does not exist
      return {
        statusCode: 500,
        message: 'Database schema error',
      };

    case 'P2022':
      // Column does not exist
      return {
        statusCode: 500,
        message: 'Database schema error',
      };

    default:
      logger.error('Unhandled Prisma error', { code: error.code, meta: error.meta });
      return {
        statusCode: 500,
        message: 'Database error',
      };
  }
}

/**
 * Handle Multer errors
 */
function handleMulterError(error: any): {
  statusCode: number;
  message: string;
} {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return {
        statusCode: 413,
        message: 'File size too large',
      };

    case 'LIMIT_FILE_COUNT':
      return {
        statusCode: 400,
        message: 'Too many files',
      };

    case 'LIMIT_FIELD_KEY':
      return {
        statusCode: 400,
        message: 'Field name too long',
      };

    case 'LIMIT_FIELD_VALUE':
      return {
        statusCode: 400,
        message: 'Field value too long',
      };

    case 'LIMIT_FIELD_COUNT':
      return {
        statusCode: 400,
        message: 'Too many fields',
      };

    case 'LIMIT_UNEXPECTED_FILE':
      return {
        statusCode: 400,
        message: 'Unexpected file field',
      };

    default:
      return {
        statusCode: 400,
        message: 'File upload error',
      };
  }
}

/**
 * Async error wrapper to catch async errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware to handle unhandled promise rejections
 */
export const unhandledRejectionHandler = (): void => {
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    logger.error('Unhandled Promise Rejection', {
      reason,
      promise,
    });
    
    // Gracefully close the server
    process.exit(1);
  });
};

/**
 * Middleware to handle uncaught exceptions
 */
export const uncaughtExceptionHandler = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
    });
    
    // Gracefully close the server
    process.exit(1);
  });
};

/**
 * Graceful shutdown handler
 */
export const gracefulShutdownHandler = (server: any): void => {
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Graceful shutdown...`);
    
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};
