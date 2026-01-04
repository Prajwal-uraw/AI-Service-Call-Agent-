// Magic links for instant configuration
const crypto = require('crypto');
const { query } = require('../config/database');
const smsService = require('./smsService');
const logger = require('../utils/logger');

class MagicLinkService {
  async sendConfigurationLink(phoneNumber, email, websiteId) {
    // Generate a magic link that auto-configures everything
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 3600000; // 1 hour
    
    // Store token with configuration
    await this.storeToken(token, {
      phoneNumber,
      email,
      websiteId,
      expiresAt,
      status: 'pending'
    });
    
    // Send via SMS (most immediate)
    const smsLink = `https://app.alertstream.com/auto-configure/${token}`;
    await smsService.sendTest(phoneNumber);
    
    // Also send via email (would need email service integration)
    // await sendEmail({
    //   to: email,
    //   subject: 'Complete Your AlertStream Setup',
    //   html: this.generateEmailTemplate(smsLink)
    // });
    
    return { token, expiresAt };
  }
  
  async storeToken(token, config) {
    await query(
      `INSERT INTO magic_links (token, phone_number, email, website_id, expires_at, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [token, config.phoneNumber, config.email, config.websiteId, new Date(config.expiresAt), config.status]
    );
  }
  
  async getTokenConfig(token) {
    const result = await query(
      'SELECT * FROM magic_links WHERE token = $1 AND status = $2',
      [token, 'pending']
    );
    return result.rows[0];
  }
  
  async markTokenUsed(token) {
    await query(
      'UPDATE magic_links SET status = $1, used_at = NOW() WHERE token = $2',
      ['used', token]
    );
  }
  
  async handleMagicLink(token) {
    const config = await this.getTokenConfig(token);
    
    if (!config || new Date(config.expires_at) < new Date()) {
      throw new Error('Invalid or expired token');
    }
    
    // Auto-configure everything
    const result = await this.autoConfigure(config);
    
    // Mark as completed
    await this.markTokenUsed(token);
    
    return {
      success: true,
      configured: true,
      website_id: config.website_id,
      phone_number: config.phone_number,
      configured_events: result.events,
      test_sms_sent: result.testSmsSent
    };
  }
  
  async autoConfigure(config) {
    const User = require('../models/User');
    const Website = require('../models/Website');
    const Trigger = require('../models/Trigger');
    
    // 1. Create user account if not exists
    let user = await User.findByEmail(config.email);
    if (!user) {
      user = await User.create({
        email: config.email,
        phoneNumber: config.phone_number
      });
    }
    
    // 2. Create website record if not exists
    let website = await Website.findById(config.website_id);
    if (!website) {
      website = await Website.create({
        userId: user.id,
        domain: config.website_id, // Assuming website_id is domain for now
        integrationType: 'magic_link'
      });
    }
    
    // 3. Auto-detect and create triggers
    const events = await this.autoDetectEvents(website);
    
    // 4. Send test SMS
    const testResult = await smsService.sendTest(config.phone_number);
    
    logger.info(`Magic link auto-configured for ${config.email}`, {
      website_id: website.id,
      events_configured: events.length
    });
    
    return { events, testSmsSent: testResult.success };
  }
  
  async autoDetectEvents(website) {
    const Trigger = require('../models/Trigger');
    
    // Default events to monitor
    const detectedEvents = [
      'form_submit',
      'user_signup',
      'page_view'
    ];
    
    // Create triggers for detected events
    for (const eventType of detectedEvents) {
      await Trigger.create({
        websiteId: website.id,
        eventType: eventType,
        isActive: true
      });
    }
    
    return detectedEvents;
  }
  
  generateEmailTemplate(link) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #667eea; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🚀 Your AlertStream is Ready!</h2>
          <p>Click the button below to automatically configure AlertStream on your website:</p>
          <p><a href="${link}" class="button">Auto-Configure AlertStream</a></p>
          <p>Or copy this link: ${link}</p>
          <p>This link expires in 1 hour.</p>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>✅ AlertStream will auto-detect your forms and buttons</li>
            <li>✅ You'll receive a test SMS immediately</li>
            <li>✅ No further configuration needed</li>
          </ul>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new MagicLinkService();
