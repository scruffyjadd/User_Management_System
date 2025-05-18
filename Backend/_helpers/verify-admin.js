const path = require('path');
const config = require(path.join(__dirname, '..', 'config.json'));
const logger = require(path.join(__dirname, 'logger'));
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

async function verifyAdminAccount() {
    try {
        logger.info('Starting admin account verification...');
        
        // Create a connection to the database
        const sequelize = new Sequelize({
            dialect: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'your_password_here',
            database: 'user_management',
            logging: false
        });

        // Test the connection
        await sequelize.authenticate();
        logger.info('Database connection established successfully.');

        // Define the Account model
        const Account = sequelize.define('Account', {
            email: { type: DataTypes.STRING, allowNull: false },
            passwordHash: { type: DataTypes.STRING, allowNull: false },
            title: { type: DataTypes.STRING, allowNull: false },
            firstName: { type: DataTypes.STRING, allowNull: false },
            lastName: { type: DataTypes.STRING, allowNull: false },
            acceptTerms: { type: DataTypes.BOOLEAN },
            role: { type: DataTypes.STRING, allowNull: false },
            verificationToken: { type: DataTypes.STRING },
            verified: { type: DataTypes.DATE },
            resetToken: { type: DataTypes.STRING },
            resetTokenExpires: { type: DataTypes.DATE },
            passwordReset: { type: DataTypes.DATE },
            created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updated: { type: DataTypes.DATE }
        });

        // Find the admin account
        const adminAccount = await Account.findOne({
            where: { role: 'Admin' }
        });

        if (!adminAccount) {
            logger.error('No admin account found in the database.');
            return 1;
        }

        logger.info(`Found admin account: ${adminAccount.email}`);

        // Verify the account by setting the verified field
        await adminAccount.update({
            verified: new Date(),
            verificationToken: null
        });

        logger.info('Admin account has been successfully verified.');
        return 0;
    } catch (error) {
        logger.error('Error verifying admin account:', error);
        return 1;
    }
}

// Run the verification
verifyAdminAccount()
    .then(exitCode => {
        process.exit(exitCode);
    })
    .catch(error => {
        logger.error('Verification failed:', error);
        process.exit(1);
    });
