import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { logger } from '../config/logger';

/**
 * Basic security headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * Rate limiting middleware for general API requests
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    error: 'Rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
      error: 'Rate limit exceeded',
    });
  },
});

/**
 * Strict rate limiting for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: 'Auth rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
      error: 'Auth rate limit exceeded',
    });
  },
});

/**
 * Rate limiting for file upload endpoints
 */
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later',
    error: 'Upload rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many file uploads, please try again later',
      error: 'Upload rate limit exceeded',
    });
  },
});

/**
 * Middleware to prevent brute force attacks on sensitive endpoints
 */
export const bruteForceProtection = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 attempts per hour
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many failed attempts, account temporarily locked',
    error: 'Brute force protection triggered',
  },
  handler: (req: Request, res: Response) => {
    logger.error('Brute force protection triggered', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many failed attempts, account temporarily locked',
      error: 'Brute force protection triggered',
    });
  },
});

/**
 * Middleware to validate request size
 */
export const requestSizeLimit = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength);
      const maxSizeInBytes = parseSize(maxSize);
      
      if (sizeInBytes > maxSizeInBytes) {
        logger.warn('Request size too large', {
          size: sizeInBytes,
          maxSize: maxSizeInBytes,
          ip: req.ip,
        });
        
        res.status(413).json({
          success: false,
          message: `Request size too large. Maximum allowed: ${maxSize}`,
          error: 'Payload too large',
        });
        return;
      }
    }
    
    next();
  };
};

/**
 * Middleware to check for suspicious patterns in requests
 */
export const suspiciousActivityDetection = (req: Request, res: Response, next: NextFunction): void => {
  const suspiciousPatterns = [
    /(\<|\%3C).*script.*(\>|\%3E)/i, // Script injection
    /(\<|\%3C).*iframe.*(\>|\%3E)/i, // Iframe injection
    /(\<|\%3C).*object.*(\>|\%3E)/i, // Object injection
    /(\<|\%3C).*embed.*(\>|\%3E)/i, // Embed injection
    /union.*select/i, // SQL injection
    /insert.*into/i, // SQL injection
    /delete.*from/i, // SQL injection
    /update.*set/i, // SQL injection
    /drop.*table/i, // SQL injection
    /exec.*\(/i, // Code execution
    /eval.*\(/i, // Code execution
    /javascript:/i, // JavaScript protocol
    /vbscript:/i, // VBScript protocol
    /data:.*base64/i, // Base64 data URI
  ];

  const userAgent = req.get('User-Agent') || '';
  const url = req.url;
  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);

  const checkContent = `${url} ${body} ${query} ${userAgent}`;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkContent)) {
      logger.error('Suspicious activity detected', {
        pattern: pattern.source,
        ip: req.ip,
        userAgent,
        url,
        body: req.body,
        query: req.query,
      });

      res.status(400).json({
        success: false,
        message: 'Request contains suspicious content',
        error: 'Security violation',
      });
      return;
    }
  }

  next();
};

/**
 * Middleware to log security events
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log security-related status codes
    if (statusCode === 401 || statusCode === 403 || statusCode === 429) {
      logger.warn('Security event', {
        statusCode,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        duration,
        referer: req.get('Referer'),
      });
    }

    // Log failed authentication attempts
    if (statusCode === 401 && req.url.includes('/auth/')) {
      logger.error('Failed authentication attempt', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        timestamp: new Date().toISOString(),
      });
    }
  });

  next();
};

/**
 * Middleware to add security response headers
 */
export const securityResponseHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Add custom security headers
  res.setHeader('X-Request-ID', req.get('X-Request-ID') || generateRequestId());

  next();
};

/**
 * Middleware to validate origin for sensitive operations
 */
export const validateOrigin = (allowedOrigins: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.get('Origin') || req.get('Referer');

    if (!origin) {
      // Allow requests without origin (direct API calls, mobile apps, etc.)
      next();
      return;
    }

    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === '*') return true;
      if (allowedOrigin.endsWith('*')) {
        return origin.startsWith(allowedOrigin.slice(0, -1));
      }
      return origin === allowedOrigin || origin.startsWith(allowedOrigin + '/');
    });

    if (!isAllowed) {
      logger.warn('Invalid origin detected', {
        origin,
        allowedOrigins,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(403).json({
        success: false,
        message: 'Invalid origin',
        error: 'CORS violation',
      });
      return;
    }

    next();
  };
};

/**
 * Helper function to parse size strings
 */
function parseSize(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb)?$/);
  if (!match) throw new Error('Invalid size format');

  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';

  return Math.round(value * units[unit]);
}

/**
 * Helper function to generate request ID
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
