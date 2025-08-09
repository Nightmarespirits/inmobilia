import { Router, Response } from 'express';
import axios from 'axios';
import { AuthenticatedRequest, HealthCheckResponse } from '@/types';
import { sendSuccess, sendError } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import config from '@/config';
import logger from '@/utils/logger';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const correlationId = req.correlationId;
  const startTime = Date.now();

  try {
    // Check all microservices
    const serviceChecks = await Promise.allSettled([
      checkService('user-service', config.services.userService),
      checkService('property-service', config.services.propertyService),
      checkService('search-service', config.services.searchService),
      checkService('chat-service', config.services.chatService),
    ]);

    const services: HealthCheckResponse['services'] = {};
    let allHealthy = true;

    serviceChecks.forEach((result, index) => {
      const serviceNames = ['user-service', 'property-service', 'search-service', 'chat-service'];
      const serviceName = serviceNames[index];

      if (serviceName && result.status === 'fulfilled') {
        services[serviceName] = result.value;
      } else if (serviceName) {
        services[serviceName] = {
          status: 'down',
          error: result.status === 'rejected' && result.reason instanceof Error ? result.reason.message : 'Unknown error',
        };
        allHealthy = false;
      }
    });

    const healthResponse: HealthCheckResponse = {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services,
    };

    logger.info('Health check completed', {
      correlationId,
      status: healthResponse.status,
      responseTime: Date.now() - startTime,
    });

    sendSuccess(res, healthResponse, 'Health check completed', 200, correlationId);
  } catch (error) {
    logger.error('Health check failed', {
      correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    sendError(
      res,
      'HEALTH_CHECK_FAILED',
      'Health check failed',
      503,
      correlationId
    );
  }
}));

/**
 * Readiness probe endpoint
 */
router.get('/ready', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const correlationId = req.correlationId;

  // Simple readiness check - just verify the gateway is running
  sendSuccess(res, { ready: true }, 'Service is ready', 200, correlationId);
}));

/**
 * Liveness probe endpoint
 */
router.get('/live', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const correlationId = req.correlationId;

  // Simple liveness check
  sendSuccess(res, { alive: true }, 'Service is alive', 200, correlationId);
}));

/**
 * Check individual service health
 */
const checkService = async (
  _serviceName: string,
  serviceUrl: string
): Promise<{ status: 'up' | 'down'; responseTime?: number; error?: string }> => {
  const startTime = Date.now();

  try {
    const response = await axios.get(`${serviceUrl}/health`, {
      timeout: config.healthCheck.timeout,
      headers: {
        'User-Agent': 'PropTech-API-Gateway/1.0',
      },
    });

    const responseTime = Date.now() - startTime;

    if (response.status === 200) {
      return {
        status: 'up',
        responseTime,
      };
    } else {
      return {
        status: 'down',
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'down',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export default router;
