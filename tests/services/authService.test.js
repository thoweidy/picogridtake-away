const authService = require('../../src/services/authService');
const prisma = require('../../src/db/client');
const bcrypt = require('bcrypt');

describe('Auth Service', () => {
  let employee;

  beforeEach(async () => {
    employee = await prisma.employee.findFirst({
      where: { username: 'employee1' }
    });
  });

  describe('login', () => {
    test('should login with valid credentials', async () => {
      const result = await authService.login('employee1', 'password123');

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.employee).toBeDefined();
      expect(result.employee.employeeId).toBe(employee.id);
      expect(result.employee.username).toBe('employee1');
      expect(result.employee.role).toBe('teller');
      expect(result.employee.password).toBeUndefined(); // Password should not be returned
    });

    test('should throw error with invalid username', async () => {
      await expect(
        authService.login('invaliduser', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    test('should throw error with invalid password', async () => {
      await expect(
        authService.login('employee1', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    test('should generate valid JWT token', async () => {
      const jwt = require('jsonwebtoken');
      const result = await authService.login('employee1', 'password123');

      const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
      
      expect(decoded.employeeId).toBe(employee.id);
      expect(decoded.username).toBe('employee1');
      expect(decoded.role).toBe('teller');
    });
  });
});

