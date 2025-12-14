// Set test database URL before any modules load
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test.db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_EXPIRE_IN = process.env.JWT_EXPIRE_IN || '24h';

const { PrismaClient } = require('@prisma/client');

// Create a fresh Prisma client for tests
const prisma = new PrismaClient();

beforeAll(async () => {
  // Run migrations on test database
  const { execSync } = require('child_process');
  try {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'ignore'
    });
  } catch (error) {
    // Migrations might already be applied, continue
  }
  
  // Ensure database is ready
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test (order matters due to foreign keys)
  // Delete in correct order to respect foreign key constraints
  await prisma.transfer.deleteMany();
  await prisma.account.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.customer.deleteMany();
  
  // Seed test data - ensure customers are created first
  await prisma.customer.createMany({
    data: [
      { name: 'Arisha Barron' },
      { name: 'Branden Gibson' },
      { name: 'Rhonda Church' },
      { name: 'Georgina Hazel' }
    ]
  });
  
  // Verify customers were created
  const customerCount = await prisma.customer.count();
  if (customerCount === 0) {
    throw new Error('Failed to create test customers');
  }

  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('password123', 10);
  // Use upsert to handle case where employee might already exist
  await prisma.employee.upsert({
    where: { username: 'employee1' },
    update: {
      password: hashedPassword,
      name: 'Test Employee',
      role: 'teller'
    },
    create: {
      username: 'employee1',
      password: hashedPassword,
      name: 'Test Employee',
      role: 'teller'
    }
  });
});

afterEach(async () => {
  // Clean up after each test (optional, since beforeEach already cleans)
});

