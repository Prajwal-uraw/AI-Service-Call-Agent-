const { query } = require('../config/database');

async function createTables() {
  console.log('Creating database tables...');
  
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        monthly_sms_limit INTEGER DEFAULT 100,
        current_sms_usage INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Websites table
    await query(`
      CREATE TABLE IF NOT EXISTS websites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        domain VARCHAR(255) NOT NULL,
        api_key VARCHAR(64) UNIQUE NOT NULL,
        secret_key VARCHAR(64),
        integration_type VARCHAR(20) CHECK (integration_type IN ('webhook', 'plugin', 'js_sdk')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Triggers table
    await query(`
      CREATE TABLE IF NOT EXISTS triggers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Events table
    await query(`
      CREATE TABLE IF NOT EXISTS ingested_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        website_id UUID REFERENCES websites(id),
        event_type VARCHAR(50) NOT NULL,
        payload JSONB NOT NULL,
        ingested_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // SMS messages table
    await query(`
      CREATE TABLE IF NOT EXISTS sms_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        trigger_id UUID REFERENCES triggers(id),
        to_number VARCHAR(20) NOT NULL,
        body TEXT NOT NULL,
        status VARCHAR(20) CHECK (status IN ('queued', 'sent', 'failed')),
        provider_id VARCHAR(255),
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Indexes for performance
    await query('CREATE INDEX IF NOT EXISTS idx_websites_api_key ON websites(api_key)');
    await query('CREATE INDEX IF NOT EXISTS idx_triggers_website_event ON triggers(website_id, event_type) WHERE is_active = true');
    await query('CREATE INDEX IF NOT EXISTS idx_events_website ON ingested_events(website_id, ingested_at)');
    await query('CREATE INDEX IF NOT EXISTS idx_sms_user_created ON sms_messages(user_id, created_at)');
    
    console.log('✅ Database tables created successfully');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createTables();
}

module.exports = { createTables };
