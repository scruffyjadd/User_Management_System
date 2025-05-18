require('rootpath')();
const config = require('config.json');
const logger = require('_helpers/logger');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

async function verifyAccount(email) {
    try {
        logger.info('Starting account verification...');
        
        // Create a connection to the database
        const sequelize = new Sequelize({
            dialect: 'mysql',
            host: config.database.host,
            port: config.database.port,
            username: config.database.username,
            password: config.database.password,
            database: config.database.database,
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

        // Sync the model
        await Account.sync({ alter: true });

        // Find the account
        const account = await Account.findOne({ where: { email } });
        
        if (!account) {
            logger.error(`Account not found: ${email}`);
            return 1;
        }

        logger.info(`Found account: ${email}`);
        logger.info('Verifying account...');

        // Verify the account
        await account.update({
            verified: new Date(),
            verificationToken: null
        });

        logger.info('Account verified successfully.');
        return 0;
    } catch (error) {
        logger.error('Error verifying account:', error);
        return 1;
    }
}

// Run the verification
verifyAccount('your-email@example.com')  // Replace with your actual email
    .then(exitCode => {
        process.exit(exitCode);
    })
    .catch(error => {
        logger.error('Verification failed:', error);
        process.exit(1);
    });
