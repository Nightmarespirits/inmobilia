import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload, UserRole } from '@/types';
import { sendUnauthorized, sendForbidden } from '@/utils/response';
import config from '@/config';
import logger from '@/utils/logger';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const correlationId = req.correlationId;

    if (!authHeader) {
      logger.warn('Authentication failed: No authorization header', { correlationId });
      sendUnauthorized(res, 'No authorization header provided', correlationId);
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.warn('Authentication failed: No token provided', { correlationId });
      sendUnauthorized(res, 'No token provided', correlationId);
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    
    // Add user info to request
    req.user = decoded;

    logger.info('User authenticated successfully', {
      correlationId,
      userId: decoded.sub,
      userRole: decoded.role,
    });

    next();
  } catch (error) {
    logger.error('Authentication failed: Invalid token', {
      correlationId: req.correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof jwt.TokenExpiredError) {
      sendUnauthorized(res, 'Token has expired', req.correlationId);
    } else if (error instanceof jwt.JsonWebTokenError) {
      sendUnauthorized(res, 'Invalid token', req.correlationId);
    } else {
      sendUnauthorized(res, 'Authentication failed', req.correlationId);
    }
  }
};

/**
 * Middleware to authorize specific roles
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): void => {
    const user = req.user;
    const correlationId = req.correlationId;

    if (!user) {
      logger.warn('Authorization failed: No user in request', { correlationId });
      sendUnauthorized(_res, 'Authentication required', correlationId);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      logger.warn('Authorization failed: Insufficient permissions', {
        correlationId,
        userId: user.sub,
        userRole: user.role,
        requiredRoles: allowedRoles,
      });
      sendForbidden(_res, 'Insufficient permissions', correlationId);
      return;
    }

    logger.info('User authorized successfully', {
      correlationId,
      userId: user.sub,
      userRole: user.role,
    });

    next();
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;

    logger.info('Optional authentication successful', {
      correlationId: req.correlationId,
      userId: decoded.sub,
      userRole: decoded.role,
    });
  } catch (error) {
    logger.warn('Optional authentication failed, continuing without auth', {
      correlationId: req.correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  next();
};

export default {
  authenticate,
  authorize,
  optionalAuth,
};
