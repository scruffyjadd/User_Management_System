const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        jwt({ secret, algorithms: ['HS256'] }),

        async (req, res, next) => {
            const account = await db.Account.findByPk(req.user.id);

            console.log("req.user.id:", req.user.id); // Log the user's ID from the JWT
            console.log("req.params.id:", req.params.id); // Log the ID from the URL

            if (!account) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Check if user is authorized to update the account
            if (roles.length && !roles.includes(account.role)) {
                // If roles are specified, check if the user has the required role
                return res.status(401).json({ message: 'Unauthorized - Role mismatch' });
            }

            // Check if the user is updating their own account (if not admin)
            if (req.params.id && parseInt(req.params.id) !== req.user.id && account.role !== 'Admin') {
                return res.status(401).json({ message: 'Unauthorized - Cannot update other users' });
            }

            req.user.role = account.role;
            req.user.ownsToken = token => {
                if (!account.refreshTokens) {
                    return false;
                }
                return !!account.refreshTokens.find(x => x.token === token);
            };
            next();
        }
    ];
}