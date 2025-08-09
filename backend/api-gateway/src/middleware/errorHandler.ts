import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types';
import { sendError, sendServiceUnavailable } from '@/utils/response';
import logger from '@/utils/logger';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (
  error: Error,
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction
): void => {
  const correlationId = req.correlationId;

  // Log the error
  logger.error('Unhandled error occurred', {
    correlationId,
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.sub,
  });

  // Handle different types of errors
  if (error instanceof ApiError) {
    sendError(
      res,
      'API_ERROR',
      error.message,
      error.statusCode,
      correlationId,
      process.env['NODE_ENV'] === 'development' ? error.stack : undefined
    );
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    sendError(res, 'INVALID_TOKEN', 'Invalid token provided', 401, correlationId);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    sendError(res, 'TOKEN_EXPIRED', 'Token has expired', 401, correlationId);
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    sendError(res, 'VALIDATION_ERROR', error.message, 400, correlationId);
    return;
  }

  // Handle MongoDB/Mongoose errors
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    sendError(res, 'DATABASE_ERROR', 'Database operation failed', 500, correlationId);
    return;
  }

  // Handle network/timeout errors
  if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
    sendServiceUnavailable(
      res,
      'Service temporarily unavailable, please try again later',
      correlationId
    );
    return;
  }

  // Default error response
  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    process.env['NODE_ENV'] === 'development' ? error.message : 'Something went wrong',
    500,
    correlationId,
    process.env['NODE_ENV'] === 'development' ? error.stack : undefined
  );
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction
): void => {
  const correlationId = req.correlationId;

  logger.warn('Route not found', {
    correlationId,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  sendError(
    res,
    'NOT_FOUND',
    `Route ${req.method} ${req.url} not found`,
    404,
    correlationId
  );
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (
  fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create API error
 */
export const createApiError = (message: string, statusCode = 500): ApiError => {
  return new ApiError(message, statusCode);
};

export default {
  ApiError,
  globalErrorHandler,
  notFoundHandler,
  asyncHandler,
  createApiError,
};
