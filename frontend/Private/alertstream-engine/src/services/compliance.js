// Telephone Consumer Protection Act compliance
const crypto = require('crypto');

class TCPACompliance {
  constructor() {
    this.consentRequirements = {
      'sms': {
        required: true,
        method: 'explicit',
        documentation: 'must_keep_5_years'
      },
      'emergency': {
        required: false,
        method: 'implied',
        documentation: 'optional'
      }
    };
  }
  
  async validateSMSConsent(phoneNumber, userId, context) {
    // Check DNC registry (Do Not Call)
    const isDNC = await this.checkDNCRegistry(phoneNumber);
    if (isDNC) {
      throw new Error('Number on Do Not Call registry');
    }
    
    // Check user consent records
    const consent = await this.getUserConsent(userId, 'sms');
    
    if (!consent) {
      // Attempt to get consent via double opt-in
      return await this.initiateDoubleOptIn(phoneNumber, userId);
    }
    
    // Verify consent is still valid
    if (this.isConsentExpired(consent)) {
      throw new Error('Consent expired, re-verification required');
    }
    
    return {
      compliant: true,
      consent_id: consent.id,
      expires_at: consent.expires_at
    };
  }
  
  async initiateDoubleOptIn(phoneNumber, userId) {
    // Send verification SMS with STOP instructions
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    
    await this.sendVerificationSMS(phoneNumber, verificationCode);
    
    // Store pending verification
    await this.storePendingVerification(userId, phoneNumber, verificationCode);
    
    return {
      compliant: false,
      status: 'pending_verification',
      verification_required: true,
      expires_in: '10 minutes'
    };
  }
  
  async handleSTOPRequest(phoneNumber) {
    // Immediately stop all SMS to this number
    await this.addToInternalDNC(phoneNumber);
    
    // Send confirmation
    await this.sendSMS(phoneNumber, 
      "You have been unsubscribed from all AlertStream messages. " +
      "You will receive no further messages. Reply HELP for help."
    );
    
    // Log for compliance
    await this.logComplianceEvent('stop_request', { phoneNumber });
    
    return { stopped: true, timestamp: new Date().toISOString() };
  }
  
  async handleHELPRequest(phoneNumber) {
    const helpMessage = 
      "AlertStream: To stop messages, reply STOP. " +
      "For support, email help@alertstream.com. " +
      "Msg&data rates may apply.";
    
    await this.sendSMS(phoneNumber, helpMessage);
    
    return { helped: true };
  }
  
  // Required: Message logging for 5 years
  async logMessageForCompliance(message, userId, phoneNumber) {
    const logEntry = {
      id: crypto.randomUUID(),
      user_id: userId,
      phone_number: this.hashPhoneNumber(phoneNumber), // Hash for privacy
      message_preview: message.substring(0, 50),
      timestamp: new Date().toISOString(),
      message_id: message.id,
      consent_id: await this.getConsentId(userId)
    };
    
    // Store in compliant storage (WORM - Write Once Read Many)
    await this.storeInCompliantStorage(logEntry);
    
    return logEntry;
  }

  async checkDNCRegistry(phoneNumber) {
    // In production, integrate with FTC DNC registry API
    // For now, check internal DNC list
    const db = require('../config/database');
    const result = await db.query(
      'SELECT 1 FROM dnc_list WHERE phone_hash = $1',
      [this.hashPhoneNumber(phoneNumber)]
    );
    return result.rows.length > 0;
  }

  async getUserConsent(userId, type) {
    const db = require('../config/database');
    const result = await db.query(
      `SELECT * FROM user_consents 
       WHERE user_id = $1 AND consent_type = $2 AND revoked_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [userId, type]
    );
    return result.rows[0] || null;
  }

  isConsentExpired(consent) {
    if (!consent.expires_at) return false;
    return new Date(consent.expires_at) < new Date();
  }

  async sendVerificationSMS(phoneNumber, code) {
    const smsService = require('./smsService');
    const message = `AlertStream: Your verification code is ${code}. ` +
                    `Reply STOP to unsubscribe. Msg&data rates may apply.`;
    await smsService.sendRawSMS(phoneNumber, message);
  }

  async storePendingVerification(userId, phoneNumber, code) {
    const db = require('../config/database');
    await db.query(
      `INSERT INTO pending_verifications (user_id, phone_hash, code, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
      [userId, this.hashPhoneNumber(phoneNumber), code]
    );
  }

  async addToInternalDNC(phoneNumber) {
    const db = require('../config/database');
    await db.query(
      `INSERT INTO dnc_list (phone_hash, added_at, source)
       VALUES ($1, NOW(), 'user_stop_request')
       ON CONFLICT (phone_hash) DO NOTHING`,
      [this.hashPhoneNumber(phoneNumber)]
    );
  }

  async sendSMS(phoneNumber, message) {
    const smsService = require('./smsService');
    await smsService.sendRawSMS(phoneNumber, message);
  }

  async logComplianceEvent(eventType, data) {
    const db = require('../config/database');
    await db.query(
      `INSERT INTO compliance_logs (event_type, data, created_at)
       VALUES ($1, $2, NOW())`,
      [eventType, JSON.stringify(data)]
    );
  }

  hashPhoneNumber(phoneNumber) {
    return crypto.createHash('sha256').update(phoneNumber).digest('hex');
  }

  async getConsentId(userId) {
    const consent = await this.getUserConsent(userId, 'sms');
    return consent?.id || null;
  }

  async storeInCompliantStorage(logEntry) {
    const db = require('../config/database');
    await db.query(
      `INSERT INTO sms_compliance_logs 
       (id, user_id, phone_hash, message_preview, consent_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        logEntry.id,
        logEntry.user_id,
        logEntry.phone_number,
        logEntry.message_preview,
        logEntry.consent_id,
        logEntry.timestamp
      ]
    );
  }

  // Verify consent before sending any SMS
  async canSendSMS(userId, phoneNumber) {
    try {
      const result = await this.validateSMSConsent(phoneNumber, userId, {});
      return result.compliant;
    } catch (error) {
      return false;
    }
  }

  // Record new consent
  async recordConsent(userId, phoneNumber, consentType, method) {
    const db = require('../config/database');
    const consentId = crypto.randomUUID();
    
    await db.query(
      `INSERT INTO user_consents 
       (id, user_id, phone_hash, consent_type, method, created_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + INTERVAL '2 years')`,
      [consentId, userId, this.hashPhoneNumber(phoneNumber), consentType, method]
    );
    
    return consentId;
  }
}

module.exports = new TCPACompliance();
