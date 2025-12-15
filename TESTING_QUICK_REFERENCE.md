# Testing Quick Reference - Cheat Sheet

## 🚀 Quick Commands

```bash
npm test                          # Run all tests
npm test -- tests/services/accountService.test.js  # Run specific file
npm test -- -t "test name"        # Run single test
npm run test:watch                # Watch mode
```

---

## 📝 Test File Structure

### Service Test Template
```javascript
const service = require('../../src/services/serviceName');
const prisma = require('../../src/db/client');

describe('Service Name', () => {
  let customerId;

  beforeEach(async () => {
    const customer = await prisma.customer.findFirst();
    customerId = customer.id;
  });

  describe('functionName', () => {
    test('should do something', async () => {
      const result = await service.functionName(customerId, input);
      expect(result).toBeDefined();
    });

    test('should throw error', async () => {
      await expect(
        service.functionName(invalidInput)
      ).rejects.toThrow('Error message');
    });
  });
});
```

### Route Test Template
```javascript
const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes/routeName');
const authService = require('../../src/services/authService');

const app = express();
app.use(express.json());
app.use('/api/endpoint', routes);

describe('Route Name', () => {
  let authToken;

  beforeEach(async () => {
    const loginResult = await authService.login('employee1', 'password123');
    authToken = loginResult.token;
  });

  describe('POST /api/endpoint', () => {
    test('should return 201', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ field: 'value' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
    });
  });
});
```

---

## ✅ Common Jest Matchers

```javascript
// Basic
expect(value).toBe(expected)              // ===
expect(value).toEqual(expected)           // Deep equality
expect(value).toBeDefined()
expect(value).toBeTruthy()
expect(value).toBeFalsy()

// Numbers
expect(number).toBeGreaterThan(5)
expect(number).toBeLessThan(10)

// Strings
expect(string).toContain('substring')
expect(string).toMatch(/regex/)

// Arrays
expect(Array.isArray(value)).toBe(true)
expect(array).toHaveLength(5)
expect(array).toContain(item)

// Objects
expect(object).toHaveProperty('key')
expect(object.key).toBe(value)

// Errors (async)
await expect(promise).rejects.toThrow('Error message')
```

---

## 🌐 Supertest Methods

```javascript
// HTTP Methods
request(app).get('/path')
request(app).post('/path')
request(app).put('/path')
request(app).delete('/path')

// Headers
.set('Authorization', `Bearer ${token}`)
.set('Content-Type', 'application/json')

// Body
.send({ field: 'value' })

// Query Params
.query({ param: 'value' })

// Response Checks
expect(response.status).toBe(200)
expect(response.body).toBeDefined()
expect(response.body.property).toBe(value)
```

---

## 🔐 Authentication Pattern

```javascript
beforeEach(async () => {
  // Get auth token
  const loginResult = await authService.login('employee1', 'password123');
  authToken = loginResult.token;
});

// Use in request
.set('Authorization', `Bearer ${authToken}`)
```

---

## 📊 Database Access Pattern

```javascript
// Get test data
const customer = await prisma.customer.findFirst();
customerId = customer.id;

// Create test data
const account = await accountService.createAccount(customerId, 1000);

// Verify database state
const record = await prisma.account.findUnique({ where: { id } });
expect(record.balance).toBe(1000);
```

---

## 🎯 Common Test Patterns

### 1. Success Test
```javascript
test('should succeed with valid input', async () => {
  const result = await service.function(validInput);
  expect(result).toBeDefined();
  expect(result.property).toBe(expectedValue);
});
```

### 2. Error Test (Service)
```javascript
test('should throw error', async () => {
  await expect(
    service.function(invalidInput)
  ).rejects.toThrow('Error message');
});
```

### 3. Error Test (Route)
```javascript
test('should return 400', async () => {
  const response = await request(app)
    .post('/api/endpoint')
    .set('Authorization', `Bearer ${authToken}`)
    .send(invalidData);

  expect(response.status).toBe(400);
  expect(response.body.errorMessage).toBe('Error message');
});
```

### 4. Authentication Test
```javascript
test('should return 401 without token', async () => {
  const response = await request(app)
    .post('/api/endpoint')
    .send({ field: 'value' });

  expect(response.status).toBe(401);
});
```

### 5. Not Found Test
```javascript
test('should return 404', async () => {
  const response = await request(app)
    .get('/api/endpoint/99999')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.status).toBe(404);
});
```

---

## 📋 HTTP Status Codes

```javascript
200  // OK - Success
201  // Created - Resource created
400  // Bad Request - Validation error
401  // Unauthorized - Missing/invalid token
404  // Not Found - Resource doesn't exist
500  // Internal Server Error
```

---

## 🔍 Test Checklist

### Service Test
- [ ] Import service and prisma
- [ ] Set up beforeEach with test data
- [ ] Test happy path
- [ ] Test error cases
- [ ] Test validation rules

### Route Test
- [ ] Import supertest, express, routes
- [ ] Create Express app
- [ ] Get auth token in beforeEach
- [ ] Test success (200/201)
- [ ] Test auth (401)
- [ ] Test validation (400)
- [ ] Test not found (404)

---

## 🐛 Debugging

```javascript
// Add console.log
console.log('Debug:', result);

// Check database
const record = await prisma.model.findUnique({ where: { id } });
console.log('DB:', record);
```

---

## 📁 File Locations

```
tests/
├── setup.js                    # Global setup (don't modify)
├── routes/
│   ├── auth.test.js
│   └── account.test.js
└── services/
    ├── authService.test.js
    ├── accountService.test.js
    └── transferService.test.js
```

---

## 💡 Quick Tips

1. **Test names**: Use "should..." format
2. **One assertion**: When possible, one per test
3. **Arrange-Act-Assert**: Set up → Execute → Verify
4. **Edge cases**: Test zero, negative, null, empty
5. **Independent tests**: Each test should work alone

---

## 🎯 Common Test Scenarios

### Account Creation
- ✅ Valid customer + deposit
- ❌ Customer doesn't exist
- ❌ Deposit <= 0
- ❌ Missing fields

### Transfer
- ✅ Valid transfer
- ❌ Insufficient funds
- ❌ Same account
- ❌ Account doesn't exist
- ❌ Amount <= 0

### Authentication
- ✅ Valid credentials
- ❌ Invalid username
- ❌ Invalid password
- ❌ Missing fields

---

## 📚 Where to Add Tests

### Adding to Existing File
```javascript
describe('existingFunction', () => {
  // ... existing tests ...

  // ✅ ADD HERE
  test('should handle new case', async () => {
    // Your test
  });
});
```

### Creating New File
1. Create file in `tests/services/` or `tests/routes/`
2. Follow template structure
3. Name file: `serviceName.test.js` or `routeName.test.js`

---

**Keep this handy while writing tests!** 📌

