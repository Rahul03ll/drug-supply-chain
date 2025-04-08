const winston = require('winston');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode = 500, type = 'generic') {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(errors) {
    super('Validation Error', 400, 'validation');
    this.errors = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'auth');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'database');
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  const logger = req.logger || winston.createLogger({
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log' })
    ]
  });

  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    type: err.type || 'unknown',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Determine response based on error type
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    status: 'error',
    statusCode: statusCode,
    message: err.isOperational ? err.message : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.errors && { errors: err.errors })
  };

  res.status(statusCode).json(errorResponse);
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  DatabaseError,
  errorHandler
};
