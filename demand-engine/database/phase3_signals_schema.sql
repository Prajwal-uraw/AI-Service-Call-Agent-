-- Phase 3: Pain Signal Aggregator Database Schema
-- Tables for tracking HVAC business pain signals from multiple sources

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- REDDIT SIGNALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS reddit_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id VARCHAR(20) UNIQUE NOT NULL,
  subreddit VARCHAR(50) NOT NULL,
  author VARCHAR(50),
  title TEXT NOT NULL,
  body TEXT,
  created_utc TIMESTAMP NOT NULL,
  url TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  num_comments INTEGER DEFAULT 0,
  
  -- Classification scores (0-10 each)
  urgency_score INTEGER DEFAULT 0 CHECK (urgency_score >= 0 AND urgency_score <= 10),
  budget_score INTEGER DEFAULT 0 CHECK (budget_score >= 0 AND budget_score <= 10),
  authority_score INTEGER DEFAULT 0 CHECK (authority_score >= 0 AND authority_score <= 10),
  pain_score INTEGER DEFAULT 0 CHECK (pain_score >= 0 AND pain_score <= 10),
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  
  -- Processing metadata
  processed BOOLEAN DEFAULT FALSE,
  alerted BOOLEAN DEFAULT FALSE,
  scoring_method VARCHAR(20) DEFAULT 'keywords', -- 'keywords' or 'ai'
  ai_reasoning TEXT,
  
  -- Extracted entities
  location VARCHAR(100),
  company_mentioned VARCHAR(200),
  problem_type VARCHAR(50),
  
  -- Content hash for deduplication
  content_hash VARCHAR(32) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  
  CONSTRAINT reddit_signals_total_score_calc CHECK (
    total_score = (urgency_score * 25 + budget_score * 25 + authority_score * 25 + pain_score * 25) / 10
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reddit_total_score ON reddit_signals(total_score DESC) WHERE total_score >= 70;
CREATE INDEX IF NOT EXISTS idx_reddit_created_utc ON reddit_signals(created_utc DESC);
CREATE INDEX IF NOT EXISTS idx_reddit_processed ON reddit_signals(processed) WHERE NOT processed;
CREATE INDEX IF NOT EXISTS idx_reddit_alerted ON reddit_signals(alerted) WHERE NOT alerted AND total_score >= 70;
CREATE INDEX IF NOT EXISTS idx_reddit_content_hash ON reddit_signals(content_hash);
CREATE INDEX IF NOT EXISTS idx_reddit_subreddit ON reddit_signals(subreddit);

-- ============================================================================
-- FACEBOOK SIGNALS (Future)
-- ============================================================================

CREATE TABLE IF NOT EXISTS facebook_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id VARCHAR(50) UNIQUE NOT NULL,
  group_id VARCHAR(50),
  group_name VARCHAR(200),
  author VARCHAR(100),
  content TEXT NOT NULL,
  posted_at TIMESTAMP NOT NULL,
  url TEXT,
  reactions INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  
  -- Classification scores
  urgency_score INTEGER DEFAULT 0 CHECK (urgency_score >= 0 AND urgency_score <= 10),
  budget_score INTEGER DEFAULT 0 CHECK (budget_score >= 0 AND budget_score <= 10),
  authority_score INTEGER DEFAULT 0 CHECK (authority_score >= 0 AND authority_score <= 10),
  pain_score INTEGER DEFAULT 0 CHECK (pain_score >= 0 AND pain_score <= 10),
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  
  -- Processing metadata
  processed BOOLEAN DEFAULT FALSE,
  alerted BOOLEAN DEFAULT FALSE,
  scoring_method VARCHAR(20) DEFAULT 'keywords',
  ai_reasoning TEXT,
  
  -- Extracted entities
  location VARCHAR(100),
  company_mentioned VARCHAR(200),
  problem_type VARCHAR(50),
  content_hash VARCHAR(32) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_facebook_total_score ON facebook_signals(total_score DESC) WHERE total_score >= 70;
CREATE INDEX IF NOT EXISTS idx_facebook_posted_at ON facebook_signals(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_facebook_processed ON facebook_signals(processed) WHERE NOT processed;

-- ============================================================================
-- JOB BOARD SIGNALS (Indeed, ZipRecruiter)
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_board_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id VARCHAR(100) UNIQUE NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'indeed', 'ziprecruiter', etc.
  company_name VARCHAR(200) NOT NULL,
  job_title VARCHAR(200) NOT NULL,
  location VARCHAR(100),
  description TEXT,
  posted_date TIMESTAMP,
  url TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  job_type VARCHAR(50), -- 'full-time', 'part-time', etc.
  
  -- Signal indicators
  is_csr_role BOOLEAN DEFAULT FALSE,
  is_dispatcher_role BOOLEAN DEFAULT FALSE,
  is_urgent_hire BOOLEAN DEFAULT FALSE,
  multiple_postings BOOLEAN DEFAULT FALSE,
  
  -- Scoring
  urgency_score INTEGER DEFAULT 0 CHECK (urgency_score >= 0 AND urgency_score <= 10),
  budget_score INTEGER DEFAULT 0 CHECK (budget_score >= 0 AND budget_score <= 10),
  authority_score INTEGER DEFAULT 0 CHECK (authority_score >= 0 AND authority_score <= 10),
  pain_score INTEGER DEFAULT 0 CHECK (pain_score >= 0 AND pain_score <= 10),
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  
  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  alerted BOOLEAN DEFAULT FALSE,
  content_hash VARCHAR(32) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_board_total_score ON job_board_signals(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_board_company ON job_board_signals(company_name);
CREATE INDEX IF NOT EXISTS idx_job_board_location ON job_board_signals(location);

-- ============================================================================
-- LICENSING BOARD SIGNALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS licensing_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_number VARCHAR(50) UNIQUE NOT NULL,
  state VARCHAR(2) NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  owner_name VARCHAR(200),
  business_address TEXT,
  city VARCHAR(100),
  zip_code VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(100),
  license_type VARCHAR(100),
  license_status VARCHAR(50), -- 'active', 'probation', 'suspended', etc.
  issue_date DATE,
  expiration_date DATE,
  
  -- Complaint/violation data
  complaints_count INTEGER DEFAULT 0,
  violations_count INTEGER DEFAULT 0,
  last_complaint_date DATE,
  
  -- Scoring
  urgency_score INTEGER DEFAULT 0 CHECK (urgency_score >= 0 AND urgency_score <= 10),
  budget_score INTEGER DEFAULT 0 CHECK (budget_score >= 0 AND budget_score <= 10),
  authority_score INTEGER DEFAULT 0 CHECK (authority_score >= 0 AND authority_score <= 10),
  pain_score INTEGER DEFAULT 0 CHECK (pain_score >= 0 AND pain_score <= 10),
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  
  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  alerted BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_licensing_state ON licensing_signals(state);
CREATE INDEX IF NOT EXISTS idx_licensing_status ON licensing_signals(license_status);
CREATE INDEX IF NOT EXISTS idx_licensing_complaints ON licensing_signals(complaints_count DESC) WHERE complaints_count > 0;
CREATE INDEX IF NOT EXISTS idx_licensing_total_score ON licensing_signals(total_score DESC);

-- ============================================================================
-- UNIFIED SIGNALS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW unified_signals AS
SELECT 
  'reddit' as source,
  id,
  title as signal_text,
  subreddit as source_detail,
  location,
  company_mentioned,
  problem_type,
  urgency_score,
  budget_score,
  authority_score,
  pain_score,
  total_score,
  processed,
  alerted,
  created_utc as signal_date,
  url
FROM reddit_signals
WHERE total_score >= 70

UNION ALL

SELECT 
  'facebook' as source,
  id,
  content as signal_text,
  group_name as source_detail,
  location,
  company_mentioned,
  problem_type,
  urgency_score,
  budget_score,
  authority_score,
  pain_score,
  total_score,
  processed,
  alerted,
  posted_at as signal_date,
  url
FROM facebook_signals
WHERE total_score >= 70

UNION ALL

SELECT 
  'job_board' as source,
  id,
  job_title as signal_text,
  company_name as source_detail,
  location,
  company_name as company_mentioned,
  CASE 
    WHEN is_csr_role THEN 'hiring_csr'
    WHEN is_dispatcher_role THEN 'hiring_dispatcher'
    ELSE 'hiring_general'
  END as problem_type,
  urgency_score,
  budget_score,
  authority_score,
  pain_score,
  total_score,
  processed,
  alerted,
  posted_date as signal_date,
  url
FROM job_board_signals
WHERE total_score >= 70

UNION ALL

SELECT 
  'licensing' as source,
  id,
  company_name as signal_text,
  state as source_detail,
  city as location,
  company_name as company_mentioned,
  CASE 
    WHEN license_status = 'probation' THEN 'license_probation'
    WHEN complaints_count > 0 THEN 'customer_complaints'
    ELSE 'license_active'
  END as problem_type,
  urgency_score,
  budget_score,
  authority_score,
  pain_score,
  total_score,
  processed,
  alerted,
  issue_date as signal_date,
  NULL as url
FROM licensing_signals
WHERE total_score >= 70

ORDER BY total_score DESC, signal_date DESC;

-- ============================================================================
-- ALERT HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signal_source VARCHAR(50) NOT NULL,
  signal_id UUID NOT NULL,
  alert_type VARCHAR(50) NOT NULL, -- 'email', 'slack', 'webhook'
  recipient VARCHAR(200) NOT NULL,
  subject VARCHAR(500),
  message TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed', 'bounced'
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_alert_history_sent_at ON alert_history(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_signal ON alert_history(signal_source, signal_id);

-- ============================================================================
-- PROCESSING STATS
-- ============================================================================

CREATE TABLE IF NOT EXISTS processing_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_date DATE NOT NULL,
  source VARCHAR(50) NOT NULL,
  posts_fetched INTEGER DEFAULT 0,
  posts_processed INTEGER DEFAULT 0,
  posts_skipped INTEGER DEFAULT 0,
  high_score_signals INTEGER DEFAULT 0,
  alerts_sent INTEGER DEFAULT 0,
  ai_calls_made INTEGER DEFAULT 0,
  ai_cost_usd DECIMAL(10, 4) DEFAULT 0,
  processing_time_seconds INTEGER,
  errors_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(run_date, source)
);

CREATE INDEX IF NOT EXISTS idx_processing_stats_date ON processing_stats(run_date DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate total score
CREATE OR REPLACE FUNCTION calculate_total_score(
  p_urgency INTEGER,
  p_budget INTEGER,
  p_authority INTEGER,
  p_pain INTEGER
) RETURNS INTEGER AS $$
BEGIN
  RETURN (p_urgency * 25 + p_budget * 25 + p_authority * 25 + p_pain * 25) / 10;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update processing stats
CREATE OR REPLACE FUNCTION update_processing_stats(
  p_source VARCHAR,
  p_fetched INTEGER,
  p_processed INTEGER,
  p_skipped INTEGER,
  p_high_score INTEGER,
  p_alerts INTEGER,
  p_ai_calls INTEGER,
  p_ai_cost DECIMAL,
  p_processing_time INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO processing_stats (
    run_date, source, posts_fetched, posts_processed, posts_skipped,
    high_score_signals, alerts_sent, ai_calls_made, ai_cost_usd, processing_time_seconds
  ) VALUES (
    CURRENT_DATE, p_source, p_fetched, p_processed, p_skipped,
    p_high_score, p_alerts, p_ai_calls, p_ai_cost, p_processing_time
  )
  ON CONFLICT (run_date, source) DO UPDATE SET
    posts_fetched = processing_stats.posts_fetched + p_fetched,
    posts_processed = processing_stats.posts_processed + p_processed,
    posts_skipped = processing_stats.posts_skipped + p_skipped,
    high_score_signals = processing_stats.high_score_signals + p_high_score,
    alerts_sent = processing_stats.alerts_sent + p_alerts,
    ai_calls_made = processing_stats.ai_calls_made + p_ai_calls,
    ai_cost_usd = processing_stats.ai_cost_usd + p_ai_cost,
    processing_time_seconds = processing_stats.processing_time_seconds + p_processing_time;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE QUERIES
-- ============================================================================

-- Get today's high-value signals across all sources
-- SELECT * FROM unified_signals WHERE signal_date >= CURRENT_DATE ORDER BY total_score DESC;

-- Get unalerted high-score signals
-- SELECT * FROM unified_signals WHERE NOT alerted AND total_score >= 70 ORDER BY total_score DESC;

-- Get processing stats for last 7 days
-- SELECT * FROM processing_stats WHERE run_date >= CURRENT_DATE - INTERVAL '7 days' ORDER BY run_date DESC;

-- Get signals by location
-- SELECT * FROM unified_signals WHERE location ILIKE '%Denver%' OR location ILIKE '%CO%' ORDER BY total_score DESC;
