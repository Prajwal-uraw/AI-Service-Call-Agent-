const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class SMSMessage {
  static async create({ id, user_id, trigger_id, to_number, body, status = 'queued' }) {
    const result = await query(
      `INSERT INTO sms_messages (id, user_id, trigger_id, to_number, body, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [id || uuidv4(), user_id, trigger_id, to_number, body, status]
    );
    
    return result.rows[0];
  }
  
  static async findById(id) {
    const result = await query(
      'SELECT * FROM sms_messages WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
  
  static async updateStatus(id, status, providerId = null) {
    const result = await query(
      `UPDATE sms_messages 
       SET status = $1, provider_id = $2, sent_at = CASE WHEN $1 = 'sent' THEN NOW() ELSE sent_at END, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, providerId, id]
    );
    return result.rows[0];
  }
  
  static async findByUser(userId, limit = 100) {
    const result = await query(
      'SELECT * FROM sms_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }
  
  static async findByStatus(status, limit = 100) {
    const result = await query(
      'SELECT * FROM sms_messages WHERE status = $1 ORDER BY created_at ASC LIMIT $2',
      [status, limit]
    );
    return result.rows;
  }
}

module.exports = SMSMessage;
