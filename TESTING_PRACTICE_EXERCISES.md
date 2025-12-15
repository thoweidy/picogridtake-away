# Testing Practice Exercises

Practice writing tests yourself! Try these exercises without AI assistance.

---

## 🎯 Exercise 1: Service Test - Zero Balance Account

**Task**: Add a test to `accountService.test.js` that verifies `getBalance` works correctly when an account has zero balance.

**Location**: `tests/services/accountService.test.js`

**Hint**: Create an account with `initialDeposit: 0`, then call `getBalance` and verify it returns `balance: 0`.

**Solution Template**:
```javascript
test('should return zero balance for account with zero balance', async () => {
  // Your code here
});
```

---

## 🎯 Exercise 2: Route Test - Invalid Token Format

**Task**: Add a test to `account.test.js` that verifies the API returns 401 when an invalid token format is provided (not "Bearer token").

**Location**: `tests/routes/account.test.js`

**Hint**: Send a request with `Authorization: InvalidToken` (without "Bearer " prefix).

**Solution Template**:
```javascript
test('should return 401 when token format is invalid', async () => {
  // Your code here
});
```

---

## 🎯 Exercise 3: Service Test - Transfer Exact Balance

**Task**: Add a test to `transferService.test.js` that verifies a transfer succeeds when the amount equals the account balance exactly.

**Location**: `tests/services/transferService.test.js`

**Hint**: Create account with balance 100, transfer exactly 100, verify balance becomes 0.

**Solution Template**:
```javascript
test('should transfer successfully when amount equals balance exactly', async () => {
  // Your code here
});
```

---

## 🎯 Exercise 4: Route Test - Transfer to Same Account

**Task**: Add a test to `account.test.js` that verifies the API returns 400 when trying to transfer to the same account.

**Location**: `tests/routes/account.test.js` (in the POST /api/transfers describe block)

**Hint**: Use the same account ID for both `fromAccountId` and `toAccountId`.

**Solution Template**:
```javascript
test('should return 400 when transferring to same account', async () => {
  // Your code here
});
```

---

## 🎯 Exercise 5: Service Test - Transfer History Ordering

**Task**: Add a test to `transferService.test.js` that verifies `getTransferHistory` returns transfers sorted by timestamp (newest first).

**Location**: `tests/services/transferService.test.js`

**Hint**: Create multiple transfers with small delays, then check the order of results.

**Solution Template**:
```javascript
test('should return transfers sorted by timestamp descending', async () => {
  // Your code here
});
```

---

## 🎯 Exercise 6: Route Test - Missing All Fields

**Task**: Add a test to `account.test.js` that verifies creating an account returns 400 when all fields are missing.

**Location**: `tests/routes/account.test.js` (in the POST /api/accounts describe block)

**Hint**: Send an empty object `{}` in the request body.

**Solution Template**:
```javascript
test('should return 400 when all fields are missing', async () => {
  // Your code here
});
```

---

## 🎯 Exercise 7: Service Test - Multiple Accounts for Customer

**Task**: Add a test to `accountService.test.js` that verifies a customer can have multiple accounts.

**Location**: `tests/services/accountService.test.js`

**Hint**: Create two accounts for the same customer, verify both exist and have different IDs.

**Solution Template**:
```javascript
test('should allow customer to have multiple accounts', async () => {
  // Your code here
});
```

---

## 🎯 Exercise 8: Route Test - Invalid Account ID Format

**Task**: Add a test to `account.test.js` that verifies getting balance returns 400 when account ID is not a number (e.g., "abc").

**Location**: `tests/routes/account.test.js` (in the GET /api/accounts/:id describe block)

**Hint**: Use a non-numeric string in the URL path.

**Solution Template**:
```javascript
test('should return 400 when accountId is not numeric', async () => {
  // Your code here
});
```

---

## 🎯 Exercise 9: Service Test - Transfer History Includes Both Directions

**Task**: Add a test to `transferService.test.js` that verifies `getTransferHistory` includes both sent and received transfers.

**Location**: `tests/services/transferService.test.js`

**Hint**: Create transfers where account1 sends to account2, and account2 sends to account1. Then check account1's history includes both.

**Solution Template**:
```javascript
test('should include both sent and received transfers in history', async () => {
  // Your code here
});
```

---

## 🎯 Exercise 10: Route Test - Expired Token

**Task**: Add a test to `account.test.js` that verifies the API returns 401 when using an expired token.

**Location**: `tests/routes/account.test.js`

**Hint**: You'll need to create a token with a very short expiration (1ms), wait, then use it.

**Solution Template**:
```javascript
test('should return 401 when token is expired', async () => {
  // Your code here
  // Hint: Use jwt.sign with expiresIn: '1ms'
});
```

---

## 📝 How to Practice

1. **Pick an exercise** (start with Exercise 1)
2. **Open the relevant test file**
3. **Find the right `describe` block**
4. **Write your test** following the patterns from existing tests
5. **Run the test**: `npm test -- tests/services/accountService.test.js`
6. **Fix any errors** and iterate
7. **Move to the next exercise**

---

## ✅ Self-Check Questions

After writing each test, ask yourself:

1. ✅ Does the test name clearly describe what it tests?
2. ✅ Did I set up test data in `beforeEach` if needed?
3. ✅ Did I get an auth token for route tests?
4. ✅ Are my assertions checking the right things?
5. ✅ Does the test follow the Arrange-Act-Assert pattern?
6. ✅ Can this test run independently (doesn't rely on other tests)?

---

## 🎓 Solutions (Try First, Then Check!)

<details>
<summary>Exercise 1 Solution</summary>

```javascript
test('should return zero balance for account with zero balance', async () => {
  const account = await accountService.createAccount(customerId, 0);
  
  const balance = await accountService.getBalance(account.id);
  
  expect(balance).toBeDefined();
  expect(balance.accountId).toBe(account.id);
  expect(balance.balance).toBe(0);
});
```

</details>

<details>
<summary>Exercise 2 Solution</summary>

```javascript
test('should return 401 when token format is invalid', async () => {
  const response = await request(app)
    .post('/api/accounts')
    .set('Authorization', 'InvalidToken')
    .send({
      customerId,
      initialDeposit: 1000
    });

  expect(response.status).toBe(401);
  expect(response.body.error).toBeDefined();
});
```

</details>

<details>
<summary>Exercise 3 Solution</summary>

```javascript
test('should transfer successfully when amount equals balance exactly', async () => {
  const account = await accountService.createAccount(customerId, 100);
  const account2 = await accountService.createAccount(customerId, 0);
  
  const result = await transferService.accountTransfer(account.id, account2.id, 100);
  
  expect(result).toBeDefined();
  expect(result.fromAccount.balance).toBe(0);
  expect(result.toAccount.balance).toBe(100);
});
```

</details>

<details>
<summary>Exercise 4 Solution</summary>

```javascript
test('should return 400 when transferring to same account', async () => {
  const account = await accountService.createAccount(customerId, 1000);
  
  const response = await request(app)
    .post('/api/transfers')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      fromAccountId: account.id,
      toAccountId: account.id,
      amount: 100
    });

  expect(response.status).toBe(400);
  expect(response.body.errorMessage).toContain('same account');
});
```

</details>

<details>
<summary>Exercise 5 Solution</summary>

```javascript
test('should return transfers sorted by timestamp descending', async () => {
  await transferService.accountTransfer(account1Id, account2Id, 10);
  await new Promise(resolve => setTimeout(resolve, 10));
  await transferService.accountTransfer(account1Id, account2Id, 20);
  await new Promise(resolve => setTimeout(resolve, 10));
  await transferService.accountTransfer(account1Id, account2Id, 30);

  const history = await transferService.getTransferHistory(account1Id);
  
  expect(history.length).toBeGreaterThan(2);
  // Newest first (largest amount was last)
  expect(history[0].amount).toBe(30);
  expect(history[1].amount).toBe(20);
  expect(history[2].amount).toBe(10);
});
```

</details>

<details>
<summary>Exercise 6 Solution</summary>

```javascript
test('should return 400 when all fields are missing', async () => {
  const response = await request(app)
    .post('/api/accounts')
    .set('Authorization', `Bearer ${authToken}`)
    .send({});

  expect(response.status).toBe(400);
  expect(response.body.errorMessage).toContain('required');
});
```

</details>

<details>
<summary>Exercise 7 Solution</summary>

```javascript
test('should allow customer to have multiple accounts', async () => {
  const account1 = await accountService.createAccount(customerId, 1000);
  const account2 = await accountService.createAccount(customerId, 500);
  
  expect(account1.id).toBeDefined();
  expect(account2.id).toBeDefined();
  expect(account1.id).not.toBe(account2.id);
  expect(account1.customerId).toBe(customerId);
  expect(account2.customerId).toBe(customerId);
});
```

</details>

<details>
<summary>Exercise 8 Solution</summary>

```javascript
test('should return 400 when accountId is not numeric', async () => {
  const response = await request(app)
    .get('/api/accounts/abc')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.status).toBe(400);
  expect(response.body.errorMessage).toContain('valid number');
});
```

</details>

<details>
<summary>Exercise 9 Solution</summary>

```javascript
test('should include both sent and received transfers in history', async () => {
  // Account1 sends to Account2
  await transferService.accountTransfer(account1Id, account2Id, 100);
  // Account2 sends to Account1
  await transferService.accountTransfer(account2Id, account1Id, 50);

  const history = await transferService.getTransferHistory(account1Id);
  
  expect(history.length).toBe(2);
  
  const sentTransfers = history.filter(t => t.fromAccountId === account1Id);
  const receivedTransfers = history.filter(t => t.toAccountId === account1Id);
  
  expect(sentTransfers.length).toBe(1);
  expect(receivedTransfers.length).toBe(1);
});
```

</details>

<details>
<summary>Exercise 10 Solution</summary>

```javascript
test('should return 401 when token is expired', async () => {
  const jwt = require('jsonwebtoken');
  const expiredToken = jwt.sign(
    { employeeId: 1, username: 'employee1', role: 'teller' },
    process.env.JWT_SECRET,
    { expiresIn: '1ms' }
  );
  
  // Wait for token to expire
  await new Promise(resolve => setTimeout(resolve, 10));
  
  const response = await request(app)
    .post('/api/accounts')
    .set('Authorization', `Bearer ${expiredToken}`)
    .send({
      customerId,
      initialDeposit: 1000
    });

  expect(response.status).toBe(401);
  expect(response.body.error).toBeDefined();
});
```

</details>

---

## 🎯 Challenge Exercises (Advanced)

### Challenge 1: Test Concurrent Transfers
Write a test that verifies the transaction prevents race conditions when multiple transfers happen simultaneously.

### Challenge 2: Test Transfer History Pagination
If you were to add pagination to transfer history, write tests for:
- First page returns correct number of items
- Second page returns next set of items
- Invalid page number returns error

### Challenge 3: Test Account Balance After Multiple Transfers
Create a test that:
1. Creates an account with 1000
2. Makes 5 transfers out (100 each)
3. Makes 3 transfers in (50 each)
4. Verifies final balance is correct (1000 - 500 + 150 = 650)

---

## 📚 Next Steps

After completing these exercises:

1. ✅ You understand the test structure
2. ✅ You can write service tests
3. ✅ You can write route tests
4. ✅ You know how to test authentication
5. ✅ You know how to test error cases
6. ✅ You're ready for the interview discussion!

**Good luck!** 🚀

