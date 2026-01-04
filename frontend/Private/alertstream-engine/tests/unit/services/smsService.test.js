const smsService = require('../../../src/services/smsService');
const SMSMessage = require('../../../src/models/SMSMessage');
const User = require('../../../src/models/User');

// Mock Twilio
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'SM_test_123456',
        status: 'queued',
        to: '+15551234567',
        from: '+15559876543',
        body: 'Test message',
      }),
    },
  }));
});

// Mock models
jest.mock('../../../src/models/SMSMessage');
jest.mock('../../../src/models/User');

describe('SMS Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendSMS', () => {
    it('should send SMS successfully', async () => {
      User.hasQuota.mockResolvedValue(true);
      User.incrementUsage.mockResolvedValue({ current_sms_usage: 1 });
      SMSMessage.create.mockResolvedValue({ id: 'msg-123' });
      SMSMessage.updateStatus.mockResolvedValue({ id: 'msg-123', status: 'sent' });

      const result = await smsService.sendSMS({
        userId: 'user-123',
        phoneNumber: '+15551234567',
        message: 'Test message',
        triggerId: 'trigger-123',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-123');
      expect(User.hasQuota).toHaveBeenCalledWith('user-123');
      expect(User.incrementUsage).toHaveBeenCalledWith('user-123');
    });

    it('should fail when user has no quota', async () => {
      User.hasQuota.mockResolvedValue(false);

      const result = await smsService.sendSMS({
        userId: 'user-123',
        phoneNumber: '+15551234567',
        message: 'Test message',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('quota');
    });

    it('should handle Twilio errors', async () => {
      User.hasQuota.mockResolvedValue(true);
      SMSMessage.create.mockResolvedValue({ id: 'msg-456' });
      
      const twilio = require('twilio');
      twilio().messages.create.mockRejectedValueOnce(
        new Error('Invalid phone number')
      );

      const result = await smsService.sendSMS({
        userId: 'user-123',
        phoneNumber: 'invalid',
        message: 'Test',
      });

      expect(result.success).toBe(false);
      expect(SMSMessage.updateStatus).toHaveBeenCalledWith(
        'msg-456',
        'failed',
        null,
        expect.stringContaining('Invalid phone number')
      );
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate correct US phone number', () => {
      const isValid = smsService.validatePhoneNumber('+15551234567');
      expect(isValid).toBe(true);
    });

    it('should reject invalid phone number', () => {
      const isValid = smsService.validatePhoneNumber('123');
      expect(isValid).toBe(false);
    });

    it('should reject phone number without country code', () => {
      const isValid = smsService.validatePhoneNumber('5551234567');
      expect(isValid).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format US phone number', () => {
      const formatted = smsService.formatPhoneNumber('5551234567', 'US');
      expect(formatted).toBe('+15551234567');
    });

    it('should return already formatted number', () => {
      const formatted = smsService.formatPhoneNumber('+15551234567');
      expect(formatted).toBe('+15551234567');
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost for US SMS', () => {
      const cost = smsService.estimateCost('+15551234567', 'Short message');
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(0.01);
    });

    it('should estimate higher cost for long messages', () => {
      const shortCost = smsService.estimateCost('+15551234567', 'Short');
      const longMessage = 'A'.repeat(200);
      const longCost = smsService.estimateCost('+15551234567', longMessage);
      
      expect(longCost).toBeGreaterThan(shortCost);
    });
  });
});
