import { Request } from 'express';

// User roles enum
export enum UserRole {
  BUYER = 'buyer',
  AGENT = 'agent',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// JWT payload interface
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  correlationId?: string;
}

// Service URLs configuration
export interface ServiceConfig {
  userService: string;
  propertyService: string;
  searchService: string;
  chatService: string;
}

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// API Response interface
export interface ApiResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  timestamp: string;
  correlationId: string;
}

// Error response interface
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  correlationId: string;
  stack?: string;
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    [key: string]: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
  };
}

// Proxy target configuration
export interface ProxyTarget {
  host: string;
}

// Service registry entry
export interface ServiceRegistryEntry {
  name: string;
  url: string;
  health: string;
  version: string;
  instances: ProxyTarget[];
}
