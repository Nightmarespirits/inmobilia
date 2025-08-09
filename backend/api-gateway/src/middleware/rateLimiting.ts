import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import Redis from 'redis';
import { config } from '@/config';
import logger from '@/utils/logger';
import { AuthenticatedRequest } from '@/types';

// Redis client for distributed rate limiting
let redisClient: Redis.RedisClientType | null = null;

// Initialize Redis client
const initRedis = async (): Promise<void> => {
  try {
    const redisConfig: any = {
      url: config.redis.url,
    };
    
    if (config.redis.password) {
      redisConfig.password = config.redis.password;
    }

    redisClient = Redis.createClient(redisConfig);

    redisClient.on('error', (err: Error) => {
      logger.error('Redis client error:', { error: err.message });
    });

    await redisClient.connect();
    logger.info('Redis client connected for rate limiting');
  } catch (error) {
    logger.error('Failed to connect Redis client:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Initialize Redis on module load
void initRedis();

/**
 * Custom key generator for rate limiting
 */
const keyGenerator = (req: AuthenticatedRequest): string => {
  // Use user ID if authenticated, otherwise use IP
  if (req.user?.sub) {
    return `user:${req.user.sub}`;
  }
  return `ip:${req.ip}`;
};

/**
 * Custom handler for rate limit exceeded
 */
const rateLimitHandler = (req: AuthenticatedRequest, res: Response): void => {
  const correlationId = req.correlationId;
  const identifier = keyGenerator(req);

  logger.warn('Rate limit exceeded', {
    correlationId,
    identifier,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
  });

  res.status(429).json({
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
    correlationId,
    retryAfter: '15 minutes',
  });
};

/**
 * General rate limiter
 */
export const generalRateLimit = rateLimit({
  windowMs: config.rateLimit.general.windowMs,
  max: config.rateLimit.general.max,
  message: config.rateLimit.general.message,
  standardHeaders: config.rateLimit.general.standardHeaders,
  legacyHeaders: config.rateLimit.general.legacyHeaders,
  keyGenerator,
  handler: rateLimitHandler,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/metrics';
  },
});

/**
 * Auth endpoints rate limiter (more restrictive)
 */
export const authRateLimit = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  message: config.rateLimit.auth.message,
  standardHeaders: config.rateLimit.auth.standardHeaders,
  legacyHeaders: config.rateLimit.auth.legacyHeaders,
  keyGenerator,
  handler: rateLimitHandler,
});

/**
 * API endpoints rate limiter
 */
export const apiRateLimit = rateLimit({
  windowMs: config.rateLimit.api.windowMs,
  max: config.rateLimit.api.max,
  message: config.rateLimit.api.message,
  standardHeaders: config.rateLimit.api.standardHeaders,
  legacyHeaders: config.rateLimit.api.legacyHeaders,
  keyGenerator,
  handler: rateLimitHandler,
});

/**
 * Progressive slow down middleware
 */
export const progressiveSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: () => 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 10000, // maximum delay of 10 seconds
  validate: { delayMs: false }, // Disable the deprecation warning
  keyGenerator,
  skip: (req: Request) => {
    return req.path === '/health' || req.path === '/metrics';
  },
});

/**
 * Custom rate limiter with Redis store
 */
export const createCustomRateLimit = (
  windowMs: number,
  max: number,
  message: string
) => {
  return rateLimit({
    windowMs,
    max,
    message,
    keyGenerator,
    handler: rateLimitHandler,
    // Use default memory store for now
    // TODO: Implement Redis store
  });
};

export default {
  generalRateLimit,
  authRateLimit,
  apiRateLimit,
  progressiveSlowDown,
  createCustomRateLimit,
};
