const Role = require('_helpers/role');
const { ForbiddenError } = require('_helpers/error-types');

// Authorization middleware for role-based access control
function authorize(roles = []) {
    // Convert single role to array if needed
    if (typeof roles === 'string') {
        roles = [roles];
    }

    // Return middleware function
    return [
        // Authenticate JWT and attach user to request
        (req, res, next) => {
            // Check if user is authenticated
            if (!req.user) {
                throw new ForbiddenError('Authentication required');
            }

            // If no roles specified, any authenticated user can access
            if (roles.length === 0) {
                return next();
            }

            // Check if user has required role
            if (roles.length && !roles.includes(req.user.role)) {
                // User's role is not authorized
                throw new ForbiddenError('Not authorized to access this resource');
            }

            // Authentication and authorization successful
            next();
        }
    ];
}

module.exports = {
    authorize
};
