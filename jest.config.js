module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/db/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  // Run tests sequentially to avoid SQLite database locking issues
  // SQLite doesn't handle concurrent writes well, and all tests share the same test.db file
  maxWorkers: 1,
};

