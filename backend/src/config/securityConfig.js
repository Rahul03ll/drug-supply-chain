const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const securityConfig = {
  // Helmet helps secure Express apps by setting various HTTP headers
  helmetMiddleware: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }),

  // Rate limiting to prevent brute-force attacks
  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  }),

  // CORS configuration
  corsOptions: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  },

  // Additional security configurations
  secureHeaders: {
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff'
  }
};

module.exports = securityConfig;
