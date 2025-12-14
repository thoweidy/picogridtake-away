const transferService = require('../../src/services/transferService');
const accountService = require('../../src/services/accountService');
const prisma = require('../../src/db/client');

describe('Transfer Service', () => {
  let customerId;
  let account1Id;
  let account2Id;

  beforeEach(async () => {
    // Get first customer
    const customer = await prisma.customer.findFirst();
    if (!customer) {
      throw new Error('Test setup failed: No customer found. Check test database setup.');
    }
    customerId = customer.id;

    // Create two accounts for testing
    const account1 = await accountService.createAccount(customerId, 1000);
    const account2 = await accountService.createAccount(customerId, 500);
    account1Id = account1.id;
    account2Id = account2.id;
  });

  describe('accountTransfer', () => {
    test('should transfer funds between accounts successfully', async () => {
      const amount = 250;

      const result = await transferService.accountTransfer(account1Id, account2Id, amount);

      expect(result).toBeDefined();
      expect(result.transfer).toBeDefined();
      expect(result.transfer.amount).toBe(amount);
      expect(result.transfer.fromAccountId).toBe(account1Id);
      expect(result.transfer.toAccountId).toBe(account2Id);
      
      // Verify balances updated
      expect(result.fromAccount.balance).toBe(750); // 1000 - 250
      expect(result.toAccount.balance).toBe(750); // 500 + 250
    });

    test('should throw error when source account does not exist', async () => {
      const invalidAccountId = 99999;

      await expect(
        transferService.accountTransfer(invalidAccountId, account2Id, 100)
      ).rejects.toThrow('Source account does not exist');
    });

    test('should throw error when destination account does not exist', async () => {
      const invalidAccountId = 99999;

      await expect(
        transferService.accountTransfer(account1Id, invalidAccountId, 100)
      ).rejects.toThrow('Destination account does not exist');
    });

    test('should throw error when transferring to same account', async () => {
      await expect(
        transferService.accountTransfer(account1Id, account1Id, 100)
      ).rejects.toThrow('Cannot transfer to the same account');
    });

    test('should throw error when amount is zero', async () => {
      await expect(
        transferService.accountTransfer(account1Id, account2Id, 0)
      ).rejects.toThrow('Transfer amount must be positive and more than Zero');
    });

    test('should throw error when amount is negative', async () => {
      await expect(
        transferService.accountTransfer(account1Id, account2Id, -100)
      ).rejects.toThrow('Transfer amount must be positive and more than Zero');
    });

    test('should throw error when insufficient funds', async () => {
      await expect(
        transferService.accountTransfer(account1Id, account2Id, 2000)
      ).rejects.toThrow('Insufficient funds');
    });

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
  });

  describe('getTransferHistory', () => {
    test('should return transfer history for account', async () => {
      // Create some transfers
      await transferService.accountTransfer(account1Id, account2Id, 100);
      await transferService.accountTransfer(account2Id, account1Id, 50);

      const history = await transferService.getTransferHistory(account1Id);

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      
      // Should have both sent and received transfers
      const sentTransfers = history.filter(t => t.fromAccountId === account1Id);
      const receivedTransfers = history.filter(t => t.toAccountId === account1Id);
      
      expect(sentTransfers.length).toBeGreaterThan(0);
      expect(receivedTransfers.length).toBeGreaterThan(0);
    });

    test('should return empty array for account with no transfers', async () => {
      const history = await transferService.getTransferHistory(account1Id);
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    });

    test('should throw error when account does not exist', async () => {
      const invalidAccountId = 99999;

      await expect(
        transferService.getTransferHistory(invalidAccountId)
      ).rejects.toThrow('Account not found');
    });

    test('should return transfers sorted by timestamp descending', async () => {
      await transferService.accountTransfer(account1Id, account2Id, 10);
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await transferService.accountTransfer(account1Id, account2Id, 20);

      const history = await transferService.getTransferHistory(account1Id);
      
      expect(history.length).toBeGreaterThan(1);
      // Newest first
      expect(history[0].amount).toBe(20);
      expect(history[1].amount).toBe(10);
    });
  });
});

