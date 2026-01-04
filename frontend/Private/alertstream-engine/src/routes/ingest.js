const express = require('express');
const router = express.Router();
const { validateIngest } = require('../middleware/validators');
const ingestController = require('../controllers/ingestController');
const auth = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

// Public endpoint for event ingestion
router.post('/', 
  validateIngest,
  auth.hmacAuth,
  rateLimit.byWebsite(60, 'minute'), // 60 req/min per website
  ingestController.handleEvent
);

// Test endpoint (no auth required)
router.post('/test', 
  validateIngest,
  ingestController.handleTestEvent
);

module.exports = router;
