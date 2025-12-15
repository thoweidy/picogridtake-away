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

  describe('getBalance', () => {
    test('should return account balance for existing account', async () => {
      // Create account first
      const account = await accountService.createAccount(customerId, 500);
      
      const balance = await accountService.getBalance(account.id);

      expect(balance).toBeDefined();
      expect(balance.accountId).toBe(account.id);
      expect(balance.balance).toBe(500);
    });

    test('should throw error when account does not exist', async () => {
      const invalidAccountId = 99999;

      await expect(
        accountService.getBalance(invalidAccountId)
      ).rejects.toThrow('Account not found');
    });
  });
});

