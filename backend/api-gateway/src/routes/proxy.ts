import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AuthenticatedRequest, UserRole } from '@/types';
import { authenticate, authorize, optionalAuth } from '@/middleware/auth';
import { authRateLimit, apiRateLimit } from '@/middleware/rateLimiting';
import config from '@/config';
import logger from '@/utils/logger';

const router = Router();

/**
 * Proxy configuration for each service
 */
const createServiceProxy = (serviceName: string, serviceUrl: string) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    timeout: config.proxy.timeout,
    pathRewrite: {
      [`^/api/${serviceName}`]: '', // Remove service prefix from path
    },
    onProxyReq: (proxyReq, req: AuthenticatedRequest) => {
      // Add correlation ID to proxied requests
      if (req.correlationId) {
        proxyReq.setHeader('X-Correlation-ID', req.correlationId);
      }

      // Add user info to proxied requests
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.sub);
        proxyReq.setHeader('X-User-Role', req.user.role);
        proxyReq.setHeader('X-User-Email', req.user.email);
      }

      logger.info('Proxying request', {
        correlationId: req.correlationId,
        service: serviceName,
        method: req.method,
        path: req.path,
        userId: req.user?.sub,
      });
    },
    onProxyRes: (proxyRes, req: AuthenticatedRequest) => {
      logger.info('Proxy response received', {
        correlationId: req.correlationId,
        service: serviceName,
        statusCode: proxyRes.statusCode,
        method: req.method,
        path: req.path,
      });
    },
    onError: (err, req: AuthenticatedRequest, res) => {
      logger.error('Proxy error occurred', {
        correlationId: req.correlationId,
        service: serviceName,
        error: err.message,
        method: req.method,
        path: req.path,
      });

      res.status(503).json({
        success: false,
        error: 'SERVICE_UNAVAILABLE',
        message: `${serviceName} is temporarily unavailable`,
        statusCode: 503,
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId,
      });
    },
  });
};

// User Service Routes
router.use(
  '/api/auth/*',
  authRateLimit, // More restrictive rate limiting for auth
  createServiceProxy('user-service', config.services.userService)
);

router.use(
  '/api/users/*',
  apiRateLimit,
  authenticate, // Require authentication for user operations
  createServiceProxy('user-service', config.services.userService)
);

// Property Service Routes
router.use(
  '/api/properties',
  apiRateLimit,
  optionalAuth, // Optional auth for public property listings
  createServiceProxy('property-service', config.services.propertyService)
);

router.use(
  '/api/properties/*',
  apiRateLimit,
  optionalAuth, // Optional auth for property details
  createServiceProxy('property-service', config.services.propertyService)
);

// Protected property operations (create, update, delete)
router.use(
  '/api/properties/create',
  apiRateLimit,
  authenticate,
  authorize([UserRole.AGENT, UserRole.ADMIN]), // Only agents and admins can create
  createServiceProxy('property-service', config.services.propertyService)
);

router.use(
  '/api/properties/*/edit',
  apiRateLimit,
  authenticate,
  authorize([UserRole.AGENT, UserRole.ADMIN]), // Only agents and admins can edit
  createServiceProxy('property-service', config.services.propertyService)
);

router.use(
  '/api/properties/*/delete',
  apiRateLimit,
  authenticate,
  authorize([UserRole.AGENT, UserRole.ADMIN]), // Only agents and admins can delete
  createServiceProxy('property-service', config.services.propertyService)
);

// Favorites (require authentication)
router.use(
  '/api/favorites/*',
  apiRateLimit,
  authenticate,
  createServiceProxy('property-service', config.services.propertyService)
);

// Search Service Routes
router.use(
  '/api/search/*',
  apiRateLimit,
  optionalAuth, // Optional auth for search
  createServiceProxy('search-service', config.services.searchService)
);

// Chat Service Routes
router.use(
  '/api/chat/*',
  apiRateLimit,
  authenticate, // Require authentication for chat
  createServiceProxy('chat-service', config.services.chatService)
);

router.use(
  '/api/conversations/*',
  apiRateLimit,
  authenticate, // Require authentication for conversations
  createServiceProxy('chat-service', config.services.chatService)
);

router.use(
  '/api/messages/*',
  apiRateLimit,
  authenticate, // Require authentication for messages
  createServiceProxy('chat-service', config.services.chatService)
);

// Admin-only routes
router.use(
  '/api/admin/*',
  apiRateLimit,
  authenticate,
  authorize([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  createServiceProxy('user-service', config.services.userService)
);

export default router;
