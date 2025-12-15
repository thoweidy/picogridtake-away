# Testing Breakdown - Step by Step Guide

## Step 1: Test Configuration (`jest.config.js`)

This tells Jest how to run tests:

```javascript
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
```

**What this does:**
- Runs tests in Node environment (not browser)
- Finds all files matching `**/tests/**/*.test.js`
- Uses `tests/setup.js` before running any tests
- Runs tests sequentially (`maxWorkers: 1`) to avoid SQLite locking issues

---

## Step 2: Test Database Setup (`tests/setup.js`)

This creates a separate test database and resets it before each test:

```javascript
// Set test database URL before any modules load
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test.db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_EXPIRE_IN = process.env.JWT_EXPIRE_IN || '24h';

const { PrismaClient } = require('@prisma/client');

// Create a fresh Prisma client for tests
const prisma = new PrismaClient();

beforeAll(async () => {
  // Run migrations on test database
  const { execSync } = require('child_process');
  try {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'ignore'
    });
  } catch (error) {
    // Migrations might already be applied, continue
  }
  
  // Ensure database is ready
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

**What this does:**
- Uses a separate test database (`test.db`) - doesn't touch your dev database
- Sets test environment variables (JWT secret, etc.)
- Runs migrations once before all tests
- Connects/disconnects Prisma client

---

## Step 3: Database Reset Before Each Test

This is the key part—clean state for every test:

```javascript
beforeEach(async () => {
  // Clean database before each test (order matters due to foreign keys)
  // Delete in correct order to respect foreign key constraints
  await prisma.transfer.deleteMany();
  await prisma.account.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.customer.deleteMany();
  
  // Seed test data - ensure customers are created first
  await prisma.customer.createMany({
    data: [
      { name: 'Arisha Barron' },
      { name: 'Branden Gibson' },
      { name: 'Rhonda Church' },
      { name: 'Georgina Hazel' }
    ]
  });
  
  // Verify customers were created
  const customerCount = await prisma.customer.count();
  if (customerCount === 0) {
    throw new Error('Failed to create test customers');
  }

  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('password123', 10);
  // Use upsert to handle case where employee might already exist
  await prisma.employee.upsert({
    where: { username: 'employee1' },
    update: {
      password: hashedPassword,
      name: 'Test Employee',
      role: 'teller'
    },
    create: {
      username: 'employee1',
      password: hashedPassword,
      name: 'Test Employee',
      role: 'teller'
    }
  });
});
```

**What this does:**
- **Cleans all data** before each test (deletes in FK-safe order)
- **Reseeds the same test data** (4 customers, 1 employee)
- Every test starts with identical, clean state
- Ensures tests are isolated and don't affect each other

---

## Step 4: Unit Tests - Service Layer (`accountService.test.js`)

Tests business logic in isolation (no HTTP):

```javascript
const accountService = require('../../src/services/accountService');
const prisma = require('../../src/db/client');

describe('Account Service', () => {
  let customerId;

  beforeEach(async () => {
    // Get first customer for tests
    const customer = await prisma.customer.findFirst();
    customerId = customer.id;
  });

  describe('createAccount', () => {
    test('should create account with valid customer and initial deposit', async () => {
      const initialDeposit = 0.1;
      
      const account = await accountService.createAccount(customerId, initialDeposit);

      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
      expect(account.customerId).toBe(customerId);
      expect(account.balance).toBe(initialDeposit);
    });

    test('should throw error when customer does not exist', async () => {
      const invalidCustomerId = 99999;
      const initialDeposit = 100;

      await expect(
        accountService.createAccount(invalidCustomerId, initialDeposit)
      ).rejects.toThrow('Customer not found');
    });

    test('should throw error when initial deposit is zero', async () => {
      await expect(
        accountService.createAccount(customerId, 0)
      ).rejects.toThrow('Initial Deposit must be greater Zero');
    });

    test('should throw error when initial deposit is negative', async () => {
      await expect(
        accountService.createAccount(customerId, -100)
      ).rejects.toThrow('Initial Deposit must be greater Zero');
    });
  });
```

**What this does:**
- Tests the service function directly (no HTTP involved)
- **Happy path**: Creates account successfully
- **Error cases**: Invalid customer, zero deposit, negative deposit
- Verifies return values and error messages

---

## Step 5: Unit Tests - Transfer Service (Edge Cases)

More complex business logic:

```javascript
    test('should maintain data integrity with concurrent transfers', async () => {
      // This test ensures the transaction prevents race conditions
      const amount = 100;
      const initialBalance1 = (await prisma.account.findUnique({ where: { id: account1Id } })).balance;
      const initialBalance2 = (await prisma.account.findUnique({ where: { id: account2Id } })).balance;

      // Make transfer
      await transferService.accountTransfer(account1Id, account2Id, amount);

      // Verify balances
      const finalAccount1 = await prisma.account.findUnique({ where: { id: account1Id } });
      const finalAccount2 = await prisma.account.findUnique({ where: { id: account2Id } });

      expect(finalAccount1.balance).toBe(initialBalance1 - amount);
      expect(finalAccount2.balance).toBe(initialBalance2 + amount);
    });
```

**What this does:**
- Records balances before transfer
- Makes transfer
- Verifies balances are updated correctly
- Validates transaction integrity

---

## Step 6: Integration Tests - HTTP Routes (`account.test.js`)

Tests the full HTTP request/response cycle:

```javascript
const request = require('supertest');
const express = require('express');
const accountRoutes = require('../../src/routes/account');
const transferRoutes = require('../../src/routes/transfer');
const prisma = require('../../src/db/client');
const accountService = require('../../src/services/accountService');
const authService = require('../../src/services/authService');

const app = express();
app.use(express.json());
app.use('/api/accounts', accountRoutes);
app.use('/api/transfers', transferRoutes);

describe('Account Routes', () => {
  let customerId;
  let accountId;
  let authToken;

  beforeEach(async () => {
    const customer = await prisma.customer.findFirst();
    if (!customer) {
      throw new Error('No customer found in test database. Ensure setup.js seeds customers.');
    }
    customerId = customer.id;
    
    // Get authentication token for protected routes
    const loginResult = await authService.login('employee1', 'password123');
    authToken = loginResult.token;
  });
```

**What this does:**
- Sets up Express app with routes
- Gets auth token for protected routes
- Uses `supertest` to make HTTP requests

Example test:

```javascript
    test('should create account with valid data', async () => {
      const response = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId,
          initialDeposit: 1000
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.customerId).toBe(customerId);
      expect(response.body.balance).toBe(1000);
    });
```

**What this does:**
- Makes HTTP POST request to `/api/accounts`
- Includes Authorization header with token
- Sends JSON body
- Verifies status code (201) and response body

---

## Summary: Testing Strategy Breakdown

1. **Unit Tests (Services)**: Test business logic directly
   - `accountService.test.js` - 6 tests
   - `transferService.test.js` - 12 tests  
   - `authService.test.js` - 4 tests
   - **Total: ~22 unit tests**

2. **Integration Tests (Routes)**: Test full HTTP stack
   - `account.test.js` - 17 tests
   - `auth.test.js` - 5 tests
   - **Total: ~22 integration tests**

3. **Test Setup**: Isolated database
   - Separate `test.db` file
   - Resets before each test
   - Seeds fresh data for every test

---

## Interview Talking Points

1. "I structured tests at two levels: unit tests for business logic, and integration tests for HTTP endpoints."

2. "Each test starts with a clean database—I reset all data before each test and seed fresh test data."

3. "For the transfer service, I tested edge cases like concurrent transfers to ensure transactions work correctly."

4. "I used Supertest for integration tests—it lets me test the full HTTP request/response cycle without running a server."

