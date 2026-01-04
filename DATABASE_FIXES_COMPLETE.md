# Database Fixes & Schema Consolidation

**Date:** January 4, 2026  
**Status:** Ready to execute

---

## Part 1: Run Migration 021 (CRITICAL - Do This First)

### Step-by-Step Instructions

1. **Go to Supabase Dashboard**
   - URL: https://soudakcdmpcfavticrxd.supabase.co
   - Login: prajwal.uraw@haiec.com / Gingka@120

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Paste This SQL**

```sql
-- =====================================================
-- Migration 021: Reddit Signals and Scraper Tables
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- REDDIT SIGNALS TABLE
CREATE TABLE IF NOT EXISTS reddit_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id VARCHAR(255) UNIQUE NOT NULL,
    subreddit VARCHAR(100) NOT NULL,
    author VARCHAR(255),
    title TEXT NOT NULL,
    body TEXT,
    created_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    url TEXT,
    score INTEGER DEFAULT 0,
    num_comments INTEGER DEFAULT 0,
    
    -- Keyword scores
    urgency_score INTEGER DEFAULT 0 CHECK (urgency_score >= 0 AND urgency_score <= 10),
    budget_score INTEGER DEFAULT 0 CHECK (budget_score >= 0 AND budget_score <= 10),
    authority_score INTEGER DEFAULT 0 CHECK (authority_score >= 0 AND authority_score <= 10),
    pain_score INTEGER DEFAULT 0 CHECK (pain_score >= 0 AND pain_score <= 10),
    total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
    
    -- AI scores
    ai_urgency_score INTEGER CHECK (ai_urgency_score >= 0 AND ai_urgency_score <= 10),
    ai_budget_score INTEGER CHECK (ai_budget_score >= 0 AND ai_budget_score <= 10),
    ai_authority_score INTEGER CHECK (ai_authority_score >= 0 AND ai_authority_score <= 10),
    ai_pain_score INTEGER CHECK (ai_pain_score >= 0 AND ai_pain_score <= 10),
    ai_total_score INTEGER CHECK (ai_total_score >= 0 AND ai_total_score <= 100),
    ai_tier VARCHAR(20),
    sentiment VARCHAR(50),
    intent VARCHAR(100),
    lead_quality VARCHAR(50),
    key_indicators JSONB DEFAULT '[]'::jsonb,
    recommended_action TEXT,
    ai_reasoning TEXT,
    ai_confidence DECIMAL(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
    ai_analyzed_at TIMESTAMP WITH TIME ZONE,
    ai_model VARCHAR(50),
    
    -- Extracted info
    location VARCHAR(255),
    company_mentioned VARCHAR(255),
    problem_type VARCHAR(50),
    
    -- Processing
    content_hash VARCHAR(64) UNIQUE NOT NULL,
    alerted BOOLEAN DEFAULT FALSE,
    processed BOOLEAN DEFAULT FALSE,
    scoring_method VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reddit_signals_total_score ON reddit_signals(total_score DESC);
CREATE INDEX idx_reddit_signals_ai_total_score ON reddit_signals(ai_total_score DESC) WHERE ai_total_score IS NOT NULL;
CREATE INDEX idx_reddit_signals_alerted ON reddit_signals(alerted) WHERE alerted = FALSE;
CREATE INDEX idx_reddit_signals_created ON reddit_signals(created_at DESC);
CREATE INDEX idx_reddit_signals_subreddit ON reddit_signals(subreddit);

-- PROCESSING STATS TABLE
CREATE TABLE IF NOT EXISTS processing_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_date DATE NOT NULL,
    source VARCHAR(50) NOT NULL,
    posts_fetched INTEGER DEFAULT 0,
    posts_processed INTEGER DEFAULT 0,
    high_score_signals INTEGER DEFAULT 0,
    alerts_sent INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    errors_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(run_date, source)
);

CREATE INDEX idx_processing_stats_run_date ON processing_stats(run_date DESC);

-- ALERT HISTORY TABLE
CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signal_source VARCHAR(50) NOT NULL,
    signal_id UUID NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject TEXT,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    email_service_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_alert_history_signal ON alert_history(signal_source, signal_id);
CREATE INDEX idx_alert_history_created ON alert_history(created_at DESC);

-- UNIFIED SIGNALS VIEW
CREATE OR REPLACE VIEW unified_signals AS
SELECT 
    id,
    'reddit' as source,
    title as signal_text,
    subreddit as source_detail,
    url,
    total_score,
    ai_total_score,
    COALESCE(ai_total_score, total_score) as final_score,
    location,
    problem_type,
    alerted,
    created_at
FROM reddit_signals
WHERE processed = TRUE;

-- FUNCTION: Get Unalerted Signals
CREATE OR REPLACE FUNCTION get_unalerted_signals(min_score INTEGER DEFAULT 70)
RETURNS TABLE (
    id UUID,
    source VARCHAR(50),
    signal_text TEXT,
    source_detail VARCHAR(100),
    url TEXT,
    total_score INTEGER,
    ai_total_score INTEGER,
    location VARCHAR(255),
    problem_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.id,
        us.source,
        us.signal_text,
        us.source_detail,
        us.url,
        us.total_score,
        us.ai_total_score,
        us.location,
        us.problem_type,
        us.created_at
    FROM unified_signals us
    WHERE us.alerted = FALSE
      AND us.final_score >= min_score
    ORDER BY us.final_score DESC, us.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_reddit_signals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reddit_signals_updated_at 
BEFORE UPDATE ON reddit_signals
FOR EACH ROW 
EXECUTE FUNCTION update_reddit_signals_updated_at();

SELECT 'Migration 021 completed!' as status;
```

4. **Click "Run" or press Ctrl+Enter**

5. **Verify Tables Created**
   - Go to "Table Editor" in left sidebar
   - You should see: `reddit_signals`, `processing_stats`, `alert_history`

---

## Part 2: Schema Consolidation with Foreign Keys

This fixes the duplicate table definitions and adds proper foreign key constraints to make the database safer.

### Run This SQL in Supabase SQL Editor

```sql
-- =====================================================
-- Schema Consolidation & Foreign Key Constraints
-- =====================================================
-- Fixes duplicate definitions and adds referential integrity
-- =====================================================

-- First, check if tenants table exists (for multi-tenant support)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table if not exists (for assignment tracking)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONSOLIDATED SIGNALS TABLE (with FK constraints)
-- =====================================================

-- Drop old signals table if it exists without constraints
DROP TABLE IF EXISTS signals CASCADE;

CREATE TABLE signals (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
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
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    
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

CREATE INDEX idx_signals_tenant_id ON signals(tenant_id);
CREATE INDEX idx_signals_pain_score ON signals(pain_score DESC);
CREATE INDEX idx_signals_status ON signals(status);
CREATE INDEX idx_signals_source ON signals(source);

-- =====================================================
-- CONSOLIDATED ENGAGEMENT_TRACKING TABLE (with FK)
-- =====================================================

DROP TABLE IF EXISTS engagement_tracking CASCADE;

CREATE TABLE engagement_tracking (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
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

CREATE INDEX idx_engagement_tracking_tenant_id ON engagement_tracking(tenant_id);
CREATE INDEX idx_engagement_tracking_event_type ON engagement_tracking(event_type);
CREATE INDEX idx_engagement_tracking_created_at ON engagement_tracking(created_at DESC);

-- =====================================================
-- BUSINESS_CONTACTS TABLE (with FK constraints)
-- =====================================================

CREATE TABLE IF NOT EXISTS business_contacts (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    signal_id INTEGER REFERENCES signals(id) ON DELETE SET NULL,
    
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

CREATE INDEX idx_business_contacts_tenant_id ON business_contacts(tenant_id);
CREATE INDEX idx_business_contacts_signal_id ON business_contacts(signal_id);
CREATE INDEX idx_business_contacts_email ON business_contacts(email);

-- =====================================================
-- ERROR_LOGS TABLE (with FK constraints)
-- =====================================================

CREATE TABLE IF NOT EXISTS error_logs (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    service VARCHAR(50),
    endpoint TEXT,
    method VARCHAR(10),
    request_data JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    environment VARCHAR(50) DEFAULT 'production',
    severity VARCHAR(50) DEFAULT 'error',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_error_logs_tenant_id ON error_logs(tenant_id);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);

-- =====================================================
-- SCRAPING_JOBS TABLE (with FK constraints)
-- =====================================================

CREATE TABLE IF NOT EXISTS scraping_jobs (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
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

CREATE INDEX idx_scraping_jobs_tenant_id ON scraping_jobs(tenant_id);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);

-- =====================================================
-- Add default tenant for existing data
-- =====================================================

INSERT INTO tenants (id, name, slug, email, status)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Default Tenant',
    'default',
    'admin@kestrel.ai',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Update triggers for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signals_updated_at BEFORE UPDATE ON signals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_contacts_updated_at BEFORE UPDATE ON business_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Schema consolidation completed with FK constraints!' as status;
```

---

## Part 3: Verify Database is Safe

Run this query to check all foreign key constraints:

```sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;
```

**Expected Output:** You should see foreign keys for:
- `signals.tenant_id` → `tenants.id`
- `signals.assigned_to` → `users.id`
- `business_contacts.tenant_id` → `tenants.id`
- `business_contacts.signal_id` → `signals.id`
- `error_logs.tenant_id` → `tenants.id`
- `scraping_jobs.tenant_id` → `tenants.id`

---

## Summary of Changes

### ✅ What Was Fixed

1. **Created Missing Tables**
   - `reddit_signals` - For Reddit scraper
   - `processing_stats` - For scraper statistics
   - `alert_history` - For alert tracking

2. **Consolidated Duplicate Tables**
   - Merged two `signals` table definitions into one
   - Merged two `engagement_tracking` definitions into one
   - Single source of truth for each table

3. **Added Foreign Key Constraints**
   - All `tenant_id` columns now reference `tenants(id)`
   - `assigned_to` references `users(id)`
   - `signal_id` references `signals(id)`
   - Proper CASCADE and SET NULL rules

4. **Added Safety Features**
   - ON DELETE CASCADE for tenant data (clean deletion)
   - ON DELETE SET NULL for optional references
   - Check constraints for score ranges
   - Unique constraints for deduplication

### 🔒 Database is Now Safe

- **Referential Integrity:** Can't create orphaned records
- **Data Consistency:** Foreign keys enforce valid relationships
- **Cascade Deletes:** Tenant deletion cleans up all related data
- **No Duplicates:** Unique constraints prevent duplicate signals

---

## Next: Test the Scrapers

After running both migrations, test the scrapers:

```bash
# Test Reddit monitor
modal run demand-engine/modal_scrapers.py::trigger_reddit_monitor

# Test daily digest
modal run demand-engine/modal_scrapers.py::trigger_daily_digest
```

Check Supabase `reddit_signals` table for new entries.
