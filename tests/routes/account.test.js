const request = require('supertest');
const express = require('express');
const accountRoutes = require('../../src/routes/account');
const prisma = require('../../src/db/client');
const accountService = require('../../src/services/accountService');
const authService = require('../../src/services/authService');

const app = express();
app.use(express.json());
app.use('/api/account', accountRoutes);

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

  describe('POST /api/account/createaccount', () => {
    test('should return 401 when no authentication token provided', async () => {
      // Get a valid customerId for this test
      const customer = await prisma.customer.findFirst();
      const testCustomerId = customer ? customer.id : customerId;
      
      const response = await request(app)
        .put('/api/account/createaccount')
        .send({
          customerId: testCustomerId,
          initialDeposit: 1000
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should create account with valid data', async () => {
      const response = await request(app)
        .put('/api/account/createaccount')
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

    test('should return 400 when customerId is missing', async () => {
      const response = await request(app)
        .put('/api/account/createaccount')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          initialDeposit: 1000
        });

      expect(response.status).toBe(400);
      expect(response.body.errorMessage).toContain('required');
    });

    test('should return 400 when initialDeposit is missing', async () => {
      const response = await request(app)
        .put('/api/account/createaccount')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId
        });

      expect(response.status).toBe(400);
      expect(response.body.errorMessage).toContain('required');
    });

    test('should return 404 when customer does not exist', async () => {
      const response = await request(app)
        .put('/api/account/createaccount')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: 99999,
          initialDeposit: 1000
        });

      expect(response.status).toBe(404);
      expect(response.body.errorMessage).toBe('Customer not found');
    });

    test('should return 400 when initialDeposit is invalid', async () => {
      const response = await request(app)
        .put('/api/account/createaccount')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId,
          initialDeposit: 0
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/account/getbalance', () => {
    beforeEach(async () => {
      const account = await accountService.createAccount(customerId, 500);
      accountId = account.id;
    });

    test('should return balance for valid account', async () => {
      const response = await request(app)
        .post('/api/account/getbalance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountId
        });

      expect(response.status).toBe(200);
      expect(response.body.accountId).toBe(accountId);
      expect(response.body.balance).toBe(500);
    });

    test('should return 400 when accountId is missing', async () => {
      const response = await request(app)
        .post('/api/account/getbalance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.errorMessage).toContain('required');
    });

    test('should return 404 when account does not exist', async () => {
      const response = await request(app)
        .post('/api/account/getbalance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountId: 99999
        });

      expect(response.status).toBe(404);
      expect(response.body.errorMessage).toBe('Account not found');
    });
  });

  describe('PUT /api/account/transfer', () => {
    let fromAccountId;
    let toAccountId;

    beforeEach(async () => {
      const account1 = await accountService.createAccount(customerId, 1000);
      const account2 = await accountService.createAccount(customerId, 500);
      fromAccountId = account1.id;
      toAccountId = account2.id;
    });

    test('should transfer funds successfully', async () => {
      const response = await request(app)
        .put('/api/account/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fromAccountId,
          toAccountId,
          transferAmount: 250
        });

      expect(response.status).toBe(201);
      expect(response.body.transfer).toBeDefined();
      expect(response.body.transfer.amount).toBe(250);
    });

    test('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .put('/api/account/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fromAccountId,
          toAccountId
        });

      expect(response.status).toBe(400);
      expect(response.body.errorMessage).toContain('required');
    });

    test('should return 404 when source account does not exist', async () => {
      const response = await request(app)
        .put('/api/account/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fromAccountId: 99999,
          toAccountId,
          transferAmount: 100
        });

      expect(response.status).toBe(404);
    });

    test('should return 400 when insufficient funds', async () => {
      const response = await request(app)
        .put('/api/account/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fromAccountId,
          toAccountId,
          transferAmount: 2000
        });

      expect(response.status).toBe(400);
      expect(response.body.errorMessage).toBe('Insufficient funds');
    });
  });

  describe('GET /api/account/transfer-history/:accountId', () => {
    let accountId;

    beforeEach(async () => {
      const account = await accountService.createAccount(customerId, 1000);
      accountId = account.id;
    });

    test('should return transfer history', async () => {
      // Create a transfer first
      const account2 = await accountService.createAccount(customerId, 500);
      const transferService = require('../../src/services/transferService');
      await transferService.accountTransfer(accountId, account2.id, 100);

      const response = await request(app)
        .get(`/api/account/transfer-history/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('should return 400 when accountId is not a number', async () => {
      const response = await request(app)
        .get('/api/account/transfer-history/abc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.errorMessage).toContain('valid number');
    });

    test('should return 404 when account does not exist', async () => {
      const response = await request(app)
        .get('/api/account/transfer-history/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.errorMessage).toBe('Account not found');
    });
  });
});

