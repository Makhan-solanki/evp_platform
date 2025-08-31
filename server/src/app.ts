import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { prisma } from './config/database';
import { logger } from './config/logger';
import {
  securityHeaders,
  generalRateLimit,
  requestSizeLimit,
  suspiciousActivityDetection,
  securityLogger,
  securityResponseHeaders,
} from './middleware/security';
import {
  errorHandler,
  notFoundHandler,
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
} from './middleware/error';
import { sanitizeInput } from './middleware/validation';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import organizationRoutes from './routes/organization.routes';
import studentRoutes from './routes/student.routes';
import experienceRoutes from './routes/experience.routes';

// Create Express application
const app = express();

// Handle unhandled promise rejections and uncaught exceptions
unhandledRejectionHandler();
uncaughtExceptionHandler();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(securityLogger);
app.use(securityResponseHeaders);
app.use(suspiciousActivityDetection);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001', // Client running on same port as server
      'http://localhost:5173', // Vite dev server
    ];
    
    // Add production domains from environment
    if (process.env.ALLOWED_ORIGINS) {
      allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS policy violation', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID'],
}));

// Compression middleware
app.use(compression());

// Rate limiting
app.use(generalRateLimit);

// Request size limiting
app.use(requestSizeLimit('10mb'));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true,
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
}));

// Serve static files from the React app build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
}

// Input sanitization
app.use(sanitizeInput);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbHealth = await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbHealth ? 'connected' : 'disconnected',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(503).json({
      success: false,
      message: 'Server is unhealthy',
      error: 'Database connection failed',
    });
  }
});

// API information endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Experience Verification Platform API',
    data: {
      name: 'Experience Verification Platform API',
      version: process.env.npm_package_version || '1.0.0',
      description: 'API for managing educational experiences and student portfolios',
      environment: process.env.NODE_ENV || 'development',
      documentation: '/api/docs',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        organizations: '/api/organizations',
        students: '/api/students',
        experiences: '/api/experiences',
        portfolios: '/api/portfolios',
        files: '/api/files',
        analytics: '/api/analytics',
      },
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/experiences', experienceRoutes);
// app.use('/api/portfolios', portfolioRoutes);
// app.use('/api/files', fileRoutes);
// app.use('/api/analytics', analyticsRoutes);

// API documentation endpoint (placeholder)
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    data: {
      openapi: '3.0.0',
      info: {
        title: 'Experience Verification Platform API',
        version: '1.0.0',
        description: 'API for managing educational experiences and student portfolios',
      },
      servers: [
        {
          url: process.env.API_URL || 'http://localhost:5000',
          description: 'API Server',
        },
      ],
      // TODO: Add full OpenAPI specification
    },
  });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const size = res.get('Content-Length') || 0;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      size: `${size}b`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      referer: req.get('Referer'),
    });
  });
  
  next();
});

// Catch-all handler for React app (must be before 404 handler)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export default app;
