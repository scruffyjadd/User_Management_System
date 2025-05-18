// Mock winston logger for testing
const winston = {
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    errors: jest.fn()
  },
  createLogger: jest.fn().mockReturnThis(),
  add: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  http: jest.fn(),
  verbose: jest.fn(),
  debug: jest.fn(),
  silly: jest.fn()
};

module.exports = winston;
