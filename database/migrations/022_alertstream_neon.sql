-- =====================================================
-- Migration 022: AlertStream Tables (Neon DB)
-- =====================================================
-- AlertStream SMS Alert System - Separate from main Supabase DB
-- Run this on Neon: postgresql://neondb_owner:npg_jry0eQfqV4TG@ep-muddy-mode-adfmj0bm-pooler.c-2.us-east-1.aws.neon.tech/neondb
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    
    -- Subscription
    plan VARCHAR(50) DEFAULT 'free',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    
    -- SMS Quota
    sms_quota INTEGER DEFAULT 100,
    sms_used INTEGER DEFAULT 0,
    
    -- Billing Cycle
    billing_cycle_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    billing_cycle_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- =====================================================
-- WEBSITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Website Info
    domain VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Stats
    total_events INTEGER DEFAULT 0,
    total_alerts_sent INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_event_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_websites_user_id ON websites(user_id);
CREATE INDEX idx_websites_api_key ON websites(api_key);
CREATE INDEX idx_websites_domain ON websites(domain);

-- =====================================================
-- TRIGGERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    
    -- Trigger Config
    name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    conditions JSONB DEFAULT '{}',
    
    -- SMS Config
    sms_template TEXT NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Stats
    times_triggered INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_triggers_website_id ON triggers(website_id);
CREATE INDEX idx_triggers_event_type ON triggers(event_type);
CREATE INDEX idx_triggers_is_active ON triggers(is_active) WHERE is_active = TRUE;

-- =====================================================
-- EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    
    -- Event Data
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    
    -- Source Info
    ip_address VARCHAR(50),
    user_agent TEXT,
    page_url TEXT,
    referrer TEXT,
    
    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    triggered_alert BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_website_id ON events(website_id);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_processed ON events(processed) WHERE processed = FALSE;

-- =====================================================
-- SMS_MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sms_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trigger_id UUID REFERENCES triggers(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Message Details
    phone_number VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    
    -- Twilio Response
    twilio_sid VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    error_code VARCHAR(50),
    error_message TEXT,
    
    -- Cost
    cost DECIMAL(10, 4) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sms_messages_user_id ON sms_messages(user_id);
CREATE INDEX idx_sms_messages_status ON sms_messages(status);
CREATE INDEX idx_sms_messages_created_at ON sms_messages(created_at DESC);

-- =====================================================
-- API_KEYS TABLE (for additional API keys per website)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    
    -- Key Details
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    name VARCHAR(255),
    
    -- Permissions
    permissions JSONB DEFAULT '["read", "write"]',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Usage
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);

-- =====================================================
-- SUBSCRIPTIONS TABLE (Stripe integration)
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Stripe Data
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255),
    stripe_product_id VARCHAR(255),
    
    -- Plan Details
    plan_name VARCHAR(50) NOT NULL,
    sms_quota INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    billing_interval VARCHAR(20) DEFAULT 'month',
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Dates
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- =====================================================
-- WEBHOOK_LOGS TABLE (for debugging)
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Source
    source VARCHAR(50) NOT NULL,
    event_type VARCHAR(100),
    
    -- Payload
    payload JSONB,
    headers JSONB,
    
    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    error TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_source ON webhook_logs(source);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);

-- =====================================================
-- TRIGGERS (Auto-update timestamps)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_triggers_updated_at BEFORE UPDATE ON triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (Default plans)
-- =====================================================
-- Create a demo user for testing
INSERT INTO users (id, email, password_hash, phone_number, plan, sms_quota, sms_used)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@alertstream.io',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYn/W1Ey1Kq2', -- password: demo123
    '+15551234567',
    'starter',
    500,
    0
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE users IS 'AlertStream user accounts with subscription info';
COMMENT ON TABLE websites IS 'Websites registered for event monitoring';
COMMENT ON TABLE triggers IS 'SMS alert triggers with conditions';
COMMENT ON TABLE events IS 'Incoming events from monitored websites';
COMMENT ON TABLE sms_messages IS 'SMS message history and delivery status';
COMMENT ON TABLE subscriptions IS 'Stripe subscription records';

-- =====================================================
-- SUCCESS
-- =====================================================
SELECT 'AlertStream Neon DB migration completed!' as status;
