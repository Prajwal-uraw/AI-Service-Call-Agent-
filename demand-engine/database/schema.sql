-- Demand Engine Database Schema
-- PostgreSQL (Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Business Information
    business_name VARCHAR(255),
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    
    -- Location
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    address TEXT,
    
    -- Business Details
    business_type VARCHAR(50), -- HVAC, Plumbing, Electrical, etc.
    years_in_business INTEGER,
    employee_count INTEGER,
    avg_ticket_value DECIMAL(10,2),
    calls_per_day INTEGER,
    
    -- Lead Scoring
    lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
    urgency_score INTEGER DEFAULT 0,
    budget_score INTEGER DEFAULT 0,
    authority_score INTEGER DEFAULT 0,
    pain_score INTEGER DEFAULT 0,
    
    -- Lead Classification
    tier VARCHAR(20) DEFAULT 'cold', -- hot, warm, cold, nurture
    status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, demo_scheduled, closed_won, closed_lost
    
    -- Source Tracking
    source_type VARCHAR(50), -- reddit, permit, license, jobboard, calculator
    source_url TEXT,
    source_id VARCHAR(255),
    
    -- Engagement Tracking
    email_opens INTEGER DEFAULT 0,
    email_clicks INTEGER DEFAULT 0,
    calculator_used BOOLEAN DEFAULT FALSE,
    pdf_downloaded BOOLEAN DEFAULT FALSE,
    call_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contact_at TIMESTAMP WITH TIME ZONE,
    next_follow_up_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    tags TEXT[], -- Array of tags
    custom_fields JSONB DEFAULT '{}'::jsonb
);

-- Indexes for leads
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_tier ON leads(tier);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source_type);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_next_followup ON leads(next_follow_up_at);

-- =====================================================
-- SIGNALS TABLE (Raw scraped data)
-- =====================================================
CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Source Information
    source_type VARCHAR(50) NOT NULL, -- reddit, permit, license, jobboard
    source_platform VARCHAR(100), -- r/HVAC, Indeed, etc.
    source_url TEXT,
    source_id VARCHAR(255), -- External ID from source
    
    -- Content
    title TEXT,
    content TEXT,
    author VARCHAR(255),
    author_url TEXT,
    
    -- Signal Scoring
    raw_score INTEGER DEFAULT 0,
    classified_score INTEGER DEFAULT 0,
    urgency_signals TEXT[],
    budget_signals TEXT[],
    authority_signals TEXT[],
    pain_signals TEXT[],
    
    -- Classification
    is_qualified BOOLEAN DEFAULT FALSE,
    classification_method VARCHAR(50), -- keyword, ai, hybrid
    classification_confidence DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Deduplication
    content_hash VARCHAR(64) UNIQUE, -- SHA256 hash
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of UUID REFERENCES signals(id),
    
    -- Processing Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, classified, converted, ignored
    processed_at TIMESTAMP WITH TIME ZONE,
    converted_to_lead_id UUID REFERENCES leads(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes for signals
CREATE INDEX idx_signals_source ON signals(source_type, source_platform);
CREATE INDEX idx_signals_score ON signals(classified_score DESC);
CREATE INDEX idx_signals_status ON signals(status);
CREATE INDEX idx_signals_hash ON signals(content_hash);
CREATE INDEX idx_signals_created ON signals(created_at DESC);
CREATE INDEX idx_signals_qualified ON signals(is_qualified) WHERE is_qualified = TRUE;

-- =====================================================
-- CALL RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS call_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Call Details
    call_sid VARCHAR(255), -- VAPI call ID
    phone_number VARCHAR(50),
    direction VARCHAR(20), -- inbound, outbound
    duration_seconds INTEGER,
    
    -- Call Status
    status VARCHAR(50), -- completed, no-answer, busy, failed, voicemail
    disposition VARCHAR(50), -- interested, not_interested, callback, qualified, not_qualified
    
    -- Qualification Results
    qualification_score INTEGER,
    is_qualified BOOLEAN DEFAULT FALSE,
    tier_assigned VARCHAR(20), -- hot, warm, cold
    
    -- Call Content
    transcript TEXT,
    summary TEXT,
    key_points TEXT[],
    objections TEXT[],
    next_steps TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    call_started_at TIMESTAMP WITH TIME ZONE,
    call_ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    recording_url TEXT,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes for call_records
CREATE INDEX idx_calls_lead ON call_records(lead_id);
CREATE INDEX idx_calls_status ON call_records(status);
CREATE INDEX idx_calls_qualified ON call_records(is_qualified);
CREATE INDEX idx_calls_created ON call_records(created_at DESC);

-- =====================================================
-- TRIGGERS TABLE (Follow-up automation)
-- =====================================================
CREATE TABLE IF NOT EXISTS triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Trigger Definition
    trigger_type VARCHAR(50) NOT NULL, -- seasonal, regulatory, news, competitor, review
    trigger_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Trigger Content
    headline TEXT,
    content TEXT,
    source_url TEXT,
    
    -- Targeting
    target_business_types TEXT[], -- ['HVAC', 'Plumbing']
    target_cities TEXT[],
    target_states TEXT[],
    
    -- Activation
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 50, -- 0-100
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Usage Tracking
    times_used INTEGER DEFAULT 0,
    leads_matched INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for triggers
CREATE INDEX idx_triggers_type ON triggers(trigger_type);
CREATE INDEX idx_triggers_active ON triggers(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_triggers_valid ON triggers(valid_from, valid_until);

-- =====================================================
-- FOLLOW_UP_EMAILS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS follow_up_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    trigger_id UUID REFERENCES triggers(id),
    
    -- Email Details
    subject VARCHAR(500),
    body_html TEXT,
    body_text TEXT,
    
    -- Personalization
    personalization_data JSONB DEFAULT '{}'::jsonb,
    
    -- Delivery
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, bounced, failed
    send_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Engagement
    opened_at TIMESTAMP WITH TIME ZONE,
    open_count INTEGER DEFAULT 0,
    clicked_at TIMESTAMP WITH TIME ZONE,
    click_count INTEGER DEFAULT 0,
    
    -- Email Service
    email_service_id VARCHAR(255), -- SendGrid message ID
    email_service_provider VARCHAR(50) DEFAULT 'sendgrid',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for follow_up_emails
CREATE INDEX idx_followup_lead ON follow_up_emails(lead_id);
CREATE INDEX idx_followup_trigger ON follow_up_emails(trigger_id);
CREATE INDEX idx_followup_status ON follow_up_emails(status);
CREATE INDEX idx_followup_send_at ON follow_up_emails(send_at);
CREATE INDEX idx_followup_created ON follow_up_emails(created_at DESC);

-- =====================================================
-- ENGAGEMENT_TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS engagement_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Event Details
    event_type VARCHAR(50) NOT NULL, -- email_open, email_click, page_view, calculator_use, pdf_download
    event_source VARCHAR(100), -- email_id, page_url, etc.
    event_data JSONB DEFAULT '{}'::jsonb,
    
    -- Context
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for engagement_tracking
CREATE INDEX idx_engagement_lead ON engagement_tracking(lead_id);
CREATE INDEX idx_engagement_type ON engagement_tracking(event_type);
CREATE INDEX idx_engagement_created ON engagement_tracking(created_at DESC);

-- =====================================================
-- CALCULATOR_SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS calculator_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id),
    
    -- Input Data
    business_type VARCHAR(50),
    avg_ticket_value DECIMAL(10,2),
    calls_per_day INTEGER,
    missed_calls_per_day INTEGER,
    current_answer_rate DECIMAL(5,2),
    
    -- Calculated Results
    annual_missed_revenue DECIMAL(12,2),
    recoverable_revenue DECIMAL(12,2),
    roi_percentage DECIMAL(6,2),
    payback_months INTEGER,
    
    -- Lead Capture
    email_captured BOOLEAN DEFAULT FALSE,
    email VARCHAR(255),
    phone VARCHAR(50),
    pdf_generated BOOLEAN DEFAULT FALSE,
    pdf_url TEXT,
    
    -- Session
    session_id VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for calculator_submissions
CREATE INDEX idx_calculator_lead ON calculator_submissions(lead_id);
CREATE INDEX idx_calculator_session ON calculator_submissions(session_id);
CREATE INDEX idx_calculator_email ON calculator_submissions(email) WHERE email IS NOT NULL;
CREATE INDEX idx_calculator_created ON calculator_submissions(created_at DESC);

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_triggers_updated_at BEFORE UPDATE ON triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate lead score
CREATE OR REPLACE FUNCTION calculate_lead_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.lead_score = LEAST(100, GREATEST(0, 
        COALESCE(NEW.urgency_score, 0) + 
        COALESCE(NEW.budget_score, 0) + 
        COALESCE(NEW.authority_score, 0) + 
        COALESCE(NEW.pain_score, 0)
    ));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_lead_score_trigger 
BEFORE INSERT OR UPDATE OF urgency_score, budget_score, authority_score, pain_score ON leads
    FOR EACH ROW EXECUTE FUNCTION calculate_lead_score();

-- =====================================================
-- VIEWS
-- =====================================================

-- High-value leads view
CREATE OR REPLACE VIEW high_value_leads AS
SELECT 
    l.*,
    COUNT(DISTINCT c.id) as total_calls,
    COUNT(DISTINCT f.id) as total_emails,
    MAX(e.created_at) as last_engagement
FROM leads l
LEFT JOIN call_records c ON l.id = c.lead_id
LEFT JOIN follow_up_emails f ON l.id = f.lead_id
LEFT JOIN engagement_tracking e ON l.id = e.lead_id
WHERE l.lead_score >= 70
GROUP BY l.id;

-- Daily signal summary view
CREATE OR REPLACE VIEW daily_signal_summary AS
SELECT 
    DATE(created_at) as date,
    source_type,
    COUNT(*) as total_signals,
    COUNT(*) FILTER (WHERE is_qualified = TRUE) as qualified_signals,
    AVG(classified_score) as avg_score,
    COUNT(*) FILTER (WHERE converted_to_lead_id IS NOT NULL) as converted_to_leads
FROM signals
GROUP BY DATE(created_at), source_type
ORDER BY date DESC, source_type;

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert sample trigger for testing
INSERT INTO triggers (trigger_type, trigger_name, description, headline, target_business_types, is_active)
VALUES (
    'seasonal',
    'Winter HVAC Prep',
    'Seasonal trigger for winter preparation',
    'Is Your HVAC Business Ready for Winter Rush?',
    ARRAY['HVAC'],
    TRUE
);

COMMENT ON TABLE leads IS 'Main leads table - stores all potential customers';
COMMENT ON TABLE signals IS 'Raw scraped signals before conversion to leads';
COMMENT ON TABLE call_records IS 'AI call records and qualification results';
COMMENT ON TABLE triggers IS 'Follow-up automation triggers';
COMMENT ON TABLE follow_up_emails IS 'Automated follow-up email tracking';
COMMENT ON TABLE engagement_tracking IS 'All engagement events (opens, clicks, views)';
COMMENT ON TABLE calculator_submissions IS 'ROI calculator submissions';
COMMENT ON TABLE error_logs IS 'System error logging';
