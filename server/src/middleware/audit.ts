import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { AuthRequest } from '../types';

/**
 * Middleware to log audit events
 */
export const auditLogger = (action: string, entity: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;
    let responseBody: any;

    // Capture response body
    res.send = function (body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', async () => {
      try {
        // Only log successful operations
        if (res.statusCode < 400 && req.user) {
          const entityId = req.params.id || responseBody?.data?.id || null;
          
          // Prepare audit log data
          const auditData = {
            action,
            entity,
            entityId,
            userId: req.user.id,
            ipAddress: getClientIp(req),
            userAgent: req.get('User-Agent') || null,
            details: {
              method: req.method,
              url: req.originalUrl,
              statusCode: res.statusCode,
              requestBody: sanitizeRequestBody(req.body),
              query: req.query,
              params: req.params,
            },
          };

          // Create audit log entry
          await prisma.auditLog.create({
            data: auditData,
          });

          logger.debug('Audit log created', {
            action,
            entity,
            entityId,
            userId: req.user.id,
          });
        }
      } catch (error) {
        logger.error('Failed to create audit log', { error });
      }
    });

    next();
  };
};

/**
 * Middleware to log user actions
 */
export const logUserAction = (action: string, description?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user) {
        const auditData = {
          action,
          entity: 'user_action',
          entityId: req.user.id,
          userId: req.user.id,
          ipAddress: getClientIp(req),
          userAgent: req.get('User-Agent') || null,
          details: {
            description: description || action,
            method: req.method,
            url: req.originalUrl,
            timestamp: new Date().toISOString(),
          },
        };

        await prisma.auditLog.create({
          data: auditData,
        });

        logger.info('User action logged', {
          action,
          userId: req.user.id,
          userEmail: req.user.email,
        });
      }
    } catch (error) {
      logger.error('Failed to log user action', { error });
    }

    next();
  };
};

/**
 * Middleware to track login attempts
 */
export const trackLoginAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const originalSend = res.send;
  let responseBody: any;

  // Capture response body
  res.send = function (body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    try {
      const isSuccess = res.statusCode === 200 && responseBody?.success;
      const email = req.body?.email || 'unknown';

      const auditData = {
        action: isSuccess ? 'login_success' : 'login_failure',
        entity: 'auth',
        entityId: null,
        userId: responseBody?.data?.user?.id || null,
        ipAddress: getClientIp(req),
        userAgent: req.get('User-Agent') || null,
        details: {
          email,
          success: isSuccess,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString(),
          failureReason: isSuccess ? null : responseBody?.message,
        },
      };

      await prisma.auditLog.create({
        data: auditData,
      });

      if (isSuccess) {
        logger.info('Successful login', { email, ip: getClientIp(req) });
      } else {
        logger.warn('Failed login attempt', { 
          email, 
          ip: getClientIp(req),
          reason: responseBody?.message 
        });
      }
    } catch (error) {
      logger.error('Failed to track login attempt', { error });
    }
  });

  next();
};

/**
 * Middleware to track security events
 */
export const trackSecurityEvent = (eventType: string, severity: 'low' | 'medium' | 'high' = 'medium') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const auditData = {
        action: 'security_event',
        entity: 'security',
        entityId: null,
        userId: req.user?.id || null,
        ipAddress: getClientIp(req),
        userAgent: req.get('User-Agent') || null,
        details: {
          eventType,
          severity,
          method: req.method,
          url: req.originalUrl,
          headers: sanitizeHeaders(req.headers),
          timestamp: new Date().toISOString(),
        },
      };

      await prisma.auditLog.create({
        data: auditData,
      });

      logger.warn('Security event tracked', {
        eventType,
        severity,
        ip: getClientIp(req),
        userId: req.user?.id,
      });
    } catch (error) {
      logger.error('Failed to track security event', { error });
    }

    next();
  };
};

/**
 * Middleware to track data changes
 */
export const trackDataChange = (
  entity: string,
  changeType: 'create' | 'update' | 'delete'
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;
    let responseBody: any;
    let oldValues: any = null;

    // For updates, try to get old values
    if (changeType === 'update' && req.params.id) {
      try {
        // This is a simplified approach - in a real app, you'd want to 
        // implement this per entity type
        oldValues = await getEntityById(entity, req.params.id);
      } catch (error) {
        logger.debug('Could not fetch old values for audit', { error });
      }
    }

    // Capture response body
    res.send = function (body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', async () => {
      try {
        if (res.statusCode < 400 && req.user && responseBody?.success) {
          const entityId = req.params.id || responseBody?.data?.id || null;
          const newValues = responseBody?.data || req.body;

          const auditData = {
            action: `${changeType}_${entity}`,
            entity,
            entityId,
            userId: req.user.id,
            ipAddress: getClientIp(req),
            userAgent: req.get('User-Agent') || null,
            oldValues: oldValues ? sanitizeData(oldValues) : null,
            newValues: sanitizeData(newValues),
            details: {
              changeType,
              method: req.method,
              url: req.originalUrl,
              timestamp: new Date().toISOString(),
            },
          };

          await prisma.auditLog.create({
            data: auditData,
          });

          logger.debug('Data change tracked', {
            changeType,
            entity,
            entityId,
            userId: req.user.id,
          });
        }
      } catch (error) {
        logger.error('Failed to track data change', { error });
      }
    });

    next();
  };
};

/**
 * Middleware to track file operations
 */
export const trackFileOperation = (operation: 'upload' | 'download' | 'delete') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;
    let responseBody: any;

    // Capture response body
    res.send = function (body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', async () => {
      try {
        if (res.statusCode < 400 && req.user) {
          const file = req.file || (req.files as Express.Multer.File[])?.[0];
          const fileInfo = responseBody?.data?.file || responseBody?.data;

          const auditData = {
            action: `file_${operation}`,
            entity: 'file',
            entityId: fileInfo?.id || null,
            userId: req.user.id,
            ipAddress: getClientIp(req),
            userAgent: req.get('User-Agent') || null,
            details: {
              operation,
              fileName: file?.originalname || fileInfo?.originalName,
              fileSize: file?.size || fileInfo?.fileSize,
              mimeType: file?.mimetype || fileInfo?.mimeType,
              fileUrl: fileInfo?.fileUrl,
              timestamp: new Date().toISOString(),
            },
          };

          await prisma.auditLog.create({
            data: auditData,
          });

          logger.info('File operation tracked', {
            operation,
            fileName: file?.originalname || fileInfo?.originalName,
            userId: req.user.id,
          });
        }
      } catch (error) {
        logger.error('Failed to track file operation', { error });
      }
    });

    next();
  };
};

/**
 * Helper function to get client IP address
 */
function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * Helper function to sanitize request body for logging
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') return body;

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Helper function to sanitize headers
 */
function sanitizeHeaders(headers: any): any {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  const sanitized = { ...headers };

  for (const header of sensitiveHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Helper function to sanitize data for audit logs
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'firebaseUid'];
  const sanitized = JSON.parse(JSON.stringify(data));

  function recursiveSanitize(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(recursiveSanitize);
    }
    
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          obj[key] = recursiveSanitize(obj[key]);
        }
      }
    }
    
    return obj;
  }

  return recursiveSanitize(sanitized);
}

/**
 * Helper function to get entity by ID (simplified)
 */
async function getEntityById(entityType: string, id: string): Promise<any> {
  switch (entityType) {
    case 'user':
      return await prisma.user.findUnique({ where: { id } });
    case 'organization':
      return await prisma.organization.findUnique({ where: { id } });
    case 'student':
      return await prisma.student.findUnique({ where: { id } });
    case 'experience':
      return await prisma.experience.findUnique({ where: { id } });
    case 'portfolio':
      return await prisma.portfolio.findUnique({ where: { id } });
    default:
      return null;
  }
}
