# Greetings from "Tamer" Mission accepted.

## Quick Start

1. **Create `.env` file:**
   Create a `.env` file in the root directory with the following content:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key-change-in-production"
   JWT_EXPIRE_IN="24h"
   PORT=3000
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

5. **Access the API Documentation:**
   - Open your browser to: http://localhost:3000/api-docs
   - Explore all available endpoints
   - Use the "Try it out" feature to test the API directly

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## API Documentation

Interactive API documentation powered by Scalar is available when the server is running:

**🔗 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

The documentation provides:
- **Interactive "Try it out" feature** - Test endpoints directly in the browser
- Complete API reference for all endpoints
- Real-time request/response examples
- Authentication support with JWT tokens
- Error response documentation
- Schema definitions
- Dark mode support

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

