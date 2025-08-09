import dotenv from 'dotenv';
import { ServiceConfig, RateLimitConfig } from '@/types';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  port: parseInt(process.env['PORT'] || '3002', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  
  // JWT configuration
  jwt: {
    secret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
    refreshExpiresIn: process.env['REFRESH_TOKEN_EXPIRES_IN'] || '30d',
  },

  // Redis configuration
  redis: {
    url: process.env['REDIS_URL'] || 'redis://localhost:6379',
    password: process.env['REDIS_PASSWORD'],
    db: parseInt(process.env['REDIS_DB'] || '0', 10),
  },

  // Service URLs
  services: {
    userService: process.env['USER_SERVICE_URL'] || 'http://localhost:3001',
    propertyService: process.env['PROPERTY_SERVICE_URL'] || 'http://localhost:3002',
    searchService: process.env['SEARCH_SERVICE_URL'] || 'http://localhost:3003',
    chatService: process.env['CHAT_SERVICE_URL'] || 'http://localhost:3004',
  } as ServiceConfig,

  // Rate limiting configuration
  rateLimit: {
    // General rate limiting
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    } as RateLimitConfig,

    // Auth endpoints (more restrictive)
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: 'Too many authentication attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    } as RateLimitConfig,

    // API endpoints
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many API requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    } as RateLimitConfig,
  },

  // CORS configuration
  cors: {
    origin: process.env['CORS_ORIGIN']?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Correlation-ID',
    ],
  },

  // Logging configuration
  logging: {
    level: process.env['LOG_LEVEL'] || 'info',
    format: process.env['LOG_FORMAT'] || 'combined',
    file: {
      enabled: process.env['LOG_FILE_ENABLED'] === 'true',
      filename: process.env['LOG_FILE_PATH'] || 'logs/api-gateway.log',
      maxsize: parseInt(process.env['LOG_FILE_MAX_SIZE'] || '10485760', 10), // 10MB
      maxFiles: parseInt(process.env['LOG_FILE_MAX_FILES'] || '5', 10),
    },
  },

  // Health check configuration
  healthCheck: {
    timeout: parseInt(process.env['HEALTH_CHECK_TIMEOUT'] || '5000', 10),
    interval: parseInt(process.env['HEALTH_CHECK_INTERVAL'] || '30000', 10),
  },

  // Proxy configuration
  proxy: {
    timeout: parseInt(process.env['PROXY_TIMEOUT'] || '30000', 10),
    retries: parseInt(process.env['PROXY_RETRIES'] || '3', 10),
  },
};

export default config;
