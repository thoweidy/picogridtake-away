# Testing Guide - How to Write and Modify Tests

This guide will help you understand the testing structure and write new tests or modify existing ones **without AI assistance**.

---

## 📋 Table of Contents

1. [Test Structure Overview](#test-structure-overview)
2. [Test Setup & Configuration](#test-setup--configuration)
3. [Writing Service Tests (Unit Tests)](#writing-service-tests-unit-tests)
4. [Writing Route Tests (Integration Tests)](#writing-route-tests-integration-tests)
5. [Common Patterns & Examples](#common-patterns--examples)
6. [Test Templates](#test-templates)
7. [Running Tests](#running-tests)
8. [Debugging Tests](#debugging-tests)

---

## 🏗️ Test Structure Overview

### Test File Organization

```
tests/
├── setup.js                    # Global test setup (runs before all tests)
├── routes/
│   ├── auth.test.js           # Authentication route tests
│   └── account.test.js         # Account route tests
└── services/
    ├── authService.test.js     # Auth service unit tests
    ├── accountService.test.js  # Account service unit tests
    └── transferService.test.js # Transfer service unit tests
```

### Test Types

1. **Service Tests (Unit Tests)**: Test business logic in isolation
   - Located in `tests/services/`
   - Test individual functions
   - Don't test HTTP layer

2. **Route Tests (Integration Tests)**: Test full HTTP endpoints
   - Located in `tests/routes/`
   - Test complete request/response cycle
   - Include authentication, validation, error handling

---

## ⚙️ Test Setup & Configuration

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'node',           // Node.js environment
  testMatch: ['**/tests/**/*.test.js'],  // Test file pattern
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],  // Run setup.js before tests
  testTimeout: 10000,                // 10 second timeout per test
  maxWorkers: 1,                     // Run tests sequentially (SQLite limitation)
};
```

### Test Setup (`tests/setup.js`)

**What it does:**
- Sets up test database (`test.db`)
- Configures environment variables
- Cleans database before each test
- Seeds test data (customers, employees)

**Key Points:**
- Runs `beforeEach` - cleans and seeds data before each test
- Runs `beforeAll` - runs migrations
- Runs `afterAll` - disconnects Prisma

**You don't need to modify this file** - it handles all test database setup automatically.

---

## 🔧 Writing Service Tests (Unit Tests)

### Basic Structure

```javascript
const serviceName = require('../../src/services/serviceName');
const prisma = require('../../src/db/client');

describe('Service Name', () => {
  // Variables shared across tests
  let customerId;
  let accountId;

  // Runs before each test
  beforeEach(async () => {
    // Setup test data
    const customer = await prisma.customer.findFirst();
    customerId = customer.id;
  });

  describe('functionName', () => {
    test('should do something when conditions are met', async () => {
      // Arrange: Set up test data
      const input = 100;
      
      // Act: Call the function
      const result = await serviceName.functionName(input);
      
      // Assert: Check the result
      expect(result).toBeDefined();
      expect(result.someProperty).toBe(expectedValue);
    });

    test('should throw error when invalid input', async () => {
      // Test error cases
      await expect(
        serviceName.functionName(invalidInput)
      ).rejects.toThrow('Error message');
    });
  });
});
```

### Real Example: `accountService.test.js`

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
    // ✅ Happy path test
    test('should create account with valid customer and initial deposit', async () => {
      const initialDeposit = 1000.50;
      
      const account = await accountService.createAccount(customerId, initialDeposit);

      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
      expect(account.customerId).toBe(customerId);
      expect(account.balance).toBe(initialDeposit);
    });

    // ❌ Error case test
    test('should throw error when customer does not exist', async () => {
      const invalidCustomerId = 99999;
      const initialDeposit = 100;

      await expect(
        accountService.createAccount(invalidCustomerId, initialDeposit)
      ).rejects.toThrow('Customer not found');
    });
  });
});
```

### Key Patterns for Service Tests

#### 1. **Happy Path Test**
```javascript
test('should do something successfully', async () => {
  const result = await service.function(input);
  
  expect(result).toBeDefined();
  expect(result.property).toBe(expectedValue);
});
```

#### 2. **Error Test**
```javascript
test('should throw error when condition fails', async () => {
  await expect(
    service.function(invalidInput)
  ).rejects.toThrow('Error message');
});
```

#### 3. **Data Validation Test**
```javascript
test('should validate input data', async () => {
  await expect(
    service.function(negativeValue)
  ).rejects.toThrow('Validation error message');
});
```

#### 4. **Database State Test**
```javascript
test('should update database correctly', async () => {
  await service.function(input);
  
  // Verify database state
  const record = await prisma.model.findUnique({ where: { id } });
  expect(record.property).toBe(expectedValue);
});
```

---

## 🌐 Writing Route Tests (Integration Tests)

### Basic Structure

```javascript
const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes/routeName');
const prisma = require('../../src/db/client');
const authService = require('../../src/services/authService');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/endpoint', routes);

describe('Route Name', () => {
  let authToken;
  let testDataId;

  beforeEach(async () => {
    // Get authentication token
    const loginResult = await authService.login('employee1', 'password123');
    authToken = loginResult.token;
    
    // Setup test data
    const data = await prisma.model.findFirst();
    testDataId = data.id;
  });

  describe('POST /api/endpoint', () => {
    test('should return 201 when request is valid', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          field1: 'value1',
          field2: 'value2'
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.field1).toBe('value1');
    });

    test('should return 401 when no token provided', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .send({ field1: 'value1' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });
});
```

### Real Example: `account.test.js`

```javascript
const request = require('supertest');
const express = require('express');
const accountRoutes = require('../../src/routes/account');
const authService = require('../../src/services/authService');

const app = express();
app.use(express.json());
app.use('/api/accounts', accountRoutes);

describe('Account Routes', () => {
  let customerId;
  let authToken;

  beforeEach(async () => {
    // Get customer
    const customer = await prisma.customer.findFirst();
    customerId = customer.id;
    
    // Get auth token
    const loginResult = await authService.login('employee1', 'password123');
    authToken = loginResult.token;
  });

  describe('POST /api/accounts', () => {
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
      expect(response.body.balance).toBe(1000);
    });
  });
});
```

### Key Patterns for Route Tests

#### 1. **Successful Request Test**
```javascript
test('should return success status with valid data', async () => {
  const response = await request(app)
    .post('/api/endpoint')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ field: 'value' });

  expect(response.status).toBe(201);  // or 200
  expect(response.body.property).toBe(expectedValue);
});
```

#### 2. **Authentication Test**
```javascript
test('should return 401 when no token provided', async () => {
  const response = await request(app)
    .post('/api/endpoint')
    .send({ field: 'value' });

  expect(response.status).toBe(401);
  expect(response.body.error).toBeDefined();
});
```

#### 3. **Validation Error Test**
```javascript
test('should return 400 when required field is missing', async () => {
  const response = await request(app)
    .post('/api/endpoint')
    .set('Authorization', `Bearer ${authToken}`)
    .send({});  // Missing required field

  expect(response.status).toBe(400);
  expect(response.body.errorMessage).toContain('required');
});
```

#### 4. **Not Found Test**
```javascript
test('should return 404 when resource does not exist', async () => {
  const response = await request(app)
    .get('/api/endpoint/99999')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.status).toBe(404);
  expect(response.body.errorMessage).toBe('Resource not found');
});
```

#### 5. **Business Logic Error Test**
```javascript
test('should return 400 when business rule violated', async () => {
  const response = await request(app)
    .post('/api/transfers')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      fromAccountId: 1,
      toAccountId: 2,
      amount: 10000  // Insufficient funds
    });

  expect(response.status).toBe(400);
  expect(response.body.errorMessage).toBe('Insufficient funds');
});
```

---

## 📝 Common Patterns & Examples

### Pattern 1: Testing with Authentication

**Always get auth token in `beforeEach`:**

```javascript
beforeEach(async () => {
  const loginResult = await authService.login('employee1', 'password123');
  authToken = loginResult.token;
});
```

**Use token in requests:**
```javascript
.set('Authorization', `Bearer ${authToken}`)
```

### Pattern 2: Testing Error Cases

**Service level (throws error):**
```javascript
await expect(
  service.function(invalidInput)
).rejects.toThrow('Error message');
```

**Route level (returns error status):**
```javascript
const response = await request(app)
  .post('/api/endpoint')
  .set('Authorization', `Bearer ${authToken}`)
  .send(invalidData);

expect(response.status).toBe(400);
expect(response.body.errorMessage).toBe('Error message');
```

### Pattern 3: Testing Database State

```javascript
test('should update database correctly', async () => {
  // Perform action
  await service.function(input);
  
  // Verify database
  const record = await prisma.model.findUnique({ where: { id } });
  expect(record.property).toBe(expectedValue);
});
```

### Pattern 4: Testing Arrays

```javascript
test('should return array of items', async () => {
  const result = await service.getItems();
  
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThan(0);
  expect(result[0]).toHaveProperty('expectedProperty');
});
```

### Pattern 5: Testing with Multiple Accounts/Entities

```javascript
beforeEach(async () => {
  // Create multiple test entities
  const account1 = await accountService.createAccount(customerId, 1000);
  const account2 = await accountService.createAccount(customerId, 500);
  account1Id = account1.id;
  account2Id = account2.id;
});
```

---

## 📋 Test Templates

### Template 1: New Service Test File

```javascript
const serviceName = require('../../src/services/serviceName');
const prisma = require('../../src/db/client');

describe('Service Name', () => {
  let customerId;  // or other test data

  beforeEach(async () => {
    // Setup test data
    const customer = await prisma.customer.findFirst();
    customerId = customer.id;
  });

  describe('functionName', () => {
    test('should do something successfully', async () => {
      const result = await serviceName.functionName(customerId, input);
      
      expect(result).toBeDefined();
      expect(result.property).toBe(expectedValue);
    });

    test('should throw error when input is invalid', async () => {
      await expect(
        serviceName.functionName(customerId, invalidInput)
      ).rejects.toThrow('Error message');
    });
  });
});
```

### Template 2: New Route Test File

```javascript
const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes/routeName');
const prisma = require('../../src/db/client');
const authService = require('../../src/services/authService');

const app = express();
app.use(express.json());
app.use('/api/endpoint', routes);

describe('Route Name', () => {
  let authToken;
  let testDataId;

  beforeEach(async () => {
    // Get auth token
    const loginResult = await authService.login('employee1', 'password123');
    authToken = loginResult.token;
    
    // Setup test data
    const data = await prisma.model.findFirst();
    testDataId = data.id;
  });

  describe('POST /api/endpoint', () => {
    test('should return 201 with valid data', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ field: 'value' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .send({ field: 'value' });

      expect(response.status).toBe(401);
    });

    test('should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});  // Missing required fields

      expect(response.status).toBe(400);
    });
  });
});
```

### Template 3: Adding Test to Existing File

```javascript
// Add new test inside existing describe block

describe('existingFunction', () => {
  // ... existing tests ...

  // ✅ ADD YOUR NEW TEST HERE
  test('should handle new edge case', async () => {
    const result = await service.existingFunction(newInput);
    
    expect(result).toBeDefined();
    expect(result.property).toBe(expectedValue);
  });
});
```

---

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- tests/services/accountService.test.js
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Single Test
```bash
npm test -- -t "should create account with valid customer"
```

---

## 🐛 Debugging Tests

### 1. **Check Test Output**
Look for error messages in the console:
```
Expected: "value"
Received: "different value"
```

### 2. **Add Console Logs** (Temporary)
```javascript
test('should do something', async () => {
  const result = await service.function(input);
  console.log('Result:', result);  // Debug output
  expect(result).toBeDefined();
});
```

### 3. **Check Database State**
```javascript
test('should update database', async () => {
  await service.function(input);
  
  // Check what's in database
  const record = await prisma.model.findUnique({ where: { id } });
  console.log('Database record:', record);
  
  expect(record.property).toBe(expectedValue);
});
```

### 4. **Common Issues**

**Issue: "Customer not found"**
- **Solution**: Check `beforeEach` is creating test data
- **Check**: `setup.js` seeds customers before each test

**Issue: "Unauthorized"**
- **Solution**: Make sure you're getting auth token in `beforeEach`
- **Check**: Token is set in request headers

**Issue: "Database locked"**
- **Solution**: Tests run sequentially (`maxWorkers: 1` in jest.config.js)
- **Check**: Don't run multiple test files simultaneously

**Issue: Test data persists between tests**
- **Solution**: `setup.js` cleans database in `beforeEach`
- **Check**: Make sure cleanup runs before each test

---

## ✅ Checklist for Writing New Tests

### Service Test Checklist
- [ ] Import the service module
- [ ] Import Prisma client
- [ ] Set up `describe` block with service name
- [ ] Set up `beforeEach` to get test data (customer, etc.)
- [ ] Write happy path test
- [ ] Write error case tests
- [ ] Test all validation rules
- [ ] Test edge cases (zero, negative, null, etc.)

### Route Test Checklist
- [ ] Import `supertest` and `express`
- [ ] Import route module
- [ ] Create Express app and mount routes
- [ ] Set up `beforeEach` to get auth token
- [ ] Test successful request (200/201)
- [ ] Test authentication (401 without token)
- [ ] Test validation errors (400)
- [ ] Test not found (404)
- [ ] Test business logic errors (400)

---

## 📚 Example: Adding a New Test Case

### Scenario: Add test for "transfer with exact balance"

**Step 1: Open the test file**
```bash
# Open transferService.test.js
```

**Step 2: Find the right describe block**
```javascript
describe('accountTransfer', () => {
  // Existing tests here...
});
```

**Step 3: Add your test**
```javascript
describe('accountTransfer', () => {
  // ... existing tests ...

  test('should transfer when balance equals amount exactly', async () => {
    // Create account with exact balance
    const account = await accountService.createAccount(customerId, 100);
    const account2 = await accountService.createAccount(customerId, 0);
    
    // Transfer exact balance
    const result = await transferService.accountTransfer(
      account.id, 
      account2.id, 
      100  // Exact balance
    );
    
    // Verify transfer succeeded
    expect(result).toBeDefined();
    expect(result.fromAccount.balance).toBe(0);
    expect(result.toAccount.balance).toBe(100);
  });
});
```

**Step 4: Run the test**
```bash
npm test -- tests/services/transferService.test.js
```

---

## 🎯 Quick Reference

### Jest Matchers (Most Common)

```javascript
// Equality
expect(value).toBe(expected);           // Strict equality (===)
expect(value).toEqual(expected);        // Deep equality

// Truthiness
expect(value).toBeDefined();
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Numbers
expect(value).toBeGreaterThan(number);
expect(value).toBeLessThan(number);

// Strings
expect(string).toContain(substring);
expect(string).toMatch(/regex/);

// Arrays
expect(Array.isArray(value)).toBe(true);
expect(array).toHaveLength(number);
expect(array).toContain(item);

// Objects
expect(object).toHaveProperty('key');
expect(object.property).toBe(value);

// Errors (async)
await expect(promise).rejects.toThrow('Error message');
```

### Supertest Methods

```javascript
// HTTP Methods
request(app).get('/path')
request(app).post('/path')
request(app).put('/path')
request(app).delete('/path')

// Set Headers
.set('Authorization', `Bearer ${token}`)
.set('Content-Type', 'application/json')

// Send Body
.send({ field: 'value' })

// Query Parameters
.query({ param: 'value' })

// Check Response
expect(response.status).toBe(200);
expect(response.body).toBeDefined();
```

---

## 💡 Tips & Best Practices

1. **One Assertion Per Test** (when possible)
   - Makes it clear what failed
   - Easier to debug

2. **Descriptive Test Names**
   - ✅ Good: `'should throw error when customer does not exist'`
   - ❌ Bad: `'test 1'`

3. **Arrange-Act-Assert Pattern**
   ```javascript
   // Arrange: Set up test data
   const input = 100;
   
   // Act: Call the function
   const result = await service.function(input);
   
   // Assert: Check the result
   expect(result).toBeDefined();
   ```

4. **Test Edge Cases**
   - Zero values
   - Negative values
   - Very large values
   - Empty strings
   - Null/undefined

5. **Keep Tests Independent**
   - Each test should work in isolation
   - Don't rely on order of test execution
   - `beforeEach` ensures clean state

6. **Use Meaningful Variables**
   - ✅ `const initialDeposit = 1000;`
   - ❌ `const x = 1000;`

---

## 🔍 Finding What to Test

### Look at the Service/Route Code

1. **Find all error cases** - Test each one
2. **Find all validation rules** - Test each one
3. **Find all success paths** - Test each one
4. **Find edge cases** - Test boundary conditions

### Example: Looking at `accountService.createAccount`

```javascript
async function createAccount (customerId, initialDeposit){
  const customer = await prisma.customer.findUnique({
    where: {id: customerId}
  });
  
  if (!customer) { throw Error ('Customer not found')}  // ✅ Test this
  if (initialDeposit <= 0) { throw Error ('Initial Deposit must be greater Zero')}  // ✅ Test this
  
  const account = await prisma.account.create({...});  // ✅ Test success case
  return account
}
```

**Tests needed:**
1. ✅ Customer not found → error
2. ✅ Initial deposit <= 0 → error
3. ✅ Valid input → success

---

## 🎓 Practice Exercise

Try adding these tests yourself:

1. **Service Test**: Test `getBalance` with account that has zero balance
2. **Route Test**: Test `GET /api/accounts/:id` with invalid token format
3. **Service Test**: Test `getTransferHistory` returns transfers in correct order
4. **Route Test**: Test `POST /api/transfers` with same account ID for from/to

Use the templates above and follow the patterns you see in existing tests!

---

## 📖 Summary

**Key Takeaways:**
- Service tests test business logic directly
- Route tests test HTTP endpoints with supertest
- Always get auth token in `beforeEach` for protected routes
- Use `beforeEach` to set up test data
- Test both success and error cases
- Follow the Arrange-Act-Assert pattern
- Use descriptive test names

**You're ready to write tests!** Use the templates and patterns above, and you can create or modify tests without AI assistance.

