// OpenAPI 3.0 Specification for Banking API
const swaggerSpec = {
  openapi: '3.0.0',
    info: {
      title: 'Banking API',
      version: '1.2.0',
      description: 'Internal API for a fake financial institution. This API allows bank employees to manage customer accounts, process transfers, and retrieve account information.\n\n## ⚠️ Important: Authentication Required\n\n**Most endpoints require authentication. You MUST obtain a token before attempting to test protected routes.**\n\n### How to Authenticate:\n\n1. **Get a Token First**: Use the `/api/auth/login` endpoint (below) to authenticate and receive a JWT token\n   - Use credentials: `username: "employee1"`, `password: "password123"` (or other seeded employee credentials)\n   - Copy the `token` value from the response\n\n2. **Authorize in Swagger**: Click the "Authorize" button (🔒) at the top right of this page\n   - Enter your token (you can use just the token, or `Bearer <token>`)\n   - Click "Authorize" to save it\n\n3. **Test Protected Routes**: Once authorized, the lock icons will turn closed/black, and you can successfully test protected endpoints\n\n⚠️ **Note**: Attempting to test protected routes without a token will result in `401 Unauthorized` errors.',
      contact: {
        name: 'Tamer Howeidy',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from the login endpoint. Enter your token in the format: `Bearer <token>` or just `<token>`',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            errorMessage: {
              type: 'string',
              description: 'Error message describing what went wrong',
            },
          },
        },
        AuthError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'employee1',
              description: 'Employee username',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
              description: 'Employee password',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'JWT authentication token',
            },
            employee: {
              type: 'object',
              properties: {
                employeeId: {
                  type: 'integer',
                  example: 1,
                },
                username: {
                  type: 'string',
                  example: 'employee1',
                },
                role: {
                  type: 'string',
                  example: 'teller',
                },
              },
            },
          },
        },
        CreateAccountRequest: {
          type: 'object',
          required: ['customerId', 'initialDeposit'],
          properties: {
            customerId: {
              type: 'integer',
              example: 1,
              description: 'ID of the customer who will own this account',
            },
            initialDeposit: {
              type: 'number',
              format: 'float',
              minimum: 0.01,
              example: 1000.00,
              description: 'Initial deposit amount (must be greater than 0)',
            },
          },
        },
        Account: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            customerId: {
              type: 'integer',
              example: 1,
            },
            balance: {
              type: 'number',
              format: 'float',
              example: 1000.00,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        GetBalanceRequest: {
          type: 'object',
          required: ['accountId'],
          properties: {
            accountId: {
              type: 'integer',
              example: 1,
              description: 'ID of the account',
            },
          },
        },
        BalanceResponse: {
          type: 'object',
          properties: {
            accountId: {
              type: 'integer',
              example: 1,
            },
            balance: {
              type: 'number',
              format: 'float',
              example: 1000.00,
            },
          },
        },
        TransferRequest: {
          type: 'object',
          required: ['fromAccountId', 'toAccountId', 'amount'],
          properties: {
            fromAccountId: {
              type: 'integer',
              example: 1,
              description: 'ID of the source account',
            },
            toAccountId: {
              type: 'integer',
              example: 2,
              description: 'ID of the destination account',
            },
            amount: {
              type: 'number',
              format: 'float',
              minimum: 0.01,
              example: 250.00,
              description: 'Amount to transfer (must be greater than 0)',
            },
          },
        },
        Transfer: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            fromAccountId: {
              type: 'integer',
              example: 1,
            },
            toAccountId: {
              type: 'integer',
              example: 2,
            },
            amount: {
              type: 'number',
              format: 'float',
              example: 250.00,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:35:00.000Z',
            },
          },
        },
        TransferResponse: {
          type: 'object',
          properties: {
            transfer: {
              $ref: '#/components/schemas/Transfer',
            },
            fromAccount: {
              $ref: '#/components/schemas/Account',
            },
            toAccount: {
              $ref: '#/components/schemas/Account',
            },
          },
        },
        TransferHistoryItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            fromAccountId: {
              type: 'integer',
              example: 1,
            },
            toAccountId: {
              type: 'integer',
              example: 2,
            },
            amount: {
              type: 'number',
              format: 'float',
              example: 250.00,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:35:00.000Z',
            },
            fromAccount: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                },
                customer: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      example: 'Arisha Barron',
                    },
                  },
                },
              },
            },
            toAccount: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                },
                customer: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      example: 'Branden Gibson',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Employee authentication endpoints',
      },
      {
        name: 'Accounts',
        description: 'Account management endpoints',
      },
      {
        name: 'Transfers',
        description: 'Money transfer endpoints',
      },
    ],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Employee Login',
          description: 'Authenticate an employee and receive a JWT token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LoginResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Missing username or password',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthError',
                  },
                },
              },
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthError',
                  },
                },
              },
            },
          },
        },
      },
      '/api/accounts': {
        post: {
          tags: ['Accounts'],
          summary: 'Create Bank Account',
          description: 'Create a new bank account for a customer with an initial deposit. **Requires authentication.**',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateAccountRequest',
                },
                example: {
                  customerId: 1,
                  initialDeposit: 1000.00,
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Account created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Account',
                  },
                },
              },
            },
            '400': {
              description: 'Bad request - validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                  examples: {
                    missingFields: {
                      value: {
                        errorMessage: 'CustomerID and Initial Deposit are required',
                      },
                    },
                    invalidDeposit: {
                      value: {
                        errorMessage: 'Initial Deposit must be greater Zero',
                      },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Customer not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                  example: {
                    errorMessage: 'Customer not found',
                  },
                },
              },
            },
          },
        },
      },
      '/api/accounts/{id}': {
        get: {
          tags: ['Accounts'],
          summary: 'Get Account Balance',
          description: 'Retrieve the current balance for a given account. **Requires authentication.**',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer',
              },
              description: 'ID of the account',
              example: 1,
            },
          ],
          responses: {
            '200': {
              description: 'Balance retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/BalanceResponse',
                  },
                  example: {
                    accountId: 1,
                    balance: 1000.00,
                  },
                },
              },
            },
            '400': {
              description: 'Bad request - validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                  example: {
                    errorMessage: 'accountId must be a valid number',
                  },
                },
              },
            },
            '404': {
              description: 'Account not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                  example: {
                    errorMessage: 'Account not found',
                  },
                },
              },
            },
          },
        },
      },
      '/api/accounts/{id}/transfers': {
        get: {
          tags: ['Accounts'],
          summary: 'Get Transfer History',
          description: 'Retrieve all transfers (both sent and received) for a given account, sorted by timestamp (newest first). **Requires authentication.**',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer',
              },
              description: 'ID of the account',
              example: 1,
            },
          ],
          responses: {
            '200': {
              description: 'Transfer history retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/TransferHistoryItem',
                    },
                  },
                  example: [
                    {
                      id: 2,
                      fromAccountId: 3,
                      toAccountId: 1,
                      amount: 500.00,
                      timestamp: '2024-01-15T11:00:00.000Z',
                      fromAccount: {
                        id: 3,
                        customer: {
                          name: 'Rhonda Church',
                        },
                      },
                      toAccount: {
                        id: 1,
                        customer: {
                          name: 'Arisha Barron',
                        },
                      },
                    },
                    {
                      id: 1,
                      fromAccountId: 1,
                      toAccountId: 2,
                      amount: 250.00,
                      timestamp: '2024-01-15T10:35:00.000Z',
                      fromAccount: {
                        id: 1,
                        customer: {
                          name: 'Arisha Barron',
                        },
                      },
                      toAccount: {
                        id: 2,
                        customer: {
                          name: 'Branden Gibson',
                        },
                      },
                    },
                  ],
                },
              },
            },
            '400': {
              description: 'Bad request - invalid accountId format',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                  example: {
                    errorMessage: 'accountId must be a valid number',
                  },
                },
              },
            },
            '404': {
              description: 'Account not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                  example: {
                    errorMessage: 'Account not found',
                  },
                },
              },
            },
          },
        },
      },
      '/api/transfers': {
        post: {
          tags: ['Transfers'],
          summary: 'Transfer Funds',
          description: 'Transfer funds between two accounts. The transfer is executed atomically using a database transaction. **Requires authentication.**',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TransferRequest',
                },
                example: {
                  fromAccountId: 1,
                  toAccountId: 2,
                  amount: 250.00,
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Transfer completed successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TransferResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Bad request - validation error or business logic error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                  examples: {
                    missingFields: {
                      value: {
                        errorMessage: 'fromAccountId, toAccountId, and amount are required fields',
                      },
                    },
                    insufficientFunds: {
                      value: {
                        errorMessage: 'Insufficient funds',
                      },
                    },
                    sameAccount: {
                      value: {
                        errorMessage: 'Cannot transfer to the same account',
                      },
                    },
                    invalidAmount: {
                      value: {
                        errorMessage: 'Transfer amount must be positive and more than Zero',
                      },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Source or destination account not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                  examples: {
                    sourceNotFound: {
                      value: {
                        errorMessage: 'Source account does not exist',
                      },
                    },
                    destinationNotFound: {
                      value: {
                        errorMessage: 'Destination account does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
};

module.exports = swaggerSpec;

