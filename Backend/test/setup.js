// Global test setup
process.env.NODE_ENV = 'test';

// Set test environment variables
process.env.PORT = '4000';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRATION = '1h';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.LOG_LEVEL = 'debug';
process.env.LOG_TO_FILE = 'false';
process.env.EMAIL_FROM = 'noreply@test.com';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASSWORD = 'testpass';
process.env.API_PREFIX = '/api';
process.env.CORS_ORIGINS = 'http://localhost:3000';

// Mock console methods to keep test output clean
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();

// Setup mocks
jest.mock('winston', () => require('./__mocks__/winston'));

// Mock config module
jest.mock('config', () => ({
  ...require('./__mocks__/config'),
  // Override specific config values if needed
}));

// Mock database models
jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Employee: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Department: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  },
  Role: {
    findOne: jest.fn(),
    findAll: jest.fn()
  },
  sequelize: {
    transaction: jest.fn().mockImplementation(callback => {
      return Promise.resolve(callback({}));
    })
  }
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  verify: jest.fn().mockReturnValue({ id: 1, role: 'Admin' })
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock email service
jest.mock('../services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

// Add any global test setup here
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterAll(async () => {
  // Cleanup code that runs after all tests
  jest.restoreAllMocks();
});

// Global test timeout
jest.setTimeout(30000); // 30 seconds
