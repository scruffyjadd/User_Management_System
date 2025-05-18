// Test-specific Jest configuration
module.exports = {
  // Use the same configuration as the root jest.config.js
  ...require('../jest.config'),
  
  // Test environment setup
  testEnvironment: 'node',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  
  // Test match patterns
  testMatch: [
    '**/test/**/*.test.js',
    '**/__tests__/**/*.test.js'
  ],
  
  // Module name mappers
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^config$': '<rootDir>/__mocks__/config.js',
    '^winston$': '<rootDir>/__mocks__/winston.js'
  },
  
  // Coverage settings
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/test/**',
    '!jest.config.js',
    '!**/_helpers/**',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Display individual test results
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
