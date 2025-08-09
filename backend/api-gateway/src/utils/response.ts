import { Response } from 'express';
import { ApiResponse, ErrorResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
  correlationId?: string
): Response<ApiResponse<T>> => {
  const response: ApiResponse<T> = {
    success: true,
    timestamp: new Date().toISOString(),
    correlationId: correlationId || uuidv4(),
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  error: string,
  message: string,
  statusCode = 500,
  correlationId?: string,
  stack?: string
): Response<ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    correlationId: correlationId || uuidv4(),
    ...(process.env['NODE_ENV'] === 'development' && stack && { stack }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 */
export const sendValidationError = (
  res: Response,
  _errors: Record<string, string[]>,
  correlationId?: string
): Response<ErrorResponse> => {
  return sendError(
    res,
    'VALIDATION_ERROR',
    'Request validation failed',
    400,
    correlationId
  );
};

/**
 * Send unauthorized response
 */
export const sendUnauthorized = (
  res: Response,
  message = 'Unauthorized access',
  correlationId?: string
): Response<ErrorResponse> => {
  return sendError(
    res,
    'UNAUTHORIZED',
    message,
    401,
    correlationId
  );
};

/**
 * Send forbidden response
 */
export const sendForbidden = (
  res: Response,
  message = 'Forbidden access',
  correlationId?: string
): Response<ErrorResponse> => {
  return sendError(
    res,
    'FORBIDDEN',
    message,
    403,
    correlationId
  );
};

/**
 * Send not found response
 */
export const sendNotFound = (
  res: Response,
  message = 'Resource not found',
  correlationId?: string
): Response<ErrorResponse> => {
  return sendError(
    res,
    'NOT_FOUND',
    message,
    404,
    correlationId
  );
};

/**
 * Send service unavailable response
 */
export const sendServiceUnavailable = (
  res: Response,
  message = 'Service temporarily unavailable',
  correlationId?: string
): Response<ErrorResponse> => {
  return sendError(
    res,
    'SERVICE_UNAVAILABLE',
    message,
    503,
    correlationId
  );
};

export default {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendServiceUnavailable,
};
