require('dotenv').config();
const path = require('path');

const env = process.env.NODE_ENV || 'development';

// Load environment-specific configuration
const config = {
    env,
    port: process.env.PORT || 4000,
    
    // Database configuration
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        database: process.env.DB_NAME || 'employee_management',
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
            timestamps: false,
            underscored: true
        }
    },
    
    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret_here',
        expiresIn: process.env.JWT_EXPIRATION || '1h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d'
    },
    
    // Email configuration
    email: {
        from: process.env.EMAIL_FROM || 'noreply@employeeapp.com',
        smtp: {
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.SMTP_PORT, 10) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || 'your_ethereal_username',
                pass: process.env.SMTP_PASSWORD || 'your_ethereal_password'
            }
        }
    },
    
    // API configuration
    api: {
        prefix: process.env.API_BASE_URL || '/api',
        docsPath: process.env.API_DOCS_URL || '/api-docs',
        version: '1.0',
        title: 'Employee Management API',
        description: 'API for Employee Management System',
        contact: {
            name: 'API Support',
            email: 'support@employeeapp.com'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        }
    },
    
    // Security
    security: {
        cors: {
            origin: process.env.CORS_ORIGINS ? 
                process.env.CORS_ORIGINS.split(',') : 
                ['http://localhost:4200', 'http://localhost:3000'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            exposedHeaders: ['Authorization'],
            credentials: true
        },
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
            max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100 // limit each IP to 100 requests per windowMs
        }
    },
    
    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_TO_FILE === 'true' ? 
            path.join(__dirname, '../logs/app.log') : 
            false,
        maxSize: '20m',
        maxFiles: '14d',
        colorize: true
    },
    
    // File uploads
    uploads: {
        directory: process.env.UPLOAD_DIR || 'public/uploads',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf']
    }
};

// Export the config object based on environment
module.exports = config;
