import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Extend PrismaClient with custom functionality
class DatabaseService extends PrismaClient {
  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      errorFormat: 'colorless',
    });

    // Log slow queries
    this.$on('query' as any, (e: any) => {
      if (e.duration > 1000) {
        logger.warn('Slow query detected', {
          query: e.query,
          duration: e.duration,
          params: e.params,
        });
      }
    });

    // Log errors
    this.$on('error' as any, (e: any) => {
      logger.error('Database error', {
        message: e.message,
        target: e.target,
      });
    });
  }

  async connect(): Promise<void> {
    try {
      await this.$connect();
      logger.info('Successfully connected to database');
    } catch (error) {
      logger.error('Failed to connect to database', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.$disconnect();
      logger.info('Disconnected from database');
    } catch (error) {
      logger.error('Error disconnecting from database', { error });
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed', { error });
      return false;
    }
  }

  async getConnectionInfo(): Promise<{ connected: boolean; version?: string }> {
    try {
      const result = await this.$queryRaw<[{ version: string }]>`SELECT version()`;
      return {
        connected: true,
        version: result[0]?.version,
      };
    } catch (error) {
      return {
        connected: false,
      };
    }
  }
}

// Create a singleton instance
const prisma = new DatabaseService();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.disconnect();
});

process.on('SIGINT', async () => {
  await prisma.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.disconnect();
  process.exit(0);
});

export { prisma };
export default prisma;
