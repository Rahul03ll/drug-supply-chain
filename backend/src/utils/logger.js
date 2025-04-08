const winston = require('winston');
const path = require('path');

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Create logger
const logger = winston.createLogger({
  levels,
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
      level: process.env.LOG_LEVEL || 'info',
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

// Logging utility class
class LoggerService {
  // Log an error
  static error(message, meta = {}) {
    logger.error(message, meta);
  }

  // Log a warning
  static warn(message, meta = {}) {
    logger.warn(message, meta);
  }

  // Log an info message
  static info(message, meta = {}) {
    logger.info(message, meta);
  }

  // Log a debug message
  static debug(message, meta = {}) {
    logger.debug(message, meta);
  }

  // Log an HTTP request
  static http(message, meta = {}) {
    logger.http(message, meta);
  }

  // Audit log for critical operations
  static audit(operation, user, details = {}) {
    logger.info(`AUDIT: ${operation}`, {
      user: user?.username || 'Unknown',
      userId: user?._id || 'N/A',
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Performance logging
  static performance(operation, startTime, meta = {}) {
    const duration = Date.now() - startTime;
    logger.info(`PERFORMANCE: ${operation}`, {
      duration,
      ...meta,
    });
  }
}

module.exports = LoggerService;
