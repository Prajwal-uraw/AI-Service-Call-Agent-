const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Event {
  static async create({ id, website_id, event_type, payload, ingested_at }) {
    const result = await query(
      `INSERT INTO ingested_events (id, website_id, event_type, payload, ingested_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id || uuidv4(), website_id, event_type, JSON.stringify(payload), ingested_at || new Date()]
    );
    
    return result.rows[0];
  }
  
  static async findById(id) {
    const result = await query(
      'SELECT * FROM ingested_events WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
  
  static async findByWebsite(websiteId, limit = 100) {
    const result = await query(
      'SELECT * FROM ingested_events WHERE website_id = $1 ORDER BY ingested_at DESC LIMIT $2',
      [websiteId, limit]
    );
    return result.rows;
  }
  
  static async findByType(websiteId, eventType, limit = 100) {
    const result = await query(
      'SELECT * FROM ingested_events WHERE website_id = $1 AND event_type = $2 ORDER BY ingested_at DESC LIMIT $3',
      [websiteId, eventType, limit]
    );
    return result.rows;
  }
}

module.exports = Event;
