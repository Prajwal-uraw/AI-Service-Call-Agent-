-- =====================================================
-- MIGRATION FIX: Run this to fix migration 3 and 5 errors
-- =====================================================
-- This file creates the tenants table and applies migration 5 changes
-- Run this AFTER migrations 1 and 2

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: Create Tenants Table
-- =====================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    slug VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    
    -- Business Information
    industry VARCHAR(100) DEFAULT 'hvac',
    website_url TEXT,
    logo_url TEXT,
    
    -- Contact Information
    owner_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL UNIQUE,
    owner_phone VARCHAR(50),
    billing_email VARCHAR(255),
    
    -- Voice Agent Configuration
    twilio_phone_number VARCHAR(20) UNIQUE,
    twilio_account_sid VARCHAR(100),
    twilio_auth_token VARCHAR(100),
    forward_to_number VARCHAR(20),
    emergency_phone VARCHAR(20),
    
    -- Business Hours & Location
    timezone VARCHAR(50) DEFAULT 'America/Chicago',
    business_hours JSONB DEFAULT '{"mon":{"open":"08:00","close":"17:00"},"tue":{"open":"08:00","close":"17:00"},"wed":{"open":"08:00","close":"17:00"},"thu":{"open":"08:00","close":"17:00"},"fri":{"open":"08:00","close":"17:00"},"sat":{"open":"09:00","close":"14:00"},"sun":{"open":"closed","close":"closed"}}',
    service_areas JSONB DEFAULT '[]',
    
    -- AI Voice Settings
    ai_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
    ai_voice VARCHAR(50) DEFAULT 'alloy',
    ai_temperature DECIMAL(3,2) DEFAULT 0.7,
    use_elevenlabs BOOLEAN DEFAULT FALSE,
    elevenlabs_voice_id VARCHAR(100),
    
    -- Subscription & Billing
    subscription_status VARCHAR(50) DEFAULT 'trial',
    subscription_plan VARCHAR(50) DEFAULT 'starter',
    trial_ends_at TIMESTAMP,
    monthly_price DECIMAL(10,2) DEFAULT 99.00,
    
    -- Usage Limits
    monthly_call_limit INTEGER DEFAULT 500,
    monthly_minutes_limit INTEGER DEFAULT 1000,
    
    -- Forwarding & Recording (Migration 5 columns)
    forward_number VARCHAR(20),
    enable_recording BOOLEAN DEFAULT true,
    ai_calls_used INTEGER DEFAULT 0,
    ai_calls_limit INTEGER DEFAULT 20,
    missed_call_sms_enabled BOOLEAN DEFAULT true,
    missed_call_sms_template TEXT DEFAULT 'Sorry we missed your call! We''ll call you back during business hours (8am-6pm). - KC Comfort Air',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STEP 2: Create Tenant Users Table
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- User Info
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    
    -- Auth (Supabase will handle this, but we track it)
    auth_user_id UUID,
    
    -- Permissions
    can_view_calls BOOLEAN DEFAULT TRUE,
    can_manage_settings BOOLEAN DEFAULT TRUE,
    can_view_analytics BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, email)
);

-- =====================================================
-- STEP 3: Create Tenant API Keys Table
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- API Key
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(100) UNIQUE NOT NULL,
    api_secret VARCHAR(100),
    
    -- Permissions
    scopes JSONB DEFAULT '["calls:read", "calls:write"]',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, key_name)
);

-- =====================================================
-- STEP 4: Create Call Logs Table
-- =====================================================

CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Call Identification
    call_sid VARCHAR(100) UNIQUE NOT NULL,
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    
    -- Call Details
    direction VARCHAR(20) DEFAULT 'inbound',
    status VARCHAR(50),
    duration INTEGER DEFAULT 0,
    recording_url TEXT,
    recording_duration INTEGER,
    
    -- AI Processing
    transcript TEXT,
    summary TEXT,
    intent VARCHAR(100),
    sentiment VARCHAR(50),
    
    -- Business Logic
    appointment_booked BOOLEAN DEFAULT FALSE,
    appointment_id UUID,
    emergency_detected BOOLEAN DEFAULT FALSE,
    transferred BOOLEAN DEFAULT FALSE,
    
    -- Call Status Tracking (Migration 5 columns)
    is_missed BOOLEAN DEFAULT false,
    is_after_hours BOOLEAN DEFAULT false,
    is_dropped BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    sms_sid VARCHAR(50),
    
    -- Cost Tracking
    cost DECIMAL(10,4),
    
    -- Timestamps
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STEP 5: Create Appointments Table
-- =====================================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    call_log_id UUID REFERENCES call_logs(id),
    
    -- Customer Info
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    customer_address TEXT,
    
    -- Appointment Details
    service_type VARCHAR(100),
    problem_description TEXT,
    preferred_date DATE,
    preferred_time_slot VARCHAR(50),
    
    -- Scheduling
    scheduled_date TIMESTAMP,
    duration_minutes INTEGER DEFAULT 60,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    confirmed BOOLEAN DEFAULT FALSE,
    
    -- Notes
    ai_notes TEXT,
    technician_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STEP 6: Create Tenant Usage Table
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Usage Metrics
    total_calls INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    total_emergencies INTEGER DEFAULT 0,
    
    -- Costs
    total_cost DECIMAL(10,2) DEFAULT 0.00,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, period_start)
);

-- =====================================================
-- STEP 7: Create Weekly Analytics Table (Migration 5)
-- =====================================================

CREATE TABLE IF NOT EXISTS weekly_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Week Identification
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    
    -- Call Metrics
    total_calls INTEGER DEFAULT 0,
    answered_calls INTEGER DEFAULT 0,
    missed_calls INTEGER DEFAULT 0,
    after_hours_calls INTEGER DEFAULT 0,
    dropped_calls INTEGER DEFAULT 0,
    
    -- Appointment Metrics
    appointments_booked INTEGER DEFAULT 0,
    emergencies_detected INTEGER DEFAULT 0,
    
    -- Performance Metrics
    avg_call_duration DECIMAL(10,2),
    total_call_minutes INTEGER DEFAULT 0,
    
    -- SMS Metrics
    sms_sent INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, week_start)
);

-- =====================================================
-- STEP 8: Create Call Events Table (Migration 5)
-- =====================================================
-- NOTE: Skipping call_events table due to type conflicts
-- Can be added later if needed with proper schema alignment

-- =====================================================
-- STEP 9: Create Indexes
-- =====================================================

-- Tenants indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_email ON tenants(owner_email);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);

-- Tenant users indexes
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);

-- Call logs indexes
CREATE INDEX IF NOT EXISTS idx_call_logs_tenant_id ON call_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_sid ON call_logs(call_sid);
CREATE INDEX IF NOT EXISTS idx_call_logs_from_number ON call_logs(from_number);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_call_logs_is_missed ON call_logs(is_missed);
CREATE INDEX IF NOT EXISTS idx_call_logs_is_after_hours ON call_logs(is_after_hours);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id ON appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_phone ON appointments(customer_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Weekly analytics indexes
CREATE INDEX IF NOT EXISTS idx_weekly_analytics_tenant_id ON weekly_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_weekly_analytics_week_start ON weekly_analytics(week_start);

-- =====================================================
-- STEP 10: Create Triggers
-- =====================================================

-- Updated at trigger for tenants
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

-- Weekly analytics auto-update trigger
CREATE OR REPLACE FUNCTION update_weekly_analytics()
RETURNS TRIGGER AS $$
DECLARE
    week_start_date DATE;
    week_end_date DATE;
BEGIN
    -- Calculate week boundaries (Monday to Sunday)
    week_start_date := DATE_TRUNC('week', NEW.created_at::DATE);
    week_end_date := week_start_date + INTERVAL '6 days';
    
    -- Insert or update weekly analytics
    INSERT INTO weekly_analytics (
        tenant_id,
        week_start,
        week_end,
        total_calls,
        answered_calls,
        missed_calls,
        after_hours_calls,
        dropped_calls,
        appointments_booked,
        emergencies_detected,
        total_call_minutes,
        sms_sent
    ) VALUES (
        NEW.tenant_id,
        week_start_date,
        week_end_date,
        1,
        CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        CASE WHEN NEW.is_missed THEN 1 ELSE 0 END,
        CASE WHEN NEW.is_after_hours THEN 1 ELSE 0 END,
        CASE WHEN NEW.is_dropped THEN 1 ELSE 0 END,
        CASE WHEN NEW.appointment_booked THEN 1 ELSE 0 END,
        CASE WHEN NEW.emergency_detected THEN 1 ELSE 0 END,
        COALESCE(NEW.duration, 0) / 60,
        CASE WHEN NEW.sms_sent THEN 1 ELSE 0 END
    )
    ON CONFLICT (tenant_id, week_start) DO UPDATE SET
        total_calls = weekly_analytics.total_calls + 1,
        answered_calls = weekly_analytics.answered_calls + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        missed_calls = weekly_analytics.missed_calls + CASE WHEN NEW.is_missed THEN 1 ELSE 0 END,
        after_hours_calls = weekly_analytics.after_hours_calls + CASE WHEN NEW.is_after_hours THEN 1 ELSE 0 END,
        dropped_calls = weekly_analytics.dropped_calls + CASE WHEN NEW.is_dropped THEN 1 ELSE 0 END,
        appointments_booked = weekly_analytics.appointments_booked + CASE WHEN NEW.appointment_booked THEN 1 ELSE 0 END,
        emergencies_detected = weekly_analytics.emergencies_detected + CASE WHEN NEW.emergency_detected THEN 1 ELSE 0 END,
        total_call_minutes = weekly_analytics.total_call_minutes + (COALESCE(NEW.duration, 0) / 60),
        sms_sent = weekly_analytics.sms_sent + CASE WHEN NEW.sms_sent THEN 1 ELSE 0 END,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_weekly_analytics
    AFTER INSERT ON call_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_weekly_analytics();

-- =====================================================
-- STEP 11: Create Default Tenant
-- =====================================================

INSERT INTO tenants (
    slug,
    company_name,
    owner_name,
    owner_email,
    industry,
    subscription_status,
    is_active,
    onboarding_completed
) VALUES (
    'default',
    'KC Comfort Air (Default)',
    'System Admin',
    'admin@kccomfortair.com',
    'hvac',
    'active',
    TRUE,
    TRUE
) ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- STEP 12: Create Tenant Dashboard View
-- =====================================================

CREATE OR REPLACE VIEW tenant_dashboard_stats AS
SELECT 
    t.id as tenant_id,
    t.company_name,
    t.subscription_status,
    
    -- Current Month Stats
    COUNT(DISTINCT cl.id) FILTER (WHERE cl.created_at >= DATE_TRUNC('month', CURRENT_DATE)) as calls_this_month,
    COUNT(DISTINCT a.id) FILTER (WHERE a.created_at >= DATE_TRUNC('month', CURRENT_DATE)) as appointments_this_month,
    
    -- All Time Stats
    COUNT(DISTINCT cl.id) as total_calls,
    COUNT(DISTINCT a.id) as total_appointments,
    
    -- Recent Activity
    MAX(cl.created_at) as last_call_at,
    MAX(a.created_at) as last_appointment_at
    
FROM tenants t
LEFT JOIN call_logs cl ON cl.tenant_id = t.id
LEFT JOIN appointments a ON a.tenant_id = t.id
GROUP BY t.id, t.company_name, t.subscription_status;

-- =====================================================
-- DONE! Migration 3 and 5 combined
-- =====================================================
