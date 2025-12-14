const express = require('express');
const { apiReference } = require('@scalar/express-api-reference');
const swaggerSpec = require('../config/swagger');

const router = express.Router();

// Serve OpenAPI JSON spec
router.get('/openapi.json', (req, res) => {
  res.json(swaggerSpec);
});

// Serve Scalar API Reference with beautiful, elegant styling and interactive "Try It Out" feature
router.get('/', apiReference({
  theme: 'moon',
  spec: {
    content: swaggerSpec,
  },
  defaultOpenAllTags: true,
  expandAllModelSections: true,
  expandAllResponses: true,
  hideClientButton: false,
  showSidebar: true,
  showDeveloperTools: false,
  showToolbar: 'localhost',
  operationTitleSource: 'summary',
  persistAuth: false,
  telemetry: true,
  layout: 'modern',
  isEditable: false,
  isLoading: false,
  hideModels: false,
  documentDownloadType: 'both',
  hideTestRequestButton: false,
  hideSearch: false,
  showOperationId: false,
  hideDarkModeToggle: false,
  withDefaultFonts: true,
  orderSchemaPropertiesBy: 'alpha',
  orderRequiredPropertiesFirst: true,
  _integration: 'express',
  default: false,
  slug: 'api-1',
  title: 'API #1',
}));

module.exports = router;

