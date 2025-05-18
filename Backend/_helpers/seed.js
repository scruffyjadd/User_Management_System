require('rootpath')();
const config = require('config/config');
const logger = require('_helpers/logger');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const path = require('path');

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');
    
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
    logger.info('Database connection established for seeding.');

    // Load models
    const models = require('../models');
    
    // Create default roles if they don't exist
    const [adminRole, userRole] = await Promise.all([
      models.Role.findOrCreate({
        where: { name: 'Admin' },
        defaults: { description: 'Administrator with full access' }
      }),
      models.Role.findOrCreate({
        where: { name: 'User' },
        defaults: { description: 'Regular user with limited access' }
      })
    ]);

    // Create default admin user if it doesn't exist
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [adminUser, created] = await models.User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        isVerified: true,
        roleId: adminRole[0].id
      }
    });

    if (created) {
      logger.info('Created default admin user');
    } else {
      logger.info('Default admin user already exists');
    }

    // Create some sample departments
    const departments = await models.Department.bulkCreate([
      { name: 'Human Resources', description: 'HR Department' },
      { name: 'Information Technology', description: 'IT Department' },
      { name: 'Finance', description: 'Finance Department' },
      { name: 'Operations', description: 'Operations Department' },
      { name: 'Marketing', description: 'Marketing Department' }
    ], { ignoreDuplicates: true });

    logger.info(`Created ${departments.length} departments`);

    // Create some sample employees
    const employees = [];
    const positions = ['Manager', 'Developer', 'Analyst', 'Specialist', 'Coordinator'];
    
    for (let i = 1; i <= 10; i++) {
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const position = positions[Math.floor(Math.random() * positions.length)];
      const hireDate = new Date();
      hireDate.setMonth(hireDate.getMonth() - Math.floor(Math.random() * 60));

      employees.push({
        firstName: `Employee${i}`,
        lastName: `Last${i}`,
        email: `employee${i}@example.com`,
        position: position,
        departmentId: dept.id,
        hireDate: hireDate,
        status: 'active'
      });
    }

    await models.Employee.bulkCreate(employees, { ignoreDuplicates: true });
    logger.info(`Created ${employees.length} sample employees`);

    logger.info('Database seeding completed successfully!');
    return 0; // Success
  } catch (error) {
    logger.error('Error seeding database:', error);
    return 1; // Error
  }
}

// Run seed
seedDatabase()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    logger.error('Unhandled error during seeding:', error);
    process.exit(1);
  });
