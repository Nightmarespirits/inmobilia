import winston from 'winston';
import config from '@/config';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
    const logEntry = {
      timestamp,
      level,
      message,
      correlationId,
      service: 'api-gateway',
      ...meta,
    };
    return JSON.stringify(logEntry);
  })
);

// Create transports array
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

// Add file transport if enabled
if (config.logging.file.enabled) {
  transports.push(
    new winston.transports.File({
      filename: config.logging.file.filename,
      maxsize: config.logging.file.maxsize,
      maxFiles: config.logging.file.maxFiles,
      format: logFormat,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Add correlation ID to logs
export const logWithCorrelation = (
  level: string,
  message: string,
  correlationId?: string,
  meta?: Record<string, unknown>
): void => {
  logger.log(level, message, { correlationId, ...meta });
};

export default logger;
