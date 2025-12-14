### Objective

Your assignment is to build an internal API for a fake financial institution using Node and Express.

### Brief

While modern banks have evolved to serve a plethora of functions, at their core, banks must provide certain basic features. Today, your task is to build the basic HTTP API for one of those banks! Imagine you are designing a backend API for bank employees. It could ultimately be consumed by multiple frontends (web, iOS, Android etc).

### Tasks

- Implement assignment using:
  - Language: **Node**
  - Framework: **Express**
- There should be API routes that allow them to:
  - Create a new bank account for a customer, with an initial deposit amount. A
    single customer may have multiple bank accounts.
  - Transfer amounts between any two accounts, including those owned by
    different customers.
  - Retrieve balances for a given account.
  - Retrieve transfer history for a given account.
- Write tests for your business logic

Feel free to pre-populate your customers with the following:

```json
[
  {
    "id": 1,
    "name": "Arisha Barron"
  },
  {
    "id": 2,
    "name": "Branden Gibson"
  },
  {
    "id": 3,
    "name": "Rhonda Church"
  },
  {
    "id": 4,
    "name": "Georgina Hazel"
  }
]
```

You are expected to design any other required models and routes for your API.

### Evaluation Criteria

- **Node** best practices
- Completeness: did you complete the features?
- Correctness: does the functionality act in sensible, thought-out ways?
- Maintainability: is it written in a clean, maintainable way?
- Testing: is the system adequately tested?
- Documentation: is the API well-documented?

### CodeSubmit

Please organize, design, test and document your code as if it were going into production - then push your changes to the master branch. After you have pushed your code, you may submit the assignment on the assignment page.

All the best and happy coding,

The Picogrid Team

---

<hr />

---


# Greetings from "Tamer" Mission accepted.

## API Documentation

Interactive API documentation is available when the server is running:

**🔗 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

The documentation provides:
- Complete API reference for all endpoints
- Interactive "Try it out" feature to test endpoints directly
- Request/response examples
- Error response documentation
- Schema definitions

### API Endpoints

All endpoints require authentication via JWT token in the `Authorization: Bearer <token>` header (except `/api/auth/login`).

#### Authentication
- **POST** `/api/auth/login` - Authenticate and receive JWT token

#### Accounts
- **POST** `/api/accounts` - Create a new bank account for a customer
- **GET** `/api/accounts/:id` - Get account balance
- **GET** `/api/accounts/:id/transfers` - Get transfer history for an account

#### Transfers
- **POST** `/api/transfers` - Transfer funds between accounts

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

4. **Access the API Documentation:**
   - Open your browser to: http://localhost:3000/api-docs
   - Explore all available endpoints
   - Use the "Try it out" feature to test the API directly

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRE_IN="24h"
PORT=3000
```

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```