-- =====================================================
-- Migration 006: STANDALONE - No Dependencies
-- =====================================================
-- Creates tables WITHOUT foreign key constraints
-- Run this if you keep getting "column not found" errors
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SIGNALS TABLE (NO FOREIGN KEYS)
-- =====================================================

CREATE TABLE IF NOT EXISTS signals (
    id SERIAL PRIMARY KEY,
    tenant_id UUID,  -- NO FOREIGN KEY CONSTRAINT
    
    -- Signal Content
    title TEXT NOT NULL,
    content TEXT,
    url TEXT,
    source VARCHAR(100) NOT NULL,
    
    -- AI Scoring
    pain_score FLOAT DEFAULT 0,
    urgency_score FLOAT DEFAULT 0,
    relevance_score FLOAT DEFAULT 0,
    
    -- Extracted Information
    business_name VARCHAR(255),
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    location VARCHAR(255),
    industry VARCHAR(100),
    
    -- Signal Metadata
    signal_type VARCHAR(50),
    keywords JSONB DEFAULT '[]',
    sentiment VARCHAR(50),
    
    -- Processing Status
    status VARCHAR(50) DEFAULT 'new',
    assigned_to UUID,  -- NO FOREIGN KEY CONSTRAINT
    
    -- Engagement Tracking
    viewed_at TIMESTAMP,
    contacted_at TIMESTAMP,
    converted_at TIMESTAMP,
    dismissed_at TIMESTAMP,
    dismissal_reason TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_signals_tenant_id ON signals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_signals_pain_score ON signals(pain_score DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_source ON signals(source);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_business_name ON signals(business_name);

-- =====================================================
-- SCRAPING JOBS TABLE (NO FOREIGN KEYS)
-- =====================================================

CREATE TABLE IF NOT EXISTS scraping_jobs (
    id SERIAL PRIMARY KEY,
    job_type VARCHAR(100) NOT NULL,
    source VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    results_count INTEGER DEFAULT 0,
    signals_created INTEGER DEFAULT 0,
    signals_updated INTEGER DEFAULT 0,
    error TEXT,
    error_count INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_job_type ON scraping_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_started_at ON scraping_jobs(started_at DESC);

-- =====================================================
-- BUSINESS CONTACTS TABLE (NO FOREIGN KEYS)
-- =====================================================

CREATE TABLE IF NOT EXISTS business_contacts (
    id SERIAL PRIMARY KEY,
    tenant_id UUID,  -- NO FOREIGN KEY CONSTRAINT
    signal_id INTEGER,  -- NO FOREIGN KEY CONSTRAINT
    
    -- Business Information
    business_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    business_type VARCHAR(100),
    
    -- Contact Information
    contact_name VARCHAR(255),
    contact_title VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    website TEXT,
    
    -- Location
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'USA',
    
    -- Business Details
    license_number VARCHAR(100),
    license_status VARCHAR(50),
    years_in_business INTEGER,
    employee_count VARCHAR(50),
    annual_revenue VARCHAR(50),
    
    -- Data Source
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    source_data JSONB DEFAULT '{}',
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    data_quality_score FLOAT DEFAULT 0,
    
    -- Engagement
    contacted BOOLEAN DEFAULT FALSE,
    contacted_at TIMESTAMP,
    contact_method VARCHAR(50),
    response_received BOOLEAN DEFAULT FALSE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_contacts_tenant_id ON business_contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_contacts_business_name ON business_contacts(business_name);
CREATE INDEX IF NOT EXISTS idx_business_contacts_source ON business_contacts(source);
CREATE INDEX IF NOT EXISTS idx_business_contacts_status ON business_contacts(status);
CREATE INDEX IF NOT EXISTS idx_business_contacts_email ON business_contacts(email);
CREATE INDEX IF NOT EXISTS idx_business_contacts_phone ON business_contacts(phone);

-- =====================================================
-- SCRAPER SOURCES TABLE (NO FOREIGN KEYS)
-- =====================================================

CREATE TABLE IF NOT EXISTS scraper_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    url TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}',
    scrape_frequency VARCHAR(50) DEFAULT 'daily',
    last_scraped_at TIMESTAMP,
    next_scrape_at TIMESTAMP,
    total_scrapes INTEGER DEFAULT 0,
    total_signals INTEGER DEFAULT 0,
    avg_signals_per_scrape FLOAT DEFAULT 0,
    success_rate FLOAT DEFAULT 100,
    status VARCHAR(50) DEFAULT 'active',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scraper_sources_type ON scraper_sources(type);
CREATE INDEX IF NOT EXISTS idx_scraper_sources_enabled ON scraper_sources(enabled);

-- Insert default sources
INSERT INTO scraper_sources (name, type, url, config) VALUES
    ('BBB Complaints', 'bbb', 'https://www.bbb.org', '{"categories": ["hvac", "plumbing", "electrical"]}'),
    ('Texas HVAC Licensing', 'licensing', 'https://www.tdlr.texas.gov', '{"state": "TX", "license_type": "HVAC"}'),
    ('Indeed Jobs', 'job_board', 'https://www.indeed.com', '{"keywords": ["hvac", "plumbing", "service manager"]}'),
    ('ACCA Association', 'association', 'https://www.acca.org', '{"membership_directory": true}'),
    ('PHCC Association', 'association', 'https://www.phccweb.org', '{"membership_directory": true}')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ENGAGEMENT TRACKING TABLE (NO FOREIGN KEYS)
-- =====================================================

CREATE TABLE IF NOT EXISTS engagement_tracking (
    id SERIAL PRIMARY KEY,
    tenant_id UUID,  -- NO FOREIGN KEY CONSTRAINT
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    user_ip VARCHAR(50),
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    session_id VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_engagement_tracking_tenant_id ON engagement_tracking(tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagement_tracking_event_type ON engagement_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_engagement_tracking_created_at ON engagement_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_tracking_user_email ON engagement_tracking(user_email);

-- =====================================================
-- ERROR LOGS TABLE (NO FOREIGN KEYS)
-- =====================================================

CREATE TABLE IF NOT EXISTS error_logs (
    id SERIAL PRIMARY KEY,
    tenant_id UUID,  -- NO FOREIGN KEY CONSTRAINT
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    service VARCHAR(50),
    endpoint TEXT,
    method VARCHAR(10),
    request_data JSONB DEFAULT '{}',
    user_id UUID,  -- NO FOREIGN KEY CONSTRAINT
    environment VARCHAR(50) DEFAULT 'production',
    severity VARCHAR(50) DEFAULT 'error',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by UUID,  -- NO FOREIGN KEY CONSTRAINT
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_tenant_id ON error_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE signals IS 'Pain signals detected from various sources';
COMMENT ON TABLE scraping_jobs IS 'Tracking for all scraping job executions';
COMMENT ON TABLE business_contacts IS 'Business owner contact information';
COMMENT ON TABLE scraper_sources IS 'Configuration for different scraping sources';
COMMENT ON TABLE engagement_tracking IS 'User engagement and activity tracking';
COMMENT ON TABLE error_logs IS 'Application error logging';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'Migration 006 STANDALONE completed successfully!' as status,
       'All tables created without foreign key constraints' as note;
