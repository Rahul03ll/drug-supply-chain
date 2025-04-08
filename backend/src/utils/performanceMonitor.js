const { performance } = require('perf_hooks');
const winston = require('winston');

class PerformanceMonitor {
  constructor(logger = null) {
    this.logger = logger || winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'performance.log' })
      ]
    });
  }

  measureAsync = async (fn, label = 'Operation') => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.logger.info({
        type: 'performance',
        label,
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.logger.error({
        type: 'performance_error',
        label,
        duration: `${duration.toFixed(2)}ms`,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  measureSync = (fn, label = 'Operation') => {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      
      this.logger.info({
        type: 'performance',
        label,
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.logger.error({
        type: 'performance_error',
        label,
        duration: `${duration.toFixed(2)}ms`,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }
}

module.exports = new PerformanceMonitor();
