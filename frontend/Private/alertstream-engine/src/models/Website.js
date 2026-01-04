const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Website {
  static async create({ userId, domain, integrationType = 'plugin' }) {
    const apiKey = uuidv4().replace(/-/g, '').substring(0, 32);
    const secretKey = require('crypto').randomBytes(32).toString('hex');
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO websites (id, user_id, domain, api_key, secret_key, integration_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [id, userId, domain, apiKey, secretKey, integrationType]
    );
    
    return result.rows[0];
  }
  
  static async findByApiKey(apiKey) {
    const result = await query(
      'SELECT * FROM websites WHERE api_key = $1',
      [apiKey]
    );
    return result.rows[0];
  }
  
  static async findByUser(userId) {
    const result = await query(
      'SELECT * FROM websites WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  }
  
  static async findById(id) {
    const result = await query(
      'SELECT * FROM websites WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
  
  static async rotateKeys(id) {
    const apiKey = uuidv4().replace(/-/g, '').substring(0, 32);
    const secretKey = require('crypto').randomBytes(32).toString('hex');
    
    await query(
      `UPDATE websites 
       SET api_key = $1, secret_key = $2, updated_at = NOW()
       WHERE id = $3`,
      [apiKey, secretKey, id]
    );
    
    return { apiKey, secretKey };
  }
  
  static async createJSIntegration({ userId, domain }) {
    const apiKey = `js_${uuidv4().replace(/-/g, '').substring(0, 28)}`;
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO websites (id, user_id, domain, api_key, secret_key, integration_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [id, userId, domain, apiKey, null, 'js_sdk']
    );
    
    return result.rows[0];
  }
  
  static async getJSSnippet(websiteId) {
    const website = await this.findById(websiteId);
    if (!website) return null;
    
    return `
<!-- AlertStream Integration Snippet -->
<script>
  window.alertstreamConfig = {
    apiKey: '${website.api_key}',
    siteId: '${website.id}',
    endpoint: '${process.env.API_BASE_URL || 'https://api.alertstream.com'}/v1/js-events'
  };
</script>
<script src="https://cdn.alertstream.com/alertstream.min.js" async></script>
<!-- End AlertStream -->
    `.trim();
  }
}

module.exports = Website;
