const express = require('express');
const router = express.Router();
const Website = require('../models/Website');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Create a new website
router.post('/', [
  body('domain').isURL().withMessage('Valid domain required'),
  body('integrationType').optional().isIn(['plugin', 'js_sdk', 'zapier', 'webhook'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { domain, integrationType } = req.body;
    
    const website = await Website.create({
      userId: decoded.userId,
      domain,
      integrationType: integrationType || 'plugin'
    });
    
    logger.info(`Website created: ${domain} for user ${decoded.userId}`);
    
    res.status(201).json({
      success: true,
      website: {
        id: website.id,
        domain: website.domain,
        apiKey: website.api_key,
        secretKey: website.secret_key,
        integrationType: website.integration_type
      }
    });
  } catch (error) {
    logger.error('Error creating website:', error);
    res.status(500).json({ error: 'Failed to create website' });
  }
});

// Get all websites for current user
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const websites = await Website.findByUser(decoded.userId);
    
    res.json({
      success: true,
      websites: websites.map(w => ({
        id: w.id,
        domain: w.domain,
        apiKey: w.api_key,
        integrationType: w.integration_type,
        createdAt: w.created_at
      }))
    });
  } catch (error) {
    logger.error('Error fetching websites:', error);
    res.status(500).json({ error: 'Failed to fetch websites' });
  }
});

// Get website by ID
router.get('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const website = await Website.findById(req.params.id);
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    
    if (website.user_id !== decoded.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json({
      success: true,
      website: {
        id: website.id,
        domain: website.domain,
        apiKey: website.api_key,
        secretKey: website.secret_key,
        integrationType: website.integration_type,
        createdAt: website.created_at
      }
    });
  } catch (error) {
    logger.error('Error fetching website:', error);
    res.status(500).json({ error: 'Failed to fetch website' });
  }
});

// Rotate API keys
router.post('/:id/rotate-keys', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const website = await Website.findById(req.params.id);
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    
    if (website.user_id !== decoded.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const newKeys = await Website.rotateKeys(req.params.id);
    
    logger.info(`API keys rotated for website ${req.params.id}`);
    
    res.json({
      success: true,
      apiKey: newKeys.apiKey,
      secretKey: newKeys.secretKey
    });
  } catch (error) {
    logger.error('Error rotating keys:', error);
    res.status(500).json({ error: 'Failed to rotate keys' });
  }
});

// Get JS snippet
router.get('/:id/snippet', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const website = await Website.findById(req.params.id);
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    
    if (website.user_id !== decoded.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const snippet = await Website.getJSSnippet(req.params.id);
    
    res.json({
      success: true,
      snippet
    });
  } catch (error) {
    logger.error('Error getting snippet:', error);
    res.status(500).json({ error: 'Failed to get snippet' });
  }
});

// Delete website
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const website = await Website.findById(req.params.id);
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    
    if (website.user_id !== decoded.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { query } = require('../config/database');
    await query('DELETE FROM websites WHERE id = $1', [req.params.id]);
    
    logger.info(`Website ${req.params.id} deleted`);
    
    res.json({
      success: true,
      message: 'Website deleted'
    });
  } catch (error) {
    logger.error('Error deleting website:', error);
    res.status(500).json({ error: 'Failed to delete website' });
  }
});

module.exports = router;
