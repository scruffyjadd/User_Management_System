require('rootpath')();
const config = require('config/config');
const logger = require('_helpers/logger');
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    
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
    logger.info('Database connection has been established successfully.');

    // Load all model files
    const modelsPath = path.join(__dirname, '..', 'models');
    const modelFiles = fs.readdirSync(modelsPath)
      .filter(file => file.endsWith('.js') && file !== 'index.js');

    // Import and initialize all models
    for (const file of modelFiles) {
      const model = require(path.join(modelsPath, file));
      if (typeof model.associate === 'function') {
        model.associate(sequelize.models);
      }
    }

    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    logger.info('Database synchronized successfully.');
    
    return 0; // Success
  } catch (error) {
    logger.error('Error running migrations:', error);
    return 1; // Error
  }
}

// Run migrations
runMigrations()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    logger.error('Unhandled error during migrations:', error);
    process.exit(1);
  });
