import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '@/types';

/**
 * Middleware to add correlation ID to requests
 */
export const correlationId = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Get correlation ID from header or generate new one
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
  
  // Add to request object
  req.correlationId = correlationId;
  
  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);
  
  next();
};

export default correlationId;
