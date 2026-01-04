module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000, // 30 seconds per test
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/*.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  maxWorkers: 2, // Limit concurrent tests to avoid overwhelming DB
  verbose: true,
};
