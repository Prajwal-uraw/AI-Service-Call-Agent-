const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create({ email, phoneNumber, monthlySmsLimit = 100 }) {
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO users (id, email, phone_number, monthly_sms_limit, current_sms_usage, is_active, created_at)
       VALUES ($1, $2, $3, $4, 0, true, NOW())
       RETURNING *`,
      [id, email, phoneNumber, monthlySmsLimit]
    );
    
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }
  
  static async findById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
  
  static async incrementUsage(userId, count = 1) {
    const result = await query(
      `UPDATE users 
       SET current_sms_usage = current_sms_usage + $1, 
           updated_at = NOW()
       WHERE id = $2
       RETURNING current_sms_usage, monthly_sms_limit`,
      [count, userId]
    );
    return result.rows[0];
  }
  
  static async hasQuota(userId) {
    const user = await this.findById(userId);
    if (!user) {
      return false;
    }
    return user.current_sms_usage < user.monthly_sms_limit;
  }
  
  static async getUsage(userId) {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }
    return {
      used: user.current_sms_usage,
      limit: user.monthly_sms_limit,
      remaining: user.monthly_sms_limit - user.current_sms_usage,
      percentUsed: (user.current_sms_usage / user.monthly_sms_limit) * 100
    };
  }
  
  static async resetUsage(userId) {
    await query(
      'UPDATE users SET current_sms_usage = 0 WHERE id = $1',
      [userId]
    );
  }
  
  static async updatePhoneNumber(userId, phoneNumber) {
    const result = await query(
      'UPDATE users SET phone_number = $1 WHERE id = $2 RETURNING *',
      [phoneNumber, userId]
    );
    return result.rows[0];
  }
}

module.exports = User;
