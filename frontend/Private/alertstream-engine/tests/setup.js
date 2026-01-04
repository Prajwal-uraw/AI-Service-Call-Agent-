// Test setup and global configurations
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/alertstream_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.HMAC_SECRET = 'test-hmac-secret';
process.env.TWILIO_ACCOUNT_SID = 'test-twilio-sid';
process.env.TWILIO_AUTH_TOKEN = 'test-twilio-token';
process.env.TWILIO_PHONE_NUMBER = '+15551234567';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';

// Mock external services
jest.mock('../src/services/smsService', () => ({
  sendSMS: jest.fn().mockResolvedValue({ sid: 'test-sid', status: 'sent' }),
}));

jest.mock('../src/services/billing', () => ({
  checkUsageAndBill: jest.fn().mockResolvedValue(true),
  createSubscription: jest.fn().mockResolvedValue({ id: 'sub_test' }),
}));

// Global test utilities
global.testHelpers = {
  createTestUser: async () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    phoneNumber: '+15551234567',
    plan: 'free',
    current_sms_usage: 0,
    monthly_sms_limit: 100,
  }),
  
  createTestWebsite: async () => ({
    id: 'test-website-id',
    user_id: 'test-user-id',
    domain: 'example.com',
    api_key: 'test-api-key',
    hmac_secret: 'test-hmac-secret',
  }),
  
  createTestTrigger: async () => ({
    id: 'test-trigger-id',
    website_id: 'test-website-id',
    event_type: 'form_submit',
    is_active: true,
    sms_template: 'New form submission',
  }),
};

// Cleanup after all tests
afterAll(async () => {
  // Close database connections, Redis, etc.
  await new Promise(resolve => setTimeout(resolve, 500));
});
