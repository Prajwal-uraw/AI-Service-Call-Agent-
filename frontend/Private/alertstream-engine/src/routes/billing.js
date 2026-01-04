const express = require('express');
const router = express.Router();
const billingService = require('../services/billing');
const logger = require('../utils/logger');

// Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    await billingService.handleWebhook(req.body, signature);
    res.sendStatus(200);
  } catch (error) {
    logger.error('Billing webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Get user subscription
router.get('/subscription', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const User = require('../models/User');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const usage = await User.getUsage(decoded.userId);
    
    res.json({
      success: true,
      subscription: {
        plan: user.plan || 'free',
        usage
      }
    });
  } catch (error) {
    logger.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Create subscription
router.post('/subscription', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const User = require('../models/User');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { planId, paymentMethodId } = req.body;
    
    const subscription = await billingService.createSubscription(user, planId, paymentMethodId);
    
    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

module.exports = router;
