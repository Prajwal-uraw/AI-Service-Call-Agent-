const User = require('../../../src/models/User');
const { pool } = require('../../../src/config/database');

describe('User Model', () => {
  afterAll(async () => {
    // Cleanup test data
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);
    await pool.end();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        phoneNumber: '+1234567890',
        monthlySmsLimit: 100,
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.phone_number).toBe(userData.phoneNumber);
      expect(user.current_sms_usage).toBe(0);
      expect(user.monthly_sms_limit).toBe(100);
      expect(user.is_active).toBe(true);
    });

    it('should create user with custom SMS limit', async () => {
      const userData = {
        email: `test-custom-${Date.now()}@example.com`,
        phoneNumber: '+1234567890',
        monthlySmsLimit: 500,
      };

      const user = await User.create(userData);
      expect(user.monthly_sms_limit).toBe(500);
    });

    it('should fail with duplicate email', async () => {
      const email = `test-duplicate-${Date.now()}@example.com`;
      const userData = {
        email,
        phoneNumber: '+15551234567',
      };

      await User.create(userData);
      
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        email: `find-${Date.now()}@example.com`,
        phoneNumber: '+1234567890',
      };

      await User.create(userData);
      const user = await User.findByEmail(userData.email);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
    });

    it('should return undefined for non-existent email', async () => {
      const user = await User.findByEmail('nonexistent@example.com');
      expect(user).toBeUndefined();
    });
  });
  
  describe('findById', () => {
    it('should find user by ID', async () => {
      const userData = {
        email: `findid-${Date.now()}@example.com`,
        phoneNumber: '+1234567890',
      };

      const created = await User.create(userData);
      const user = await User.findById(created.id);

      expect(user).toBeDefined();
      expect(user.id).toBe(created.id);
      expect(user.email).toBe(userData.email);
    });
    
    it('should return undefined for non-existent ID', async () => {
      const user = await User.findById('00000000-0000-0000-0000-000000000000');
      expect(user).toBeUndefined();
    });
  });

  describe('hasQuota', () => {
    it('should return true when user has quota', async () => {
      const userData = {
        email: `test-quota-${Date.now()}@example.com`,
        phoneNumber: '+1234567890',
        monthlySmsLimit: 100,
      };

      const user = await User.create(userData);
      const hasQuota = await User.hasQuota(user.id);
      expect(hasQuota).toBe(true);
    });

    it('should return false when quota exceeded', async () => {
      const userData = {
        email: `test-noquota-${Date.now()}@example.com`,
        phoneNumber: '+1234567890',
        monthlySmsLimit: 10,
      };

      const user = await User.create(userData);
      
      // Simulate usage exceeding limit
      await pool.query(
        'UPDATE users SET current_sms_usage = monthly_sms_limit + 1 WHERE id = $1',
        [user.id]
      );

      const hasQuota = await User.hasQuota(user.id);
      expect(hasQuota).toBe(false);
    });
  });

  describe('incrementUsage', () => {
    it('should increment SMS usage count', async () => {
      const userData = {
        email: `test-usage-${Date.now()}@example.com`,
        phoneNumber: '+15551234567',
      };

      const user = await User.create(userData);
      const initialUsage = user.current_sms_usage;

      await User.incrementUsage(user.id);
      const updatedUser = await User.findById(user.id);

      expect(updatedUser.current_sms_usage).toBe(initialUsage + 1);
    });

    it('should increment by custom count', async () => {
      const userData = {
        email: `test-multiusage-${Date.now()}@example.com`,
        phoneNumber: '+15551234567',
      };

      const user = await User.create(userData);
      await User.incrementUsage(user.id, 5);
      const updatedUser = await User.findById(user.id);

      expect(updatedUser.current_sms_usage).toBe(5);
    });
  });

  describe('getUsage', () => {
    it('should return usage statistics', async () => {
      const userData = {
        email: `test-stats-${Date.now()}@example.com`,
        phoneNumber: '+15551234567',
        monthlySmsLimit: 100,
      };

      const user = await User.create(userData);
      await User.incrementUsage(user.id, 25);

      const usage = await User.getUsage(user.id);
      expect(usage.used).toBe(25);
      expect(usage.limit).toBe(100);
      expect(usage.remaining).toBe(75);
      expect(usage.percentUsed).toBe(25);
    });
  });

  describe('resetUsage', () => {
    it('should reset SMS usage to zero', async () => {
      const userData = {
        email: `test-reset-${Date.now()}@example.com`,
        phoneNumber: '+15551234567',
      };

      const user = await User.create(userData);
      await User.incrementUsage(user.id, 50);
      await User.resetUsage(user.id);

      const updatedUser = await User.findById(user.id);
      expect(updatedUser.current_sms_usage).toBe(0);
    });
  });

  describe('updatePhoneNumber', () => {
    it('should update user phone number', async () => {
      const userData = {
        email: `test-phone-${Date.now()}@example.com`,
        phoneNumber: '+15551234567',
      };

      const user = await User.create(userData);
      const updated = await User.updatePhoneNumber(user.id, '+19998887777');

      expect(updated.phone_number).toBe('+19998887777');
    });
  });
});
