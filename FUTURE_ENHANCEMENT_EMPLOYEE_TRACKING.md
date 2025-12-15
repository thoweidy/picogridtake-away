# Future Enhancement: Employee Tracking & Audit Trail

## 📋 Overview

This document outlines how to add employee tracking to the banking API. Currently, the system authenticates employees but doesn't track which employee performed specific actions (creating accounts, transferring funds, etc.). This enhancement will add audit trail capabilities.

---

## 🎯 Goal

Track which employee performed each action:
- Which employee created each account
- Which employee executed each transfer
- Enable audit trails for compliance and accountability

---

## 📝 Implementation Steps

### Step 1: Update Database Schema (`prisma/schema.prisma`)

Add `employeeId` fields to track who performed actions:

```prisma
model Account {
  id                 Int        @id @default(autoincrement())
  customerId         Int
  balance            Float      @default(0)
  createdByEmployeeId Int?      // NEW: Track who created the account
  customer           Customer   @relation(fields: [customerId], references: [id])
  sentTransfers      Transfer[] @relation("fromAccount")
  recvdTransfers     Transfer[] @relation("toAccount")
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt
  createdByEmployee  Employee?  @relation(fields: [createdByEmployeeId], references: [id]) // NEW

  @@index([customerId])
  @@index([createdByEmployeeId]) // NEW: Index for queries
}

model Transfer {
  id            Int      @id @default(autoincrement())
  fromAccountId Int
  toAccountId   Int
  amount        Float
  executedByEmployeeId Int?  // NEW: Track who executed the transfer
  fromAccount   Account  @relation("fromAccount", fields: [fromAccountId], references: [id])
  toAccount     Account  @relation("toAccount", fields: [toAccountId], references: [id])
  executedByEmployee Employee? @relation(fields: [executedByEmployeeId], references: [id]) // NEW
  timestamp     DateTime @default(now())

  @@index([fromAccountId])
  @@index([toAccountId])
  @@index([executedByEmployeeId]) // NEW: Index for queries
}

model Employee {
  id Int @id @default(autoincrement())
  username String @unique
  password String
  name String
  role String @default("teller")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdAccounts Account[] // NEW: Track accounts created by this employee
  executedTransfers Transfer[] // NEW: Track transfers executed by this employee

  @@index([username])
}
```

**Note:** Fields are nullable (`Int?`) to handle existing data during migration. After migration, you might want to make them required for new records.

---

### Step 2: Create Database Migration

```bash
npm run db:migrate
# This will prompt you for a migration name, use: "add_employee_tracking"
```

Or manually:

```bash
npx prisma migrate dev --name add_employee_tracking
```

---

### Step 3: Update Service Layer

#### `src/services/accountService.js`

Update `createAccount` to accept and store `employeeId`:

```javascript
async function createAccount(customerId, initialDeposit, employeeId) {
    
    const customer = await prisma.customer.findUnique({
        where: {id: customerId}
    })

    if (!customer) { throw Error ('Customer not found')}
    if (initialDeposit <= 0) { throw Error ('Initial Deposit must be greater Zero')}

    const account = await prisma.account.create({
        data: {
            customerId,
            balance: initialDeposit,
            createdByEmployeeId: employeeId  // NEW: Store employee ID
        }
    })
    
    return account
}
```

#### `src/services/transferService.js`

Update `accountTransfer` to accept and store `employeeId`:

```javascript
async function accountTransfer(fromAccountId, toAccountId, amount, employeeId) {
    
    if (amount <= 0) { 
        throw new Error("Transfer amount must be positive and more than Zero")
    }

    if (fromAccountId === toAccountId) {
        throw new Error("Cannot transfer to the same account")
    }

    const result = await prisma.$transaction(async (tx) => {
        // ... existing validation code ...

        // Create transfer record with employee tracking
        const transfer = await tx.transfer.create({
            data: {
                fromAccountId,
                toAccountId,
                amount,
                executedByEmployeeId: employeeId  // NEW: Store employee ID
            }
        })

        return {
            transfer,
            fromAccount: updatedFromAccount,
            toAccount: updatedToAccount
        }
    })

    return result
}
```

---

### Step 4: Update Route Handlers

#### `src/routes/account.js`

Pass `req.employee.employeeId` to the service:

```javascript
// POST /api/accounts - Create a new bank account
router.post('/', async (req, res) => {
    const { customerId, initialDeposit } = req.body
    const employeeId = req.employee.employeeId  // NEW: Get employee ID from JWT

    if (!customerId || !initialDeposit) {
        return res.status(400).json({ errorMessage: "CustomerID and Initial Deposit are required" })
    }

    try {
        // NEW: Pass employeeId to service
        const results = await accountService.createAccount(customerId, initialDeposit, employeeId)
        return res.status(201).json(results)
    } catch (error) {
        // ... existing error handling ...
    }
})
```

#### `src/routes/transfer.js`

Pass `req.employee.employeeId` to the service:

```javascript
// POST /api/transfers - Transfer funds between accounts
router.post('/', async (req, res) => {
    const { fromAccountId, toAccountId, amount } = req.body
    const employeeId = req.employee.employeeId  // NEW: Get employee ID from JWT

    if (!fromAccountId || !toAccountId || !amount) {
        return res.status(400).json({ errorMessage: "fromAccountId, toAccountId, and amount are required fields" })
    }
    try {
        // NEW: Pass employeeId to service
        const results = await transferService.accountTransfer(fromAccountId, toAccountId, amount, employeeId)
        return res.status(201).json(results)
    } catch (error) {
        // ... existing error handling ...
    }
})
```

---

### Step 5: Update Transfer History to Include Employee Info

#### `src/services/transferService.js`

Update `getTransferHistory` to include employee information:

```javascript
async function getTransferHistory(accountId) {
    
    const account = await prisma.account.findUnique({
        where: { id: accountId }
    })

    if (!account) {
        throw new Error("Account not found")
    }

    const transfers = await prisma.transfer.findMany({
        where: {
            OR: [
                { fromAccountId: accountId },
                { toAccountId: accountId }
            ]
        },
        orderBy: {
            timestamp: 'desc'
        },
        include: {
            fromAccount: {
                select: {
                    id: true,
                    customer: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            toAccount: {
                select: {
                    id: true,
                    customer: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            executedByEmployee: {  // NEW: Include employee info
                select: {
                    id: true,
                    username: true,
                    name: true,
                    role: true
                }
            }
        }
    })

    return transfers
}
```

---

### Step 6: Update Tests

#### `tests/services/accountService.test.js`

Update tests to include `employeeId`:

```javascript
test('should create account with valid customer and initial deposit', async () => {
    const initialDeposit = 0.1;
    const employeeId = 1;  // NEW: Add employee ID
    
    const account = await accountService.createAccount(customerId, initialDeposit, employeeId);

    expect(account).toBeDefined();
    expect(account.id).toBeDefined();
    expect(account.customerId).toBe(customerId);
    expect(account.balance).toBe(initialDeposit);
    expect(account.createdByEmployeeId).toBe(employeeId);  // NEW: Verify employee ID is stored
});
```

#### `tests/services/transferService.test.js`

Update tests to include `employeeId`:

```javascript
test('should transfer funds between accounts successfully', async () => {
    const amount = 250;
    const employeeId = 1;  // NEW: Add employee ID

    const result = await transferService.accountTransfer(account1Id, account2Id, amount, employeeId);

    expect(result).toBeDefined();
    expect(result.transfer).toBeDefined();
    expect(result.transfer.amount).toBe(amount);
    expect(result.transfer.executedByEmployeeId).toBe(employeeId);  // NEW: Verify employee ID is stored
    // ... rest of assertions ...
});
```

#### `tests/routes/account.test.js`

The `req.employee` is already set up in your test setup, so routes should automatically use it. Just verify the employee ID is stored in the response:

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
    expect(response.body.createdByEmployeeId).toBeDefined();  // NEW: Verify employee ID is stored
    // ... rest of assertions ...
});
```

---

### Step 7: Update API Documentation (`src/config/swagger.js`)

Update response schemas to include employee information:

```javascript
TransferHistoryItem: {
    // ... existing fields ...
    executedByEmployee: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' }
        }
    }
}
```

---

## 🧪 Testing Checklist

- [ ] Migration runs successfully
- [ ] Account creation stores `createdByEmployeeId`
- [ ] Transfer execution stores `executedByEmployeeId`
- [ ] Transfer history includes employee information
- [ ] All existing tests still pass (after updating them)
- [ ] New tests verify employee tracking works
- [ ] API documentation updated

---

## 🎯 Bonus Features (Optional)

1. **Employee Activity Report**: Add endpoint to get all actions by a specific employee
   ```
   GET /api/employees/:id/activity
   ```

2. **Account Creation History**: Track who created accounts in account details
   ```
   GET /api/accounts/:id (include createdByEmployee info)
   ```

3. **Required vs Optional**: After migration, make employee fields required for new records

4. **Backfill Existing Data**: If you want to track historical data, you could add a script to backfill with a "system" or "unknown" employee ID

---

## 📚 Interview Talking Points

When implementing this:

1. **Why it matters**: "For a banking system, audit trails are critical for compliance, security, and accountability. This allows us to track which employee performed each action."

2. **Design decision**: "I made the employee fields nullable initially to handle existing data during migration. In production, I'd backfill historical records or make them required for new records."

3. **Testing**: "I updated both unit and integration tests to verify employee tracking works correctly, ensuring the audit trail is reliable."

4. **API enhancement**: "The transfer history now includes employee information, so users can see who executed each transfer, improving transparency."

---

## 🔍 Verification Steps

After implementation, verify:

1. Create an account → Check database for `createdByEmployeeId`
2. Execute a transfer → Check database for `executedByEmployeeId`
3. Get transfer history → Verify employee info is included in response
4. Run all tests → Ensure everything still works

---

Good luck with your practice implementation! 🚀

