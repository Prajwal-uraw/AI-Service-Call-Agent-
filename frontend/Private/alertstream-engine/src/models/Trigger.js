const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Trigger {
  static async create({ websiteId, eventType, isActive = true }) {
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO triggers (id, website_id, event_type, is_active, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [id, websiteId, eventType, isActive]
    );
    
    return result.rows[0];
  }
  
  static async findActiveByWebsiteAndType(websiteId, eventType) {
    const result = await query(
      `SELECT * FROM triggers 
       WHERE website_id = $1 
       AND event_type = $2 
       AND is_active = true`,
      [websiteId, eventType]
    );
    return result.rows;
  }
  
  static async findByWebsite(websiteId) {
    const result = await query(
      'SELECT * FROM triggers WHERE website_id = $1 ORDER BY created_at DESC',
      [websiteId]
    );
    return result.rows;
  }
  
  static async findById(id) {
    const result = await query(
      'SELECT * FROM triggers WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
  
  static async updateStatus(id, isActive) {
    const result = await query(
      'UPDATE triggers SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    return result.rows[0];
  }
  
  static async delete(id) {
    await query('DELETE FROM triggers WHERE id = $1', [id]);
  }
}

module.exports = Trigger;
