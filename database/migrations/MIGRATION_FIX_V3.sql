-- =====================================================
-- MIGRATION FIX V3: Add Multi-Tenant Support to Existing Database
-- =====================================================
-- This migration adds tenant support WITHOUT breaking existing data
-- Run this AFTER migrations 1 and 2
-- Your existing Twilio number will continue to work
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: Create Tenants Table
-- =====================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    industry VARCHAR(100) DEFAULT 'hvac',
    website_url TEXT,
    logo_url TEXT,
    owner_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL UNIQUE,
    owner_phone VARCHAR(50),
    billing_email VARCHAR(255),
    twilio_phone_number VARCHAR(20) UNIQUE,
    twilio_account_sid VARCHAR(100),
    twilio_auth_token VARCHAR(100),
    forward_to_number VARCHAR(20),
    emergency_phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'America/Chicago',
    business_hours JSONB DEFAULT '{"mon":{"open":"08:00","close":"17:00"},"tue":{"open":"08:00","close":"17:00"},"wed":{"open":"08:00","close":"17:00"},"thu":{"open":"08:00","close":"17:00"},"fri":{"open":"08:00","close":"17:00"},"sat":{"open":"09:00","close":"14:00"},"sun":{"open":"closed","close":"closed"}}',
    service_areas JSONB DEFAULT '[]',
    ai_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
    ai_voice VARCHAR(50) DEFAULT 'alloy',
    ai_temperature DECIMAL(3,2) DEFAULT 0.7,
    use_elevenlabs BOOLEAN DEFAULT FALSE,
    elevenlabs_voice_id VARCHAR(100),
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_plan VARCHAR(50) DEFAULT 'professional',
    trial_ends_at TIMESTAMP,
    monthly_price DECIMAL(10,2) DEFAULT 1997.00,
    monthly_call_limit INTEGER DEFAULT 2000,
    monthly_minutes_limit INTEGER DEFAULT 4000,
    forward_number VARCHAR(20),
    enable_recording BOOLEAN DEFAULT true,
    ai_calls_used INTEGER DEFAULT 0,
    ai_calls_limit INTEGER DEFAULT 100,
    missed_call_sms_enabled BOOLEAN DEFAULT true,
    missed_call_sms_template TEXT DEFAULT 'Sorry we missed your call! We''ll call you back during business hours (8am-6pm).',
    is_active BOOLEAN DEFAULT TRUE,
    onboarding_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STEP 2: Insert Default Tenant (Your Current Setup)
-- =====================================================
-- This preserves your existing Twilio configuration

DO $$
DECLARE
    default_tenant_id UUID;
BEGIN
    -- Insert default tenant if it doesn't exist
    INSERT INTO tenants (
        slug,
        company_name,
        owner_name,
        owner_email,
        industry,
        subscription_status,
        subscription_plan,
        is_active,
        onboarding_completed,
        twilio_phone_number
    ) VALUES (
        'default',
        'KC Comfort Air',
        'System Admin',
        'admin@kccomfortair.com',
        'hvac',
        'active',
        'professional',
        TRUE,
        TRUE,
        '+1234567890'  -- Your Twilio number from .env.local
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO default_tenant_id;
    
    -- Store the default tenant ID for later use
    IF default_tenant_id IS NULL THEN
        SELECT id INTO default_tenant_id FROM tenants WHERE slug = 'default';
    END IF;
    
    RAISE NOTICE 'Default tenant ID: %', default_tenant_id;
END $$;

-- =====================================================
-- STEP 3: Add tenant_id to Existing Tables (if not exists)
-- =====================================================

-- Add tenant_id to leads table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE leads ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        
        -- Backfill existing leads with default tenant
        UPDATE leads SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
        WHERE tenant_id IS NULL;
        
        RAISE NOTICE 'Added tenant_id to leads table';
    END IF;
END $$;

-- Add tenant_id to signals table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signals' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE signals ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        
        -- Backfill existing signals with default tenant
        UPDATE signals SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
        WHERE tenant_id IS NULL;
        
        RAISE NOTICE 'Added tenant_id to signals table';
    END IF;
END $$;

-- Add tenant_id to contacts table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contacts' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE contacts ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        
        -- Backfill existing contacts with default tenant
        UPDATE contacts SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
        WHERE tenant_id IS NULL;
        
        RAISE NOTICE 'Added tenant_id to contacts table';
    END IF;
END $$;

-- =====================================================
-- STEP 4: Create New Multi-Tenant Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    auth_user_id UUID,
    can_view_calls BOOLEAN DEFAULT TRUE,
    can_manage_settings BOOLEAN DEFAULT TRUE,
    can_view_analytics BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

CREATE TABLE IF NOT EXISTS tenant_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(100) UNIQUE NOT NULL,
    api_secret VARCHAR(100),
    scopes JSONB DEFAULT '["calls:read", "calls:write"]',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, key_name)
);

CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    call_sid VARCHAR(100) UNIQUE NOT NULL,
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    direction VARCHAR(20) DEFAULT 'inbound',
    status VARCHAR(50),
    duration INTEGER DEFAULT 0,
    recording_url TEXT,
    recording_duration INTEGER,
    transcript TEXT,
    summary TEXT,
    intent VARCHAR(100),
    sentiment VARCHAR(50),
    appointment_booked BOOLEAN DEFAULT FALSE,
    appointment_id UUID,
    emergency_detected BOOLEAN DEFAULT FALSE,
    transferred BOOLEAN DEFAULT FALSE,
    is_missed BOOLEAN DEFAULT false,
    is_after_hours BOOLEAN DEFAULT false,
    is_dropped BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    sms_sid VARCHAR(50),
    cost DECIMAL(10,4),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    call_log_id UUID REFERENCES call_logs(id),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    customer_address TEXT,
    service_type VARCHAR(100),
    problem_description TEXT,
    preferred_date DATE,
    preferred_time_slot VARCHAR(50),
    scheduled_date TIMESTAMP,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(50) DEFAULT 'pending',
    confirmed BOOLEAN DEFAULT FALSE,
    ai_notes TEXT,
    technician_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_calls INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    total_emergencies INTEGER DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, period_start)
);

CREATE TABLE IF NOT EXISTS weekly_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_calls INTEGER DEFAULT 0,
    answered_calls INTEGER DEFAULT 0,
    missed_calls INTEGER DEFAULT 0,
    after_hours_calls INTEGER DEFAULT 0,
    dropped_calls INTEGER DEFAULT 0,
    appointments_booked INTEGER DEFAULT 0,
    emergencies_detected INTEGER DEFAULT 0,
    avg_call_duration DECIMAL(10,2),
    total_call_minutes INTEGER DEFAULT 0,
    sms_sent INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, week_start)
);

-- =====================================================
-- STEP 5: Create Indexes
-- =====================================================

-- Tenants indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_email ON tenants(owner_email);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenants_twilio_phone ON tenants(twilio_phone_number);

-- Tenant users indexes
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);

-- Call logs indexes
CREATE INDEX IF NOT EXISTS idx_call_logs_tenant_id ON call_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_sid ON call_logs(call_sid);
CREATE INDEX IF NOT EXISTS idx_call_logs_from_number ON call_logs(from_number);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id ON appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_phone ON appointments(customer_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Weekly analytics indexes
CREATE INDEX IF NOT EXISTS idx_weekly_analytics_tenant_id ON weekly_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_weekly_analytics_week_start ON weekly_analytics(week_start);

-- Existing tables indexes (only if tenant_id exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'tenant_id') THEN
        CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signals' AND column_name = 'tenant_id') THEN
        CREATE INDEX IF NOT EXISTS idx_signals_tenant_id ON signals(tenant_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'tenant_id') THEN
        CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts(tenant_id);
    END IF;
END $$;

-- =====================================================
-- STEP 6: Create Triggers
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_users_updated_at BEFORE UPDATE ON tenant_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 7: Create Dashboard View
-- =====================================================

CREATE OR REPLACE VIEW tenant_dashboard_stats AS
SELECT 
    t.id as tenant_id,
    t.company_name,
    t.subscription_status,
    t.twilio_phone_number,
    COUNT(DISTINCT cl.id) FILTER (WHERE cl.created_at >= DATE_TRUNC('month', CURRENT_DATE)) as calls_this_month,
    COUNT(DISTINCT a.id) FILTER (WHERE a.created_at >= DATE_TRUNC('month', CURRENT_DATE)) as appointments_this_month,
    COUNT(DISTINCT cl.id) as total_calls,
    COUNT(DISTINCT a.id) as total_appointments,
    MAX(cl.created_at) as last_call_at,
    MAX(a.created_at) as last_appointment_at
FROM tenants t
LEFT JOIN call_logs cl ON cl.tenant_id = t.id
LEFT JOIN appointments a ON a.tenant_id = t.id
GROUP BY t.id, t.company_name, t.subscription_status, t.twilio_phone_number;

-- =====================================================
-- STEP 8: Create Function to Get Tenant by Phone Number
-- =====================================================
-- This ensures your existing Twilio number routes to the correct tenant

CREATE OR REPLACE FUNCTION get_tenant_by_phone(phone_number VARCHAR)
RETURNS UUID AS $$
DECLARE
    tenant_uuid UUID;
BEGIN
    SELECT id INTO tenant_uuid
    FROM tenants
    WHERE twilio_phone_number = phone_number
    LIMIT 1;
    
    -- If no tenant found, return default tenant
    IF tenant_uuid IS NULL THEN
        SELECT id INTO tenant_uuid FROM tenants WHERE slug = 'default';
    END IF;
    
    RETURN tenant_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DONE! Your existing Twilio setup is preserved
-- =====================================================

-- Verify default tenant
SELECT 
    id,
    slug,
    company_name,
    twilio_phone_number,
    subscription_status,
    is_active
FROM tenants 
WHERE slug = 'default';
