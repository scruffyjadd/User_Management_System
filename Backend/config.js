const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load environment variables with defaults
const env = process.env.NODE_ENV || 'development';

const config = {
  env,
  port: process.env.PORT || 4000,
  
  // API settings
  api: {
    prefix: process.env.API_PREFIX || '/api',
    version: process.env.API_VERSION || 'v1',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000']
  },
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '1h',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    resetPasswordExpiration: process.env.JWT_RESET_PASSWORD_EXPIRATION || '1h',
    verifyEmailExpiration: process.env.JWT_VERIFY_EMAIL_EXPIRATION || '1h'
  },
  
  // Database settings
  db: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'employee_management',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  // Email settings
  email: {
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password'
      }
    }
  },
  
  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    colorize: process.env.LOG_COLORIZE !== 'false',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    toFile: process.env.LOG_TO_FILE === 'true'
  },
  
  // Security settings
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    cors: {
      origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }
  }
};

// Export the config object based on the current environment
module.exports = config;
