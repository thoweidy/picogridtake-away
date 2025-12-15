# Banking API - Architecture Overview

## 🏗️ System Architecture

This is a **Node.js/Express REST API** for a banking system, built with a **layered architecture** pattern that separates concerns into distinct layers:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                  │
│         (Web, iOS, Android - Future Frontends)          │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/JSON
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Express Server                       │
│                      (server.js)                        │
└────────────────────────────┬────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
        ┌─────────────┐ ┌──────────┐ ┌───────────────┐
        │   Routes    │ │Middleware│ │   Config      │
        │  (API Layer)│ │  (Auth)  │ │  (Env/Swagger)│
        └──────┬──────┘ └──────────┘ └───────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│                    Services Layer                       │
│         (Business Logic & Data Operations)              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Database Layer (Prisma ORM)                │
│                    SQLite Database                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Technology Stack

### Core Technologies
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: SQLite (file-based, no server setup needed)
- **ORM**: Prisma 6.19.1 (type-safe database client)
- **Authentication**: JWT (jsonwebtoken) + bcrypt for password hashing

### Development Tools
- **Testing**: Jest + Supertest
- **Documentation**: Scalar API Reference (OpenAPI 3.0)
- **Environment**: dotenv for configuration
- **Dev Server**: nodemon for auto-reload

---

## 📁 Project Structure

```
banking-api-take-home-qmvkjg/
├── server.js                    # Application entry point
├── package.json                 # Dependencies & scripts
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   ├── migrations/             # Database migration history
│   ├── seed.js                 # Database seeding script
│   └── dev.db                  # SQLite database file
├── src/
│   ├── config/
│   │   ├── envValidation.js    # Environment variable validation
│   │   └── swagger.js          # OpenAPI specification
│   ├── db/
│   │   └── client.js           # Prisma client singleton
│   ├── middleware/
│   │   └── authenticates.js    # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── account.js          # Account management routes
│   │   ├── transfer.js         # Transfer routes
│   │   └── docs.js             # API documentation route
│   └── services/
│       ├── authService.js      # Authentication business logic
│       ├── accountService.js   # Account operations
│       └── transferService.js  # Transfer operations
└── tests/
    ├── routes/                 # Route integration tests
    └── services/              # Service unit tests
```

---

## 🔄 Request Flow

### 1. **Authentication Flow** (Login)

```
Client Request
    │
    ▼
POST /api/auth/login
    │
    ▼
auth.js (route handler)
    │
    ▼
authService.login()
    │
    ├─► Prisma: Find employee by username
    ├─► bcrypt: Compare password hash
    ├─► JWT: Generate token
    │
    ▼
Response: { token, employee }
```

### 2. **Protected Route Flow** (e.g., Create Account)

```
Client Request + Bearer Token
    │
    ▼
POST /api/accounts
    │
    ▼
authenticates.js (middleware)
    │
    ├─► Extract token from Authorization header
    ├─► JWT: Verify token signature & expiration
    ├─► Attach employee info to req.employee
    │
    ▼
account.js (route handler)
    │
    ├─► Validate request body
    │
    ▼
accountService.createAccount()
    │
    ├─► Prisma: Verify customer exists
    ├─► Validate initialDeposit > 0
    ├─► Prisma: Create account record
    │
    ▼
Response: Account object
```

### 3. **Transfer Flow** (Most Complex)

```
Client Request + Bearer Token
    │
    ▼
POST /api/transfers
    │
    ▼
authenticates.js (middleware) → Verify token
    │
    ▼
transfer.js (route handler)
    │
    ├─► Validate request body
    │
    ▼
transferService.accountTransfer()
    │
    ▼
Prisma Transaction (ATOMIC):
    ├─► Check source account exists
    ├─► Check destination account exists
    ├─► Validate amount > 0
    ├─► Validate fromAccountId ≠ toAccountId
    ├─► Check sufficient balance
    ├─► Decrement source account balance
    ├─► Increment destination account balance
    ├─► Create transfer record
    │
    ▼
Response: Transfer + Updated accounts
```

**Key Point**: The entire transfer operation happens inside a Prisma transaction, ensuring **atomicity** - either all operations succeed or all fail (no partial transfers).

---

## 🗄️ Database Schema & Relationships

### Models

#### 1. **Customer**
```prisma
model Customer {
  id        Int       @id @default(autoincrement())
  name      String
  accounts  Account[]  // One-to-many relationship
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

#### 2. **Account**
```prisma
model Account {
  id             Int        @id @default(autoincrement())
  customerId     Int
  balance        Float      @default(0)
  customer       Customer   @relation(...)  // Many-to-one
  sentTransfers  Transfer[] @relation("fromAccount")  // One-to-many
  recvdTransfers Transfer[] @relation("toAccount")     // One-to-many
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
}
```

#### 3. **Transfer**
```prisma
model Transfer {
  id            Int      @id @default(autoincrement())
  fromAccountId Int
  toAccountId   Int
  amount        Float
  fromAccount   Account  @relation("fromAccount", ...)  // Many-to-one
  toAccount     Account  @relation("toAccount", ...)     // Many-to-one
  timestamp     DateTime @default(now())
}
```

#### 4. **Employee**
```prisma
model Employee {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String   // bcrypt hashed
  name      String
  role      String   @default("teller")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Relationship Diagram

```
Customer (1) ──────< (Many) Account
                              │
                              │ (Many)
                              ├───< Transfer (fromAccount)
                              │
                              │ (Many)
                              └───< Transfer (toAccount)
```

**Key Relationships:**
- **Customer → Account**: One customer can have multiple accounts
- **Account → Transfer**: One account can send/receive multiple transfers
- **Transfer**: Links two accounts (fromAccount and toAccount)

---

## 🔐 Authentication & Security

### JWT Token Structure
```javascript
{
  employeeId: 1,
  username: "employee1",
  role: "teller"
}
```

### Security Features
1. **Password Hashing**: bcrypt with salt rounds (10)
2. **JWT Tokens**: Signed with secret, 24h expiration
3. **Bearer Token Auth**: All protected routes require `Authorization: Bearer <token>`
4. **Environment Variables**: Sensitive data (JWT_SECRET) stored in `.env`
5. **Input Validation**: All endpoints validate required fields and data types

### Middleware Protection
```javascript
// Applied to all account and transfer routes
router.use(authenticate)  // Checks token before route handlers
```

---

## 🛣️ API Endpoints

### Public Endpoints
- `POST /api/auth/login` - Employee login (returns JWT token)

### Protected Endpoints (Require Bearer Token)

#### Account Management
- `POST /api/accounts` - Create new account with initial deposit
- `GET /api/accounts/:id` - Get account balance
- `GET /api/accounts/:id/transfers` - Get transfer history

#### Transfers
- `POST /api/transfers` - Transfer funds between accounts

### API Documentation
- `GET /api-docs` - Interactive API documentation (Scalar UI)

---

## 💼 Service Layer Responsibilities

### **authService.js**
- `login(username, password)`: Authenticate employee and generate JWT token
- Validates credentials against database
- Returns token and employee info (without password)

### **accountService.js**
- `createAccount(customerId, initialDeposit)`: Create new account
  - Validates customer exists
  - Validates initialDeposit > 0
  - Creates account record
- `getBalance(accountId)`: Retrieve account balance
  - Validates account exists
  - Returns balance

### **transferService.js**
- `accountTransfer(fromAccountId, toAccountId, amount)`: Execute transfer
  - **Uses Prisma transaction for atomicity**
  - Validates both accounts exist
  - Validates amount > 0
  - Validates fromAccountId ≠ toAccountId
  - Checks sufficient balance
  - Updates both account balances
  - Creates transfer record
  - All operations are atomic (all-or-nothing)
- `getTransferHistory(accountId)`: Get all transfers for an account
  - Returns both sent and received transfers
  - Includes related account and customer information
  - Sorted by timestamp (newest first)

---

## 🔄 Data Flow Examples

### Example 1: Creating an Account

```
1. Client sends: POST /api/accounts
   {
     "customerId": 1,
     "initialDeposit": 1000.00
   }
   Headers: { Authorization: "Bearer <token>" }

2. Middleware validates token → req.employee populated

3. Route validates: customerId and initialDeposit present

4. Service layer:
   - Prisma: SELECT * FROM Customer WHERE id = 1
   - Validate: initialDeposit > 0
   - Prisma: INSERT INTO Account (customerId, balance) VALUES (1, 1000.00)

5. Response: 201 Created
   {
     "id": 1,
     "customerId": 1,
     "balance": 1000.00,
     "createdAt": "2024-01-15T10:30:00.000Z"
   }
```

### Example 2: Transferring Funds

```
1. Client sends: POST /api/transfers
   {
     "fromAccountId": 1,
     "toAccountId": 2,
     "amount": 250.00
   }
   Headers: { Authorization: "Bearer <token>" }

2. Middleware validates token

3. Route validates: all fields present

4. Service layer (INSIDE TRANSACTION):
   a. SELECT * FROM Account WHERE id = 1  (source)
   b. SELECT * FROM Account WHERE id = 2  (destination)
   c. Validate: amount > 0
   d. Validate: fromAccountId ≠ toAccountId
   e. Validate: source.balance >= amount
   f. UPDATE Account SET balance = balance - 250 WHERE id = 1
   g. UPDATE Account SET balance = balance + 250 WHERE id = 2
   h. INSERT INTO Transfer (fromAccountId, toAccountId, amount) VALUES (1, 2, 250)

5. Transaction commits (all operations succeed together)

6. Response: 201 Created
   {
     "transfer": { id: 1, fromAccountId: 1, toAccountId: 2, amount: 250.00, ... },
     "fromAccount": { id: 1, balance: 750.00, ... },
     "toAccount": { id: 2, balance: 1250.00, ... }
   }
```

**Critical**: If any step fails (e.g., insufficient funds), the entire transaction rolls back - no partial updates occur.

---

## 🧪 Testing Strategy

### Test Structure
```
tests/
├── routes/
│   ├── auth.test.js          # Authentication endpoint tests
│   └── account.test.js        # Account endpoint integration tests
└── services/
    ├── authService.test.js    # Auth service unit tests
    ├── accountService.test.js # Account service unit tests
    └── transferService.test.js # Transfer service unit tests
```

### Test Coverage
- **Unit Tests**: Service layer business logic
- **Integration Tests**: Full API endpoint workflows
- **Authentication Tests**: Login, token validation, protected routes
- **Edge Cases**: Invalid inputs, missing data, error scenarios

### Test Database
- Uses separate test database (`prisma/test.db`)
- Database reset before each test suite
- Seeded with test data

---

## 🔧 Configuration & Environment

### Environment Variables (`.env`)
```bash
DATABASE_URL="file:./dev.db"        # SQLite database path
JWT_SECRET="your-secret-key-here"   # JWT signing secret (min 32 chars)
JWT_EXPIRE_IN="24h"                  # Token expiration
PORT=3000                            # Server port
```

### Environment Validation
- `envValidation.js` validates required variables on startup
- Provides helpful error messages if missing
- Sets defaults for optional variables

---

## 📚 API Documentation

### Scalar API Reference
- **URL**: `http://localhost:3000/api-docs`
- **Format**: OpenAPI 3.0 specification
- **Features**:
  - Interactive "Try It Out" functionality
  - Request/response examples
  - Authentication support (Bearer token)
  - Schema definitions

### Documentation Structure
- Authentication endpoints
- Account management endpoints
- Transfer endpoints
- Error response formats
- Request/response schemas

---

## 🎯 Key Design Decisions

### 1. **Layered Architecture**
- **Separation of Concerns**: Routes handle HTTP, Services handle business logic
- **Maintainability**: Easy to modify one layer without affecting others
- **Testability**: Services can be tested independently

### 2. **Prisma ORM**
- **Type Safety**: Auto-generated TypeScript types (if using TS)
- **Migrations**: Version-controlled database schema
- **Relationships**: Easy to define and query relationships
- **Transactions**: Built-in support for atomic operations

### 3. **SQLite Database**
- **Simplicity**: No database server setup required
- **File-based**: Easy to backup and reset
- **Perfect for Development**: Fast, lightweight, sufficient for take-home

### 4. **JWT Authentication**
- **Stateless**: No server-side session storage needed
- **Scalable**: Works across multiple servers
- **Standard**: Industry-standard authentication method

### 5. **Transaction-Based Transfers**
- **Atomicity**: All-or-nothing guarantee
- **Data Integrity**: Prevents race conditions and partial updates
- **Consistency**: Account balances always accurate

### 6. **Service Layer Pattern**
- **Reusability**: Business logic can be reused across different interfaces
- **Testability**: Easy to unit test business logic
- **Single Responsibility**: Each service handles one domain

---

## 🚀 Startup Sequence

1. **Load Environment Variables** (`dotenv`)
2. **Validate Environment** (`envValidation.js`)
   - Check required variables
   - Set defaults for optional variables
3. **Initialize Express App**
4. **Configure Middleware**
   - JSON body parser
5. **Register Routes**
   - `/api-docs` - Documentation
   - `/api/auth` - Authentication (public)
   - `/api/accounts` - Account management (protected)
   - `/api/transfers` - Transfers (protected)
6. **Start Server** (listen on PORT)

---

## 🔍 Error Handling

### Error Response Format
```json
{
  "errorMessage": "Descriptive error message"
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created (account/transfer created)
- **400**: Bad Request (validation errors, business logic errors)
- **401**: Unauthorized (missing/invalid token)
- **404**: Not Found (account/customer doesn't exist)
- **500**: Internal Server Error (unexpected errors)

### Error Handling Flow
1. **Route Layer**: Validates request format, calls service
2. **Service Layer**: Validates business rules, throws errors
3. **Route Layer**: Catches errors, maps to appropriate HTTP status
4. **Response**: Returns consistent error format

---

## 📊 Database Operations

### Prisma Client Usage
```javascript
// Singleton pattern - one instance shared across app
const prisma = require('./db/client')

// Example queries:
await prisma.customer.findUnique({ where: { id } })
await prisma.account.create({ data: { customerId, balance } })
await prisma.$transaction(async (tx) => { /* atomic operations */ })
```

### Transaction Example
```javascript
// All operations succeed or all fail
await prisma.$transaction(async (tx) => {
  const fromAccount = await tx.account.findUnique({ where: { id: fromId } })
  // ... validations ...
  await tx.account.update({ where: { id: fromId }, data: { balance: { decrement: amount } } })
  await tx.account.update({ where: { id: toId }, data: { balance: { increment: amount } } })
  return await tx.transfer.create({ data: { fromAccountId, toAccountId, amount } })
})
```

---

## 🎓 Best Practices Implemented

1. ✅ **Separation of Concerns**: Routes, Services, Database layers
2. ✅ **Error Handling**: Consistent error responses
3. ✅ **Input Validation**: All endpoints validate inputs
4. ✅ **Security**: Password hashing, JWT tokens, environment variables
5. ✅ **Database Transactions**: Atomic operations for transfers
6. ✅ **Documentation**: OpenAPI spec with interactive UI
7. ✅ **Testing**: Unit and integration tests
8. ✅ **Code Organization**: Clear folder structure
9. ✅ **Environment Configuration**: Validation and defaults
10. ✅ **RESTful Design**: Standard HTTP methods and status codes

---

## 🔄 Future Enhancements (Not Implemented)

Potential improvements for production:
- **Employee tracking & audit trail** - Track which employee created accounts/executed transfers (See `FUTURE_ENHANCEMENT_EMPLOYEE_TRACKING.md` for implementation guide)
- Role-based access control (RBAC) using employee roles
- Rate limiting
- Request logging/monitoring
- Database connection pooling (Prisma handles this)
- API versioning
- Pagination for transfer history
- Audit logging (comprehensive audit trail system)
- Webhook support
- GraphQL alternative API

---

## 📝 Summary

This banking API follows a **clean, layered architecture** with:
- **Express** for HTTP handling
- **Prisma** for database operations
- **JWT** for authentication
- **Service layer** for business logic
- **Transaction-based** transfers for data integrity
- **Comprehensive testing** and documentation

The architecture is designed to be:
- **Maintainable**: Clear separation of concerns
- **Testable**: Services can be tested independently
- **Scalable**: Stateless authentication, service layer pattern
- **Secure**: Password hashing, JWT tokens, input validation
- **Reliable**: Atomic transactions ensure data consistency

