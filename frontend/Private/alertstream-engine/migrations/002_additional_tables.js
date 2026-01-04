const { query } = require('../config/database');

async function up() {
  console.log('Running migration 002: Additional tables...');

  // Magic Links table
  await query(`
    CREATE TABLE IF NOT EXISTS magic_links (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      metadata JSONB
    )
  `);
  console.log('✓ magic_links table created');

  // User Consents (TCPA compliance)
  await query(`
    CREATE TABLE IF NOT EXISTS user_consents (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      phone_hash VARCHAR(255) NOT NULL,
      consent_type VARCHAR(50) NOT NULL,
      method VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP,
      revoked_at TIMESTAMP,
      ip_address VARCHAR(45),
      user_agent TEXT
    )
  `);
  console.log('✓ user_consents table created');

  // Create index on phone_hash
  await query(`
    CREATE INDEX IF NOT EXISTS idx_user_consents_phone_hash 
    ON user_consents(phone_hash)
  `);

  // DNC List (Do Not Call)
  await query(`
    CREATE TABLE IF NOT EXISTS dnc_list (
      phone_hash VARCHAR(255) PRIMARY KEY,
      added_at TIMESTAMP DEFAULT NOW(),
      source VARCHAR(100),
      reason TEXT
    )
  `);
  console.log('✓ dnc_list table created');

  // Support Tickets
  await query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id VARCHAR(50) PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      email VARCHAR(255) NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      priority VARCHAR(20) NOT NULL DEFAULT 'normal',
      status VARCHAR(20) NOT NULL DEFAULT 'open',
      resolution TEXT,
      assigned_to VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      resolved_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✓ support_tickets table created');

  // Ticket Messages
  await query(`
    CREATE TABLE IF NOT EXISTS ticket_messages (
      id UUID PRIMARY KEY,
      ticket_id VARCHAR(50) REFERENCES support_tickets(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      message TEXT NOT NULL,
      is_staff BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✓ ticket_messages table created');

  // Revenue Logs (for accounting)
  await query(`
    CREATE TABLE IF NOT EXISTS revenue_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id VARCHAR(255) UNIQUE NOT NULL,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      amount INTEGER NOT NULL,
      currency VARCHAR(3) DEFAULT 'usd',
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      metadata JSONB
    )
  `);
  console.log('✓ revenue_logs table created');

  // Compliance Logs (TCPA audit trail)
  await query(`
    CREATE TABLE IF NOT EXISTS compliance_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type VARCHAR(100) NOT NULL,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      phone_hash VARCHAR(255),
      data JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✓ compliance_logs table created');

  // SMS Compliance Logs (5-year retention for TCPA)
  await query(`
    CREATE TABLE IF NOT EXISTS sms_compliance_logs (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      phone_hash VARCHAR(255) NOT NULL,
      message_preview TEXT,
      consent_id UUID,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✓ sms_compliance_logs table created');

  // Pending Verifications (for double opt-in)
  await query(`
    CREATE TABLE IF NOT EXISTS pending_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      phone_hash VARCHAR(255) NOT NULL,
      code VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      verified_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✓ pending_verifications table created');

  // Add password column to users table if not exists
  await query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS password VARCHAR(255)
  `);
  console.log('✓ password column added to users table');

  console.log('Migration 002 completed successfully!');
}

async function down() {
  console.log('Rolling back migration 002...');
  
  await query('DROP TABLE IF EXISTS pending_verifications');
  await query('DROP TABLE IF EXISTS sms_compliance_logs');
  await query('DROP TABLE IF EXISTS compliance_logs');
  await query('DROP TABLE IF EXISTS revenue_logs');
  await query('DROP TABLE IF EXISTS ticket_messages');
  await query('DROP TABLE IF EXISTS support_tickets');
  await query('DROP TABLE IF EXISTS dnc_list');
  await query('DROP TABLE IF EXISTS user_consents');
  await query('DROP TABLE IF EXISTS magic_links');
  
  await query('ALTER TABLE users DROP COLUMN IF EXISTS password');
  
  console.log('Migration 002 rolled back successfully!');
}

// Run migration if called directly
if (require.main === module) {
  up()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { up, down };
