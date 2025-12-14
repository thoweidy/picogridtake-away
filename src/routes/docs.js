const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

const router = express.Router();

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Banking API Documentation',
  swaggerOptions: {
    persistAuthorization: true, // Persist auth across page refreshes
    displayRequestDuration: true,
  },
}));

module.exports = router;

