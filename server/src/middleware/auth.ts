import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { AuthRequest, Role } from '../types';

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        error: 'No token provided',
      });
      return;
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: true,
        student: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'Invalid user',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        error: 'Account deactivated',
      });
      return;
    }

    // Set user info in request
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    next();
  } catch (error) {
    logger.error('Authentication failed', { error });
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'Authentication failed',
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 */
export const requireRole = (roles: Role | Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!requiredRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'Access denied',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Middleware to check if user is organization
 */
export const requireOrganization = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'No user found',
    });
    return;
  }

  if (req.user.role !== 'ORGANIZATION') {
    res.status(403).json({
      success: false,
      message: 'Organization access required',
      error: 'Insufficient permissions',
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user is student
 */
export const requireStudent = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'No user found',
    });
    return;
  }

  if (req.user.role !== 'STUDENT') {
    res.status(403).json({
      success: false,
      message: 'Student access required',
      error: 'Insufficient permissions',
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user can access resource (owns it)
 */
export const requireOwnership = (resourceField: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'No user found',
        });
        return;
      }

      const resourceId = req.params.id || req.body[resourceField];
      
      if (!resourceId) {
        res.status(400).json({
          success: false,
          message: 'Resource ID required',
          error: 'Missing resource identifier',
        });
        return;
      }

      // Admin can access everything
      if (req.user.role === 'ADMIN') {
        next();
        return;
      }

      // Check ownership based on resource type
      let hasAccess = false;

      if (req.user.role === 'ORGANIZATION' && req.user.organization) {
        // Organization can access their own resources
        hasAccess = req.user.organization.id === resourceId;
      } else if (req.user.role === 'STUDENT' && req.user.student) {
        // Student can access their own resources
        hasAccess = req.user.student.id === resourceId;
      }

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
          error: 'You can only access your own resources',
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Ownership check failed', { error });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'Access control check failed',
      });
    }
  };
};

/**
 * Middleware for optional authentication
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          organization: true,
          student: true,
        },
      });

      if (user && user.isActive) {
        req.user = user;
        req.userId = user.id;
        req.userRole = user.role;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Middleware to check if user's email is verified
 */
export const requireEmailVerification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found',
      });
      return;
    }

    if (!req.user.emailVerified) {
      res.status(403).json({
        success: false,
        message: 'Email verification required',
        error: 'Please verify your email address',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Email verification check failed', { error });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Verification check failed',
    });
  }
};
