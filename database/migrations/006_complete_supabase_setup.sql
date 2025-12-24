-- =====================================================
-- Migration 006: Complete Supabase Setup for All Services
-- =====================================================
-- Description: Comprehensive database schema for all engines
-- Includes: Signals, Scraping Jobs, and missing tables
-- Builds on: Migrations 001-005 (CRM, Multi-tenant, Fixes)
-- Created: December 23, 2025
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SIGNALS TABLE (Pain Signal Detection)
-- =====================================================

CREATE TABLE IF NOT EXISTS signals (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Signal Content
    title TEXT NOT NULL,
    content TEXT,
    url TEXT,
    source VARCHAR(100) NOT NULL,  -- reddit, bbb, licensing, job_boards, etc
    
    -- AI Scoring
    pain_score FLOAT DEFAULT 0 CHECK (pain_score >= 0 AND pain_score <= 100),
    urgency_score FLOAT DEFAULT 0 CHECK (urgency_score >= 0 AND urgency_score <= 100),
    relevance_score FLOAT DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 100),
    
    -- Extracted Information
    business_name VARCHAR(255),
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    location VARCHAR(255),
    industry VARCHAR(100),
    
    -- Signal Metadata
    signal_type VARCHAR(50),  -- complaint, opportunity, hiring, expansion, etc
    keywords JSONB DEFAULT '[]',
    sentiment VARCHAR(50),  -- positive, neutral, negative
    
    -- Processing Status
    status VARCHAR(50) DEFAULT 'new',  -- new, reviewed, contacted, converted, dismissed
    assigned_to UUID REFERENCES tenant_users(id),
    
    -- Engagement Tracking
    viewed_at TIMESTAMP,
    contacted_at TIMESTAMP,
    converted_at TIMESTAMP,
    dismissed_at TIMESTAMP,
    dismissal_reason TEXT,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_signals_tenant_id ON signals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_signals_pain_score ON signals(pain_score DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_source ON signals(source);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_business_name ON signals(business_name);

-- =====================================================
-- SCRAPING JOBS TABLE (Job Tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS scraping_jobs (
    id SERIAL PRIMARY KEY,
    
    -- Job Information
    job_type VARCHAR(100) NOT NULL,  -- reddit, bbb, licensing, job_boards, full_scrape, lite_scrape
    source VARCHAR(100),  -- Specific source within job type
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- pending, running, completed, failed
    
    -- Timing
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    
    -- Results
    results_count INTEGER DEFAULT 0,
    signals_created INTEGER DEFAULT 0,
    signals_updated INTEGER DEFAULT 0,
    
    -- Error Handling
    error TEXT,
    error_count INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',  -- Store job-specific data
    config JSONB DEFAULT '{}',  -- Job configuration used
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_job_type ON scraping_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_started_at ON scraping_jobs(started_at DESC);

-- =====================================================
-- BUSINESS CONTACTS TABLE (Scraped Business Info)
-- =====================================================

CREATE TABLE IF NOT EXISTS business_contacts (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    signal_id INTEGER REFERENCES signals(id) ON DELETE SET NULL,
    
    -- Business Information
    business_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    business_type VARCHAR(100),  -- hvac, plumbing, electrical, general_contractor
    
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
    source VARCHAR(100) NOT NULL,  -- bbb, licensing_board, association, job_posting
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
    status VARCHAR(50) DEFAULT 'new',  -- new, qualified, contacted, converted, unqualified
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Prevent duplicates
    UNIQUE(business_name, phone)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_contacts_tenant_id ON business_contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_contacts_business_name ON business_contacts(business_name);
CREATE INDEX IF NOT EXISTS idx_business_contacts_source ON business_contacts(source);
CREATE INDEX IF NOT EXISTS idx_business_contacts_status ON business_contacts(status);
CREATE INDEX IF NOT EXISTS idx_business_contacts_email ON business_contacts(email);
CREATE INDEX IF NOT EXISTS idx_business_contacts_phone ON business_contacts(phone);

-- =====================================================
-- SCRAPER SOURCES TABLE (Source Configuration)
-- =====================================================

CREATE TABLE IF NOT EXISTS scraper_sources (
    id SERIAL PRIMARY KEY,
    
    -- Source Information
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,  -- reddit, bbb, licensing, job_board, association
    url TEXT,
    
    -- Configuration
    enabled BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}',  -- Source-specific settings
    
    -- Scheduling
    scrape_frequency VARCHAR(50) DEFAULT 'daily',  -- hourly, daily, weekly
    last_scraped_at TIMESTAMP,
    next_scrape_at TIMESTAMP,
    
    -- Performance
    total_scrapes INTEGER DEFAULT 0,
    total_signals INTEGER DEFAULT 0,
    avg_signals_per_scrape FLOAT DEFAULT 0,
    success_rate FLOAT DEFAULT 100,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',  -- active, paused, error, deprecated
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scraper_sources_type ON scraper_sources(type);
CREATE INDEX IF NOT EXISTS idx_scraper_sources_enabled ON scraper_sources(enabled);

-- =====================================================
-- Insert Default Scraper Sources
-- =====================================================

INSERT INTO scraper_sources (name, type, url, config) VALUES
    ('BBB Complaints', 'bbb', 'https://www.bbb.org', '{"categories": ["hvac", "plumbing", "electrical"]}'),
    ('Texas HVAC Licensing', 'licensing', 'https://www.tdlr.texas.gov', '{"state": "TX", "license_type": "HVAC"}'),
    ('Indeed Jobs', 'job_board', 'https://www.indeed.com', '{"keywords": ["hvac", "plumbing", "service manager"]}'),
    ('ACCA Association', 'association', 'https://www.acca.org', '{"membership_directory": true}'),
    ('PHCC Association', 'association', 'https://www.phccweb.org', '{"membership_directory": true}')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ENGAGEMENT TRACKING TABLE (User Activity)
-- =====================================================

CREATE TABLE IF NOT EXISTS engagement_tracking (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- User Information
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    user_ip VARCHAR(50),
    
    -- Event Information
    event_type VARCHAR(100) NOT NULL,  -- page_view, calculator_submit, demo_request, etc
    event_category VARCHAR(50),  -- engagement, conversion, navigation
    
    -- Event Data
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    
    -- Context
    session_id VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(50),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_engagement_tracking_tenant_id ON engagement_tracking(tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagement_tracking_event_type ON engagement_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_engagement_tracking_created_at ON engagement_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_tracking_user_email ON engagement_tracking(user_email);

-- =====================================================
-- ERROR LOGS TABLE (Application Errors)
-- =====================================================

CREATE TABLE IF NOT EXISTS error_logs (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Error Information
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    
    -- Context
    service VARCHAR(50),  -- demand-engine, hvac-agent, scraper
    endpoint TEXT,
    method VARCHAR(10),
    
    -- Request Data
    request_data JSONB DEFAULT '{}',
    user_id UUID REFERENCES tenant_users(id),
    
    -- Environment
    environment VARCHAR(50) DEFAULT 'production',  -- development, staging, production
    
    -- Severity
    severity VARCHAR(50) DEFAULT 'error',  -- debug, info, warning, error, critical
    
    -- Status
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES tenant_users(id),
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_tenant_id ON error_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_signals_updated_at 
    BEFORE UPDATE ON signals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_contacts_updated_at 
    BEFORE UPDATE ON business_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraper_sources_updated_at 
    BEFORE UPDATE ON scraper_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Scraping Performance View
CREATE OR REPLACE VIEW scraping_performance AS
SELECT 
    job_type,
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs,
    AVG(duration_seconds) as avg_duration_seconds,
    SUM(signals_created) as total_signals_created,
    MAX(started_at) as last_run_at
FROM scraping_jobs
GROUP BY job_type;

-- High Value Signals View
CREATE OR REPLACE VIEW high_value_signals AS
SELECT 
    s.*,
    t.company_name as tenant_name
FROM signals s
LEFT JOIN tenants t ON s.tenant_id = t.id
WHERE s.pain_score >= 70
    AND s.status = 'new'
ORDER BY s.pain_score DESC, s.created_at DESC;

-- Business Contact Summary View
CREATE OR REPLACE VIEW business_contact_summary AS
SELECT 
    bc.source,
    COUNT(*) as total_contacts,
    COUNT(*) FILTER (WHERE bc.verified = TRUE) as verified_contacts,
    COUNT(*) FILTER (WHERE bc.contacted = TRUE) as contacted_count,
    COUNT(*) FILTER (WHERE bc.status = 'converted') as converted_count,
    AVG(bc.data_quality_score) as avg_quality_score
FROM business_contacts bc
GROUP BY bc.source;

-- =====================================================
-- ASSIGN EXISTING DATA TO DEFAULT TENANT
-- =====================================================

-- Assign any orphaned signals to default tenant
UPDATE signals 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default' LIMIT 1)
WHERE tenant_id IS NULL;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE signals IS 'Pain signals detected from various sources (Reddit, BBB, etc)';
COMMENT ON TABLE scraping_jobs IS 'Tracking for all scraping job executions';
COMMENT ON TABLE business_contacts IS 'Business owner contact information from various sources';
COMMENT ON TABLE scraper_sources IS 'Configuration for different scraping sources';
COMMENT ON TABLE engagement_tracking IS 'User engagement and activity tracking';
COMMENT ON TABLE error_logs IS 'Application error logging for debugging';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify migration success:
-- SELECT COUNT(*) FROM signals;
-- SELECT COUNT(*) FROM scraping_jobs;
-- SELECT COUNT(*) FROM business_contacts;
-- SELECT * FROM scraper_sources;
-- SELECT * FROM scraping_performance;
-- SELECT * FROM high_value_signals LIMIT 10;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
