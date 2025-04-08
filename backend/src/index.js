const express = require('express');
const cors = require('cors');
const logger = console; // assuming console logger for simplicity
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Dynamic route loading with error handling
function loadRoutes() {
  try {
    // Dynamically load routes
    const routesDir = path.resolve(__dirname, 'routes');
    const routeFiles = fs.readdirSync(routesDir)
      .filter(file => 
        file.endsWith('.js') && 
        !file.includes('controller') && 
        !file.includes('auth')
      );

    const routeMap = {
      'drugs': '/drugs',
      'supplyChain': '/supply-chain'
    };

    routeFiles.forEach(file => {
      const routeName = path.basename(file, '.js');
      const routePath = path.join(routesDir, file);
      
      try {
        const route = require(routePath);
        const routePrefix = routeMap[routeName] || `/${routeName}`;
        
        app.use(routePrefix, route);
        logger.info(`Loaded route: ${routePrefix}`);
      } catch (routeError) {
        logger.error(`Error loading route ${routeName}:`, routeError);
      }
    });
  } catch (error) {
    logger.error('Error loading routes:', error);
    process.exit(1);
  }
}
loadRoutes();

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Drug Supply Chain Backend is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Prepare error response
  const errorResponse = {
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
