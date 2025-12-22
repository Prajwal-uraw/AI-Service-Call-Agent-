-- =====================================================
-- Migration 003: Multi-Tenant Voice Agent System
-- =====================================================
-- Description: Add multi-tenant support for voice agent WITHOUT breaking existing setup
-- Product: Voice Agent (CRM remains internal only)
-- Strategy: Preserve all existing functionality, add tenant isolation layer
-- Created: December 22, 2025

-- =====================================================
-- STEP 1: Create Tenants Table (Voice Agent Customers)
-- =====================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    slug VARCHAR(100) UNIQUE NOT NULL,  -- URL-safe: "acme-hvac"
    company_name VARCHAR(255) NOT NULL,  -- "Acme HVAC Services"
    subdomain VARCHAR(100) UNIQUE,       -- "acme-hvac.kestrel.ai"
    
    -- Business Information
    industry VARCHAR(100) DEFAULT 'hvac',  -- hvac, plumbing, both
    website_url TEXT,
    logo_url TEXT,
    
    -- Contact Information
    owner_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL UNIQUE,
    owner_phone VARCHAR(50),
    billing_email VARCHAR(255),
    
    -- Voice Agent Configuration (Core Product)
    twilio_phone_number VARCHAR(20) UNIQUE,  -- Their dedicated phone number
    twilio_account_sid VARCHAR(100),         -- Optional: their own Twilio account
    twilio_auth_token VARCHAR(100),          -- Optional: for validation
    forward_to_number VARCHAR(20),           -- Where to transfer calls
    emergency_phone VARCHAR(20),             -- Emergency escalation
    
    -- Business Hours & Location
    timezone VARCHAR(50) DEFAULT 'America/Chicago',
    business_hours JSONB DEFAULT '{"mon":{"open":"08:00","close":"17:00"},"tue":{"open":"08:00","close":"17:00"},"wed":{"open":"08:00","close":"17:00"},"thu":{"open":"08:00","close":"17:00"},"fri":{"open":"08:00","close":"17:00"},"sat":{"open":"09:00","close":"14:00"},"sun":{"open":"closed","close":"closed"}}',
    service_areas JSONB DEFAULT '[]',  -- ["Dallas", "Fort Worth"]
    
    -- AI Voice Settings
    ai_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
    ai_voice VARCHAR(50) DEFAULT 'alloy',  -- OpenAI voice
    ai_temperature DECIMAL(3,2) DEFAULT 0.7,
    use_elevenlabs BOOLEAN DEFAULT FALSE,
    elevenlabs_voice_id VARCHAR(100),
    
    -- Custom Prompts & Instructions
    custom_system_prompt TEXT,  -- Override default prompt
    greeting_message TEXT,      -- Custom greeting
    company_description TEXT,   -- For AI context
    emergency_keywords JSONB DEFAULT '["gas leak","no heat","no cooling","carbon monoxide","flooding"]',
    
    -- Subscription & Billing (Use your existing pricing)
    plan_tier VARCHAR(50) DEFAULT 'starter',  -- starter, professional, enterprise
    subscription_status VARCHAR(50) DEFAULT 'trial',  -- trial, active, past_due, cancelled
    
    -- Trial & Subscription Dates
    trial_starts_at TIMESTAMP DEFAULT NOW(),
    trial_ends_at TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days'),
    subscription_started_at TIMESTAMP,
    subscription_ends_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Usage Limits (based on plan)
    max_monthly_calls INTEGER DEFAULT 500,
    max_concurrent_calls INTEGER DEFAULT 3,
    current_month_calls INTEGER DEFAULT 0,
    
    -- Feature Flags
    features JSONB DEFAULT '{"call_recording":true,"voicemail":true,"sms_notifications":true,"email_notifications":true,"analytics":true}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_test_mode BOOLEAN DEFAULT FALSE,  -- Sandbox for testing
    
    -- Tracking
    total_calls INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    last_call_at TIMESTAMP,
    
    -- Metadata
    notes TEXT,  -- Internal notes about this customer
    onboarded_by VARCHAR(255),  -- Who set them up
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP  -- Soft delete
);

-- Indexes for performance
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_phone ON tenants(twilio_phone_number);
CREATE INDEX idx_tenants_status ON tenants(subscription_status);
CREATE INDEX idx_tenants_owner_email ON tenants(owner_email);
CREATE INDEX idx_tenants_active ON tenants(is_active) WHERE deleted_at IS NULL;

-- =====================================================
-- STEP 2: Create Tenant Users (Multi-user support)
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- User Information
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),  -- For dashboard access
    name VARCHAR(255),
    phone VARCHAR(50),
    
    -- Role & Permissions
    role VARCHAR(50) DEFAULT 'member',  -- owner, admin, member, viewer
    permissions JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_email ON tenant_users(email);

-- =====================================================
-- STEP 3: Create Tenant API Keys (For integrations)
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Key Information
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20),  -- First 8 chars: "tk_abc123..."
    name VARCHAR(255),       -- "Production", "Zapier Integration"
    
    -- Permissions & Limits
    permissions JSONB DEFAULT '{"read":true,"write":false}',
    rate_limit INTEGER DEFAULT 100,  -- Requests per minute
    
    -- Usage Tracking
    last_used_at TIMESTAMP,
    total_requests INTEGER DEFAULT 0,
    
    -- Expiration
    expires_at TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES tenant_users(id)
);

CREATE INDEX idx_tenant_api_keys_tenant_id ON tenant_api_keys(tenant_id);
CREATE INDEX idx_tenant_api_keys_hash ON tenant_api_keys(key_hash);

-- =====================================================
-- STEP 4: Create Call Logs Table (Voice Agent Calls)
-- =====================================================

CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Call Identification
    call_sid VARCHAR(100) UNIQUE NOT NULL,  -- Twilio Call SID
    
    -- Call Details
    from_number VARCHAR(20),
    to_number VARCHAR(20),
    direction VARCHAR(20),  -- inbound, outbound
    
    -- Call Status
    status VARCHAR(50),  -- queued, ringing, in-progress, completed, failed
    duration INTEGER,    -- Seconds
    
    -- Call Outcome
    outcome VARCHAR(100),  -- appointment_scheduled, transferred, voicemail, hung_up
    appointment_scheduled BOOLEAN DEFAULT FALSE,
    transferred BOOLEAN DEFAULT FALSE,
    
    -- AI Interaction
    transcript TEXT,
    ai_summary TEXT,
    sentiment VARCHAR(50),  -- positive, neutral, negative
    
    -- Customer Information (extracted by AI)
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    service_requested TEXT,
    urgency_level VARCHAR(50),  -- emergency, urgent, normal, low
    
    -- Recording
    recording_url TEXT,
    recording_duration INTEGER,
    
    -- Costs
    call_cost DECIMAL(10,4),
    ai_cost DECIMAL(10,4),
    total_cost DECIMAL(10,4),
    
    -- Timestamps
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_call_logs_tenant_id ON call_logs(tenant_id);
CREATE INDEX idx_call_logs_call_sid ON call_logs(call_sid);
CREATE INDEX idx_call_logs_started_at ON call_logs(started_at);
CREATE INDEX idx_call_logs_outcome ON call_logs(outcome);

-- =====================================================
-- STEP 5: Create Appointments Table (Scheduled by AI)
-- =====================================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    call_log_id UUID REFERENCES call_logs(id),
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    customer_address TEXT,
    
    -- Appointment Details
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    service_type VARCHAR(255),
    description TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled',  -- scheduled, confirmed, completed, cancelled, no_show
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_tenant_id ON appointments(tenant_id);
CREATE INDEX idx_appointments_scheduled_date ON appointments(scheduled_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_customer_phone ON appointments(customer_phone);

-- =====================================================
-- STEP 6: Create Tenant Usage Tracking (For billing)
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Usage Metrics
    total_calls INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    total_transfers INTEGER DEFAULT 0,
    
    -- Costs
    call_costs DECIMAL(10,2) DEFAULT 0,
    ai_costs DECIMAL(10,2) DEFAULT 0,
    total_costs DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, period_start)
);

CREATE INDEX idx_tenant_usage_tenant_id ON tenant_usage(tenant_id);
CREATE INDEX idx_tenant_usage_period ON tenant_usage(period_start, period_end);

-- =====================================================
-- STEP 7: Create Default Tenant (Preserve existing data)
-- =====================================================

-- Insert default tenant for existing voice agent setup
INSERT INTO tenants (
    slug,
    company_name,
    owner_name,
    owner_email,
    plan_tier,
    subscription_status,
    is_active
) VALUES (
    'default',
    'KC Comfort Air (Default)',
    'System Admin',
    'admin@kccomfortair.com',
    'enterprise',
    'active',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- STEP 8: Updated_at Triggers
-- =====================================================

-- Trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_users_updated_at 
    BEFORE UPDATE ON tenant_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_usage_updated_at 
    BEFORE UPDATE ON tenant_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 9: Add tenant_id to CRM tables (Internal only)
-- =====================================================
-- NOTE: CRM is internal, but we still add tenant_id for future flexibility

-- Only if these tables exist (they're for internal CRM)
DO $$
BEGIN
    -- Leads table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leads') THEN
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
        CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);
        
        -- Assign existing leads to default tenant
        UPDATE leads SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default' LIMIT 1)
        WHERE tenant_id IS NULL;
    END IF;
    
    -- Signals table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'signals') THEN
        ALTER TABLE signals ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
        CREATE INDEX IF NOT EXISTS idx_signals_tenant_id ON signals(tenant_id);
        
        UPDATE signals SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default' LIMIT 1)
        WHERE tenant_id IS NULL;
    END IF;
    
    -- Contacts table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contacts') THEN
        ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
        CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts(tenant_id);
        
        UPDATE contacts SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default' LIMIT 1)
        WHERE tenant_id IS NULL;
    END IF;
END $$;

-- =====================================================
-- STEP 10: Create Views for Analytics
-- =====================================================

-- Tenant Dashboard View
CREATE OR REPLACE VIEW tenant_dashboard_stats AS
SELECT 
    t.id as tenant_id,
    t.company_name,
    t.subscription_status,
    t.plan_tier,
    COUNT(DISTINCT cl.id) as total_calls,
    COUNT(DISTINCT cl.id) FILTER (WHERE cl.started_at >= NOW() - INTERVAL '30 days') as calls_last_30_days,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.scheduled_date >= CURRENT_DATE) as upcoming_appointments,
    AVG(cl.duration) as avg_call_duration,
    SUM(cl.total_cost) as total_costs,
    t.current_month_calls,
    t.max_monthly_calls,
    ROUND((t.current_month_calls::DECIMAL / NULLIF(t.max_monthly_calls, 0)) * 100, 2) as usage_percentage
FROM tenants t
LEFT JOIN call_logs cl ON cl.tenant_id = t.id
LEFT JOIN appointments a ON a.tenant_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.company_name, t.subscription_status, t.plan_tier, t.current_month_calls, t.max_monthly_calls;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE tenants IS 'Voice agent customers (HVAC/Plumbing companies)';
COMMENT ON TABLE tenant_users IS 'Users who can access tenant dashboard';
COMMENT ON TABLE tenant_api_keys IS 'API keys for programmatic access';
COMMENT ON TABLE call_logs IS 'All voice agent calls per tenant';
COMMENT ON TABLE appointments IS 'Appointments scheduled by voice agent';
COMMENT ON TABLE tenant_usage IS 'Usage tracking for billing';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run this migration on development database
-- 2. Verify default tenant exists
-- 3. Test existing voice agent still works
-- 4. Build tenant resolver middleware
-- 5. Build onboarding UI
-- =====================================================
