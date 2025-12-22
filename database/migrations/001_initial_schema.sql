-- =====================================================
-- Migration 001: Initial Schema (Leads & Signals)
-- =====================================================
-- Description: Core tables for lead management and pain signal tracking
-- Created: Phase 1-2
-- Run Order: 1

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Business Information
    business_name VARCHAR(255),
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Location
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    
    -- Business Details
    business_type VARCHAR(100),
    years_in_business INTEGER,
    employee_count INTEGER,
    annual_revenue DECIMAL(15,2),
    
    -- Lead Scoring (0-100)
    urgency_score INTEGER DEFAULT 0,
    budget_score INTEGER DEFAULT 0,
    authority_score INTEGER DEFAULT 0,
    pain_score INTEGER DEFAULT 0,
    lead_score INTEGER GENERATED ALWAYS AS (
        (urgency_score + budget_score + authority_score + pain_score) / 4
    ) STORED,
    
    -- Lead Classification
    tier VARCHAR(20) DEFAULT 'cold',
    status VARCHAR(50) DEFAULT 'new',
    
    -- Source Tracking
    source_type VARCHAR(50),
    source_url TEXT,
    source_content TEXT,
    
    -- Engagement Tracking
    last_contact_at TIMESTAMP,
    next_follow_up_at TIMESTAMP,
    contact_attempts INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Additional Data
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB,
    
    -- PDF & Email
    pdf_url TEXT,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP
);

-- Signals table
CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Source Information
    source_type VARCHAR(50) NOT NULL,
    source_url TEXT,
    source_id VARCHAR(255),
    
    -- Content
    title TEXT,
    content TEXT NOT NULL,
    author VARCHAR(255),
    
    -- Signal Scoring
    urgency_score INTEGER DEFAULT 0,
    budget_score INTEGER DEFAULT 0,
    authority_score INTEGER DEFAULT 0,
    pain_score INTEGER DEFAULT 0,
    sentiment_score DECIMAL(3,2),
    intent_score DECIMAL(3,2),
    
    -- Classification
    signal_type VARCHAR(50),
    keywords TEXT[],
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    alerted BOOLEAN DEFAULT FALSE,
    converted_to_lead BOOLEAN DEFAULT FALSE,
    lead_id UUID REFERENCES leads(id),
    
    -- AI Analysis
    ai_analysis JSONB,
    recommended_actions TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    posted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_tier ON leads(tier);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

CREATE INDEX IF NOT EXISTS idx_signals_source_type ON signals(source_type);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_alerted ON signals(alerted);
CREATE INDEX IF NOT EXISTS idx_signals_converted ON signals(converted_to_lead);
CREATE INDEX IF NOT EXISTS idx_signals_lead_id ON signals(lead_id);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signals_updated_at BEFORE UPDATE ON signals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE leads IS 'Core lead management table with scoring and tracking';
COMMENT ON TABLE signals IS 'Pain signals from various sources (Reddit, job boards, etc.)';
