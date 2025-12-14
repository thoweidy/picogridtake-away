/**
 * Environment Variable Validation
 * Validates required environment variables on application startup
 */

function validateEnvVars() {
  const requiredVars = {
    DATABASE_URL: {
      required: true,
      description: 'Database connection string (e.g., "file:./dev.db" for SQLite)',
    },
    JWT_SECRET: {
      required: true,
      description: 'Secret key for signing JWT tokens',
      sensitive: true, // Don't show value in error messages
    },
  };

  const optionalVars = {
    JWT_EXPIRE_IN: {
      default: '24h',
      description: 'JWT token expiration time (default: "24h")',
    },
    PORT: {
      default: 3000,
      description: 'Server port (default: 3000)',
    },
  };

  const missing = [];
  const errors = [];

  // Check required variables
  for (const [varName, config] of Object.entries(requiredVars)) {
    const value = process.env[varName];

    if (!value || value.trim() === '') {
      missing.push({
        name: varName,
        description: config.description,
      });
    }
  }

  // Check optional variables and set defaults if missing
  for (const [varName, config] of Object.entries(optionalVars)) {
    if (!process.env[varName]) {
      process.env[varName] = config.default;
    }
  }

  // If required variables are missing, throw error
  if (missing.length > 0) {
    let errorMessage = '\n❌ Missing required environment variables:\n\n';
    
    missing.forEach(({ name, description }) => {
      errorMessage += `  • ${name}\n`;
      errorMessage += `    ${description}\n\n`;
    });

    errorMessage += '💡 Create a .env file in the root directory with these variables.\n';
    errorMessage += '   See .env.example for reference.\n';

    throw new Error(errorMessage);
  }

  // Validate JWT_SECRET strength (should be at least 32 characters for security)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push(
      '⚠️  Warning: JWT_SECRET should be at least 32 characters long for better security.'
    );
  }

  // Validate DATABASE_URL format for SQLite
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    errors.push(
      '⚠️  Warning: DATABASE_URL should start with "file:" for SQLite (e.g., "file:./dev.db")'
    );
  }

  // Log warnings if any
  if (errors.length > 0) {
    console.warn('\n⚠️  Environment Variable Warnings:\n');
    errors.forEach(error => console.warn(`  ${error}\n`));
  }

  // Success message
  console.log('✅ Environment variables validated successfully');
}

module.exports = { validateEnvVars };

