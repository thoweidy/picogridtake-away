# Greetings from "Tamer" Mission accepted.

## API Documentation

Beautiful, interactive API documentation powered by Scalar is available when the server is running:

**🔗 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

The documentation provides:
- **Elegant, modern UI** with purple theme
- **Interactive "Try it out" feature** - Test endpoints directly in the browser
- Complete API reference for all endpoints
- Real-time request/response examples
- Code samples in multiple languages (cURL, JavaScript, Python, etc.)
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

