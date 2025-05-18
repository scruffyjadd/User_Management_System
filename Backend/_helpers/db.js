
const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');

module.exports = db = {};

initialize().catch(err => {
    console.error('Failed to initialize database:');
    console.error(err);
    process.exit(1);
});

async function initialize() {
    console.log('Initializing database...');
    const { host, port, user, password, database } = config.database;
    
    try {
        // Initialize Sequelize without database first to check server connection
        console.log('Initializing Sequelize...');
        const tempSequelize = new Sequelize('', user, password, {
            host,
            port,
            dialect: 'mysql',
            logging: console.log,
            define: {
                timestamps: true,
                underscored: true
            },
            dialectOptions: {
                multipleStatements: true
            },
            retry: {
                max: 3,
                timeout: 30000 // 30 seconds
            }
        });

        // Create database if it doesn't exist
        console.log('Checking database...');
        await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await tempSequelize.close();

        // Reconnect with the database specified
        const sequelize = new Sequelize(database, user, password, {
            host,
            port,
            dialect: 'mysql',
            logging: console.log,
            define: {
                timestamps: true,
                underscored: true
            },
            retry: {
                max: 3,
                timeout: 30000 // 30 seconds
            }
        });

        // Test the connection
        console.log('Testing database connection...');
        await sequelize.authenticate();
        console.log('Database connection successful!');

        // Initialize models
        console.log('Initializing models...');
        
        // Core authentication models
        db.Account = require('../accounts/account.model')(sequelize);
        db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
        
        // Employee management models
        db.Department = require('../employees/department.model')(sequelize);
        db.Employee = require('../employees/employee.model')(sequelize);
        
        // Workflow models
        db.Workflow = require('../workflows/workflow.model')(sequelize);
        
        // Request models
        const { Request, RequestItem } = require('../requests/request.model')(sequelize);
        db.Request = Request;
        db.RequestItem = RequestItem;

        // Define relationships
        // Authentication
        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
        db.RefreshToken.belongsTo(db.Account);
        
        // Employee relationships
        db.Account.hasOne(db.Employee, { foreignKey: 'accountId', onDelete: 'CASCADE' });
        db.Employee.belongsTo(db.Account, { foreignKey: 'accountId' });
        db.Department.hasMany(db.Employee, { foreignKey: 'departmentId' });
        db.Employee.belongsTo(db.Department, { foreignKey: 'departmentId' });
        
        // Workflow relationships
        db.Employee.hasMany(db.Workflow, { foreignKey: 'employeeId' });
        db.Workflow.belongsTo(db.Employee, { foreignKey: 'employeeId' });
        db.Workflow.belongsTo(db.Account, { as: 'initiatedBy', foreignKey: 'initiatedById' });
        db.Workflow.belongsTo(db.Account, { as: 'approvedBy', foreignKey: 'approvedById' });
        
        // Request relationships
        db.Employee.hasMany(db.Request, { foreignKey: 'requestedById' });
        db.Request.belongsTo(db.Employee, { foreignKey: 'requestedById' });
        db.Request.belongsTo(db.Account, { as: 'approvedBy', foreignKey: 'approvedById' });
        db.Request.hasMany(db.RequestItem, { foreignKey: 'requestId' });
        db.RequestItem.belongsTo(db.Request, { foreignKey: 'requestId' });

        // Sync all models
        console.log('Syncing database...');
        await sequelize.sync({ alter: true });
        console.log('Database sync completed successfully!');
        
    } catch (error) {
        console.error('Database initialization failed:');
        console.error('Error details:', error.message);
        if (error.original) {
            console.error('Original error:', error.original);
        }
        throw error;
    }
}

