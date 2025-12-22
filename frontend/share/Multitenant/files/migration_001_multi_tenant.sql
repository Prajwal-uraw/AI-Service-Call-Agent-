-- ============================================================================
-- MULTI-TENANT DATABASE MIGRATION
-- Version: 1.0.0
-- Description: Add tenant isolation to HVAC Voice Agent
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Tenants Table (Core Multi-Tenant Entity)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(50) PRIMARY KEY,  -- e.g., 'acme_hvac', 'comfort_air'
    
    -- Company Information
    company_name VARCHAR(200) NOT NULL,
    display_name VARCHAR(200),  -- For voice prompts
    website VARCHAR(255),
    
    -- Twilio Configuration
    twilio_phone_number VARCHAR(20) UNIQUE NOT NULL,  -- Incoming calls to this number
    twilio_account_sid VARCHAR(100),  -- Optional: Tenant's own Twilio account
    twilio_auth_token VARCHAR(100),   -- Optional: For tenant-specific validation
    forward_to_number VARCHAR(20) NOT NULL,  -- Where to transfer calls
    emergency_phone VARCHAR(20),  -- Emergency escalation number
    
    -- Business Configuration
    timezone VARCHAR(50) DEFAULT 'America/Chicago',
    business_hours JSONB DEFAULT '{}',  -- {"mon": {"open": "08:00", "close": "17:00"}}
    service_areas JSONB DEFAULT '[]',   -- ["Dallas", "Fort Worth", "Arlington"]
    
    -- AI Voice Configuration
    ai_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
    ai_voice VARCHAR(50) DEFAULT 'alloy',  -- OpenAI voice or ElevenLabs voice ID
    ai_temperature DECIMAL(3,2) DEFAULT 0.7,
    use_elevenlabs BOOLEAN DEFAULT false,
    elevenlabs_voice_id VARCHAR(100),
    
    -- Custom AI Instructions
    custom_system_prompt TEXT,  -- Client-specific instructions
    greeting_message TEXT,      -- Custom greeting
    emergency_keywords JSONB DEFAULT '[]',  -- ["gas leak", "no heat"]
    qualification_criteria JSONB DEFAULT '{}',  -- Custom qualification rules
    
    -- Pricing & Billing
    pricing_tier VARCHAR(20) DEFAULT 'basic',  -- basic, pro, enterprise
    monthly_rate DECIMAL(10,2),
    setup_fee DECIMAL(10,2),
    max_concurrent_calls INTEGER DEFAULT 5,
    
    -- Feature Flags
    features JSONB DEFAULT '{}',  -- {"enable_scheduling": true, "enable_emergency": true}
    
    -- Status & Metadata
    is_active BOOLEAN DEFAULT true,
    is_test_mode BOOLEAN DEFAULT false,  -- Sandbox mode for testing
    onboarded_at TIMESTAMP DEFAULT NOW(),
    onboarded_by VARCHAR(100),  -- Email of person who set it up
    
    -- Tracking
    total_calls INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    last_call_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tenants_phone ON tenants(twilio_phone_number);
CREATE INDEX idx_tenants_active ON tenants(is_active, is_test_mode);
CREATE INDEX idx_tenants_created ON tenants(created_at);


-- ============================================================================
-- STEP 2: Add tenant_id to Existing Tables
-- ============================================================================

-- Add tenant_id to locations
ALTER TABLE locations 
    ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) REFERENCES tenants(id);

-- Add tenant_id to appointments
ALTER TABLE appointments 
    ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) REFERENCES tenants(id);

-- Add tenant_id to emergency_logs
ALTER TABLE emergency_logs 
    ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) REFERENCES tenants(id);

-- Add tenant_id to call_logs
ALTER TABLE call_logs 
    ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) REFERENCES tenants(id);


-- ============================================================================
-- STEP 3: Create Performance Indexes
-- ============================================================================

-- Appointments by tenant
CREATE INDEX IF NOT EXISTS idx_appointments_tenant 
    ON appointments(tenant_id, date, time);

-- Call logs by tenant
CREATE INDEX IF NOT EXISTS idx_call_logs_tenant 
    ON call_logs(tenant_id, created_at);

-- Emergency logs by tenant
CREATE INDEX IF NOT EXISTS idx_emergency_logs_tenant 
    ON emergency_logs(tenant_id, created_at);

-- Locations by tenant
CREATE INDEX IF NOT EXISTS idx_locations_tenant 
    ON locations(tenant_id, is_active);


-- ============================================================================
-- STEP 4: Create Tenant Usage Tracking Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_usage (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id),
    
    -- Usage Metrics
    date DATE NOT NULL,
    calls_count INTEGER DEFAULT 0,
    calls_duration_seconds INTEGER DEFAULT 0,
    appointments_booked INTEGER DEFAULT 0,
    emergencies_handled INTEGER DEFAULT 0,
    transfers_count INTEGER DEFAULT 0,
    
    -- Cost Tracking
    openai_tokens_used INTEGER DEFAULT 0,
    elevenlabs_characters_used INTEGER DEFAULT 0,
    twilio_minutes_used DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, date)
);

CREATE INDEX idx_tenant_usage_tenant_date ON tenant_usage(tenant_id, date);


-- ============================================================================
-- STEP 5: Create Tenant API Keys Table (for programmatic access)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_api_keys (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id),
    
    key_hash VARCHAR(100) UNIQUE NOT NULL,  -- SHA-256 hash of API key
    key_prefix VARCHAR(10),  -- First 8 chars for display (e.g., "sk_live_")
    
    name VARCHAR(100),  -- "Production", "Development", etc.
    scopes JSONB DEFAULT '[]',  -- ["read:calls", "write:appointments"]
    
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100),
    
    expires_at TIMESTAMP  -- NULL = never expires
);

CREATE INDEX idx_api_keys_hash ON tenant_api_keys(key_hash);
CREATE INDEX idx_api_keys_tenant ON tenant_api_keys(tenant_id, is_active);


-- ============================================================================
-- STEP 6: Create Tenant Users Table (for dashboard access)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_users (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id),
    
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),  -- bcrypt hash
    full_name VARCHAR(200),
    
    role VARCHAR(20) DEFAULT 'admin',  -- admin, viewer, editor
    
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenant_users_email ON tenant_users(email);
CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);


-- ============================================================================
-- STEP 7: Migrate Existing Data (if any)
-- ============================================================================

-- Create a default tenant for existing data
INSERT INTO tenants (
    id, 
    company_name, 
    twilio_phone_number, 
    forward_to_number,
    is_active
)
VALUES (
    'default_tenant',
    'KC Comfort Air',  -- From original .env
    '+16822249904',    -- Update with actual number
    '+16822249904',    -- Update with actual number
    true
)
ON CONFLICT (id) DO NOTHING;

-- Assign existing records to default tenant
UPDATE locations SET tenant_id = 'default_tenant' WHERE tenant_id IS NULL;
UPDATE appointments SET tenant_id = 'default_tenant' WHERE tenant_id IS NULL;
UPDATE emergency_logs SET tenant_id = 'default_tenant' WHERE tenant_id IS NULL;
UPDATE call_logs SET tenant_id = 'default_tenant' WHERE tenant_id IS NULL;


-- ============================================================================
-- STEP 8: Add Constraints (after data migration)
-- ============================================================================

-- Make tenant_id NOT NULL after migration
ALTER TABLE locations ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE appointments ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE emergency_logs ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE call_logs ALTER COLUMN tenant_id SET NOT NULL;


-- ============================================================================
-- STEP 9: Create Helper Views
-- ============================================================================

-- Active tenants with recent activity
CREATE OR REPLACE VIEW v_active_tenants AS
SELECT 
    t.id,
    t.company_name,
    t.twilio_phone_number,
    t.pricing_tier,
    t.total_calls,
    t.total_appointments,
    t.last_call_at,
    COUNT(DISTINCT cl.id) as calls_last_30_days
FROM tenants t
LEFT JOIN call_logs cl ON cl.tenant_id = t.id 
    AND cl.created_at > NOW() - INTERVAL '30 days'
WHERE t.is_active = true
GROUP BY t.id;


-- Tenant summary dashboard
CREATE OR REPLACE VIEW v_tenant_summary AS
SELECT 
    t.id,
    t.company_name,
    COUNT(DISTINCT l.id) as locations_count,
    COUNT(DISTINCT a.id) as appointments_count,
    COUNT(DISTINCT cl.id) as calls_count,
    COUNT(DISTINCT e.id) as emergencies_count
FROM tenants t
LEFT JOIN locations l ON l.tenant_id = t.id AND l.is_active = true
LEFT JOIN appointments a ON a.tenant_id = t.id AND a.is_cancelled = false
LEFT JOIN call_logs cl ON cl.tenant_id = t.id
LEFT JOIN emergency_logs e ON e.tenant_id = t.id
WHERE t.is_active = true
GROUP BY t.id, t.company_name;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify migration
-- SELECT * FROM tenants;
-- SELECT table_name, column_name FROM information_schema.columns WHERE column_name = 'tenant_id';
-- SELECT * FROM v_active_tenants;
-- SELECT * FROM v_tenant_summary;
