require('dotenv').config();

// Set NODE_PATH to include the current directory
process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

// Load configuration first
const config = require('./config');
const logger = require('./_helpers/logger');

// Log configuration load
logger.info('Application starting...');
logger.debug('Environment:', process.env.NODE_ENV);

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { errorHandler } = require('./_middleware/error-handler');

// Import routes
const accountsRouter = require('./accounts/accounts.controller');
const departmentsRouter = require('./employees/departments.routes');
const employeesRouter = require('./employees/employees.routes');
const workflowsRouter = require('./workflows/workflows.routes');
const requestsRouter = require('./requests/requests.routes');

// Initialize Express app
const app = express();

// Trust first proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Request logging
app.use(morgan('combined', { 
    stream: { 
        write: (message) => logger.info(message.trim()) 
    } 
}));

// Enable CORS
app.use(cors({
    origin: config.api.corsOrigins,
    credentials: true
}));

// Rate limiting (disabled for testing)
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//     message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// Body parsing middleware
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use(`${config.api.prefix}/accounts`, accountsRouter);
app.use(`${config.api.prefix}/departments`, departmentsRouter);
app.use(`${config.api.prefix}/employees`, employeesRouter);
app.use(`${config.api.prefix}/workflows`, workflowsRouter);
app.use(`${config.api.prefix}/requests`, requestsRouter);

// Health check endpoint
app.get(`${config.api.prefix}/health`, (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ 
        status: 'error',
        message: 'Not Found',
        path: req.path
    });
});

// Swagger API documentation
if (process.env.NODE_ENV !== 'production') {
    try {
        const swaggerUi = require('swagger-ui-express');
        const YAML = require('yamljs');
        const path = require('path');
        
        const swaggerPath = path.join(__dirname, 'swagger.yaml');
        const swaggerDocument = YAML.load(swaggerPath);
        
        // Ensure docsPath is a string and starts with a forward slash
        const docsPath = config.api.docsPath || '/api-docs';
        const normalizedPath = docsPath.startsWith('/') ? docsPath : `/${docsPath}`;
        
        app.use(normalizedPath, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        logger.info(`API documentation available at ${normalizedPath}`);
    } catch (error) {
        logger.error('Failed to load Swagger documentation:', error);
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle 404
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Global error handler
app.use(errorHandler);

// Start server
const port = config.port;
const server = app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
    logger.info(`Environment: ${config.env}`);
    logger.info(`API Docs: http://localhost:${port}${config.api.docsUrl}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
    });
});

module.exports = server;