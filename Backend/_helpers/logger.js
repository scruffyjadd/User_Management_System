const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure logs directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const { combine, timestamp, printf, colorize, json } = winston.format;

// Define log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    const text = stack || message;
    return `${timestamp} ${level}: ${text}`;
});

// Default logging configuration
const defaultLoggingConfig = {
    level: 'info',
    colorize: true,
    toFile: false,
    maxSize: '20m',
    maxFiles: '14d'
};

// Merge with config if available
const loggingConfig = config && config.logging ? { ...defaultLoggingConfig, ...config.logging } : defaultLoggingConfig;

// Create logger instance
const logger = winston.createLogger({
    level: loggingConfig.level,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        loggingConfig.colorize ? colorize() : winston.format.simple(),
        loggingConfig.colorize ? logFormat : json()
    ),
    transports: [
        // Console transport
        new winston.transports.Console({
            format: combine(
                loggingConfig.colorize ? colorize() : winston.format.simple(),
                logFormat
            )
        }),
        // Error file transport
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: loggingConfig.maxSize,
            maxFiles: loggingConfig.maxFiles
        }),
        // Combined file transport (if enabled)
        ...(loggingConfig.toFile ? [new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: loggingConfig.maxSize,
            maxFiles: loggingConfig.maxFiles
        })] : [])
    ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            logFormat
        )
    }));
}

// Create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: (message) => {
        // Use the 'info' log level so the output will be picked up by both transports
        logger.info(message.trim());
    }
};

module.exports = logger;
