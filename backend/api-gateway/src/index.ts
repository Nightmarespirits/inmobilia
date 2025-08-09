import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Server } from 'http';

// Import middleware
import correlationId from '@/middleware/correlation';
import { generalRateLimit, progressiveSlowDown } from '@/middleware/rateLimiting';
import { globalErrorHandler, notFoundHandler } from '@/middleware/errorHandler';

// Import routes
import healthRoutes from '@/routes/health';
import proxyRoutes from '@/routes/proxy';

// Import configuration and utilities
import config from '@/config';
import logger from '@/utils/logger';

class ApiGateway {
  private app: express.Application;
  private server: Server | null = null;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }));

    // CORS configuration
    this.app.use(cors(config.cors));

    // Compression middleware
    this.app.use(compression());

    // Request parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Correlation ID middleware (must be first)
    this.app.use(correlationId);

    // Logging middleware
    this.app.use(morgan(config.logging.format, {
      stream: {
        write: (message: string) => {
          logger.info(message.trim(), { service: 'api-gateway' });
        },
      },
    }));

    // Rate limiting middleware
    this.app.use(generalRateLimit);
    this.app.use(progressiveSlowDown);

    // Trust proxy (for accurate IP addresses behind load balancers)
    this.app.set('trust proxy', 1);
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // Health check routes (no rate limiting)
    this.app.use('/', healthRoutes);

    // API routes with proxy
    this.app.use('/', proxyRoutes);

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'PropTech Nexus API Gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        services: {
          userService: config.services.userService,
          propertyService: config.services.propertyService,
          searchService: config.services.searchService,
          chatService: config.services.chatService,
        },
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // 404 handler for unmatched routes
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(globalErrorHandler);
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      this.server = this.app.listen(config.port, () => {
        logger.info('API Gateway started successfully', {
          port: config.port,
          environment: config.nodeEnv,
          services: config.services,
        });
      });

      // Graceful shutdown handling
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start API Gateway', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      process.exit(1);
    }
  }

  /**
   * Stop the server
   */
  public async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          logger.info('API Gateway stopped gracefully');
          resolve();
        });
      });
    }
  }

  /**
   * Setup graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        process.exit(1);
      }
    };

    // Handle different termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
        promise: String(promise),
      });
      process.exit(1);
    });
  }

  /**
   * Get Express app instance
   */
  public getApp(): express.Application {
    return this.app;
  }
}

// Start the API Gateway if this file is run directly
if (require.main === module) {
  const gateway = new ApiGateway();
  gateway.start().catch((error) => {
    logger.error('Failed to start API Gateway', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  });
}

export default ApiGateway;
