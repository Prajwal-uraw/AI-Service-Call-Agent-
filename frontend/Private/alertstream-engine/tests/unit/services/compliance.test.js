const complianceService = require('../../../src/services/compliance');
const { pool } = require('../../../src/config/database');

describe('Compliance Service', () => {
  let testUserId;

  beforeAll(async () => {
    const result = await pool.query(
      `INSERT INTO users (email, phone_number, monthly_sms_limit)
       VALUES ($1, $2, $3) RETURNING id`,
      [`test-compliance-${Date.now()}@example.com`, '+1234567890', 100]
    );
    testUserId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM compliance_logs WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM tcpa_compliance WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await pool.end();
  });

  describe('checkConsent', () => {
    it('should return false for phone without consent', async () => {
      const hasConsent = await complianceService.checkConsent(
        testUserId,
        '+15551111111'
      );
      expect(hasConsent).toBe(false);
    });

    it('should return true after opt-in', async () => {
      await complianceService.recordOptIn(testUserId, '+15552222222', {
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
      });

      const hasConsent = await complianceService.checkConsent(
        testUserId,
        '+15552222222'
      );
      expect(hasConsent).toBe(true);
    });

    it('should return false after opt-out', async () => {
      await complianceService.recordOptIn(testUserId, '+15553333333');
      await complianceService.recordOptOut(testUserId, '+15553333333');

      const hasConsent = await complianceService.checkConsent(
        testUserId,
        '+15553333333'
      );
      expect(hasConsent).toBe(false);
    });
  });

  describe('recordOptIn', () => {
    it('should record opt-in with metadata', async () => {
      const result = await complianceService.recordOptIn(
        testUserId,
        '+15554444444',
        {
          ipAddress: '10.0.0.1',
          userAgent: 'Mozilla/5.0',
        }
      );

      expect(result).toBeDefined();
      expect(result.consent_status).toBe('opted_in');
      expect(result.opt_in_date).toBeDefined();
    });
  });

  describe('recordOptOut', () => {
    it('should record opt-out', async () => {
      await complianceService.recordOptIn(testUserId, '+15555555555');
      const result = await complianceService.recordOptOut(testUserId, '+15555555555');

      expect(result.consent_status).toBe('opted_out');
      expect(result.opt_out_date).toBeDefined();
    });
  });

  describe('logSMSSent', () => {
    it('should log SMS in compliance logs', async () => {
      await complianceService.recordOptIn(testUserId, '+15556666666');
      
      await complianceService.logSMSSent(
        testUserId,
        '+15556666666',
        'Test message for compliance'
      );

      const logs = await pool.query(
        `SELECT * FROM compliance_logs 
         WHERE user_id = $1 AND action = 'sms_sent'
         ORDER BY created_at DESC LIMIT 1`,
        [testUserId]
      );

      expect(logs.rows.length).toBe(1);
      expect(logs.rows[0].action).toBe('sms_sent');
    });
  });

  describe('getConsentHistory', () => {
    it('should return consent history for phone number', async () => {
      const phone = '+15557777777';
      await complianceService.recordOptIn(testUserId, phone);
      
      const history = await complianceService.getConsentHistory(testUserId, phone);
      
      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('generateVerificationCode', () => {
    it('should generate 6-digit verification code', () => {
      const code = complianceService.generateVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
    });

    it('should generate unique codes', () => {
      const code1 = complianceService.generateVerificationCode();
      const code2 = complianceService.generateVerificationCode();
      // Very unlikely to be equal
      expect(code1).not.toBe(code2);
    });
  });

  describe('validateConsent', () => {
    it('should validate consent meets TCPA requirements', () => {
      const validConsent = {
        phoneNumber: '+15558888888',
        consentText: 'I agree to receive SMS messages',
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
      };

      const isValid = complianceService.validateConsent(validConsent);
      expect(isValid).toBe(true);
    });

    it('should reject consent without required fields', () => {
      const invalidConsent = {
        phoneNumber: '+15559999999',
      };

      const isValid = complianceService.validateConsent(invalidConsent);
      expect(isValid).toBe(false);
    });
  });
});
