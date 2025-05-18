const { ValidationError } = require('sequelize');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');

// Custom error classes
class BadRequestError extends Error {
    constructor(message = 'Bad Request', code = 'BAD_REQUEST') {
        super(message);
        this.status = 400;
        this.code = code;
        this.name = 'BadRequestError';
    }
}

class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
        super(message);
        this.status = 401;
        this.code = code;
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends Error {
    constructor(message = 'Forbidden', code = 'FORBIDDEN') {
        super(message);
        this.status = 403;
        this.code = code;
        this.name = 'ForbiddenError';
    }
}

class NotFoundError extends Error {
    constructor(message = 'Not Found', code = 'NOT_FOUND') {
        super(message);
        this.status = 404;
        this.code = code;
        this.name = 'NotFoundError';
    }
}

class ConflictError extends Error {
    constructor(message = 'Conflict', code = 'CONFLICT') {
        super(message);
        this.status = 409;
        this.code = code;
        this.name = 'ConflictError';
    }
}

class InternalServerError extends Error {
    constructor(message = 'Internal Server Error', code = 'INTERNAL_SERVER_ERROR') {
        super(message);
        this.status = 500;
        this.code = code;
        this.name = 'InternalServerError';
    }
}

/**
 * Error handling middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
    // Log error details
    console.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        user: req.user ? req.user.id : 'unauthenticated'
    });

    // Handle Sequelize validation errors
    if (err instanceof ValidationError) {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message,
            type: e.type,
            value: e.value
        }));
        
        return res.status(400).json({
            status: 'error',
            message: 'Validation Error',
            errors
        });
    }

    // Handle JWT errors
    if (err instanceof JsonWebTokenError) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid authentication token',
            code: 'INVALID_TOKEN'
        });
    }

    // Handle token expiration
    if (err instanceof TokenExpiredError) {
        return res.status(401).json({
            status: 'error',
            message: 'Authentication token has expired',
            code: 'TOKEN_EXPIRED'
        });
    }

    // Handle custom error types
    if (err instanceof BadRequestError ||
        err instanceof UnauthorizedError ||
        err instanceof ForbiddenError ||
        err instanceof NotFoundError ||
        err instanceof ConflictError ||
        err instanceof InternalServerError) {
        return res.status(err.status).json({
            status: 'error',
            message: err.message,
            code: err.code,
            ...(err.errors && { errors: err.errors })
        });
    }

    // Handle 404 errors
    if (err.status === 404) {
        return res.status(404).json({
            status: 'error',
            message: 'The requested resource was not found',
            code: 'NOT_FOUND'
        });
    }

    // Handle rate limiting errors
    if (err.status === 429) {
        return res.status(429).json({
            status: 'error',
            message: 'Too many requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED'
        });
    }

    // Default error response for unhandled errors
    const errorResponse = {
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : err.message,
        code: err.code || 'INTERNAL_SERVER_ERROR'
    };

    // Include stack trace in development
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = err.stack;
        errorResponse.details = {
            name: err.name,
            ...(err.errors && { errors: err.errors })
        };
    }

    res.status(err.status || 500).json(errorResponse);
}

module.exports = {
    errorHandler,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError
};