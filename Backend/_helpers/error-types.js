// Base error class
export class BaseError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = this.constructor.name;
        this.status = status || 500;
        this.code = code || 'INTERNAL_SERVER_ERROR';
        Error.captureStackTrace(this, this.constructor);
    }
}

// 400 Bad Request
export class BadRequestError extends BaseError {
    constructor(message = 'Bad Request') {
        super(message, 400, 'BAD_REQUEST');
    }
}

// 401 Unauthorized
export class UnauthorizedError extends BaseError {
    constructor(message = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

// 403 Forbidden
export class ForbiddenError extends BaseError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

// 404 Not Found
export class NotFoundError extends BaseError {
    constructor(message = 'Not Found') {
        super(message, 404, 'NOT_FOUND');
    }
}

// 409 Conflict
export class ConflictError extends BaseError {
    constructor(message = 'Conflict') {
        super(message, 409, 'CONFLICT');
    }
}

// 422 Unprocessable Entity
export class ValidationError extends BaseError {
    constructor(message = 'Validation Error', errors = []) {
        super(message, 422, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

// 500 Internal Server Error
export class InternalServerError extends BaseError {
    constructor(message = 'Internal Server Error') {
        super(message, 500, 'INTERNAL_SERVER_ERROR');
    }
}

// Error handler middleware
export function errorHandler(err, req, res, next) {
    console.error(err);
    
    // Default to 500 Internal Server Error
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'INTERNAL_SERVER_ERROR';
    let errors = err.errors;

    // Handle specific error types
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        status = 422;
        code = 'VALIDATION_ERROR';
        message = 'Validation Error';
        errors = err.errors ? err.errors.map(e => ({
            field: e.path,
            message: e.message
        })) : [];
    } else if (err.name === 'JsonWebTokenError') {
        status = 401;
        code = 'INVALID_TOKEN';
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        status = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Token expired';
    }

    // Send error response
    res.status(status).json({
        status,
        code,
        message,
        errors,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}
