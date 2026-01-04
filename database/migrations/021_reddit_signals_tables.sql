-- =====================================================
-- Migration 021: Reddit Signals and Scraper Tables
-- =====================================================
-- Creates tables needed by kestrel-pain-signal-scrapers
-- Run this to fix scraper deployment errors
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- REDDIT SIGNALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS reddit_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reddit Post Information
    post_id VARCHAR(255) UNIQUE NOT NULL,
    subreddit VARCHAR(100) NOT NULL,
    author VARCHAR(255),
    title TEXT NOT NULL,
    body TEXT,
    created_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    url TEXT,
    score INTEGER DEFAULT 0,
    num_comments INTEGER DEFAULT 0,
    
    -- Keyword-based Scores (0-10 scale)
    urgency_score INTEGER DEFAULT 0 CHECK (urgency_score >= 0 AND urgency_score <= 10),
    budget_score INTEGER DEFAULT 0 CHECK (budget_score >= 0 AND budget_score <= 10),
    authority_score INTEGER DEFAULT 0 CHECK (authority_score >= 0 AND authority_score <= 10),
    pain_score INTEGER DEFAULT 0 CHECK (pain_score >= 0 AND pain_score <= 10),
    total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
    
    -- AI-enhanced Scores (0-10 scale)
    ai_urgency_score INTEGER CHECK (ai_urgency_score >= 0 AND ai_urgency_score <= 10),
    ai_budget_score INTEGER CHECK (ai_budget_score >= 0 AND ai_budget_score <= 10),
    ai_authority_score INTEGER CHECK (ai_authority_score >= 0 AND ai_authority_score <= 10),
    ai_pain_score INTEGER CHECK (ai_pain_score >= 0 AND ai_pain_score <= 10),
    ai_total_score INTEGER CHECK (ai_total_score >= 0 AND ai_total_score <= 100),
    
    -- AI Analysis Results
    ai_tier VARCHAR(20), -- hot, warm, cold, nurture
    sentiment VARCHAR(50), -- positive, negative, neutral, frustrated, urgent
    intent VARCHAR(100), -- seeking_help, complaining, researching, ready_to_buy
    lead_quality VARCHAR(50), -- high, medium, low
    key_indicators JSONB DEFAULT '[]'::jsonb,
    recommended_action TEXT,
    ai_reasoning TEXT,
    ai_confidence DECIMAL(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
    ai_analyzed_at TIMESTAMP WITH TIME ZONE,
    ai_model VARCHAR(50), -- gpt-4, gpt-4-turbo, etc.
    
    -- Extracted Information
    location VARCHAR(255),
    company_mentioned VARCHAR(255),
    problem_type VARCHAR(50), -- no_cooling, no_heating, noise, leak, efficiency, installation
    
    -- Processing Status
    content_hash VARCHAR(64) UNIQUE NOT NULL,
    alerted BOOLEAN DEFAULT FALSE,
    processed BOOLEAN DEFAULT FALSE,
    scoring_method VARCHAR(20), -- keywords, ai, hybrid
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reddit_signals
CREATE INDEX IF NOT EXISTS idx_reddit_signals_total_score ON reddit_signals(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_reddit_signals_ai_total_score ON reddit_signals(ai_total_score DESC) WHERE ai_total_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reddit_signals_alerted ON reddit_signals(alerted) WHERE alerted = FALSE;
CREATE INDEX IF NOT EXISTS idx_reddit_signals_created ON reddit_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reddit_signals_subreddit ON reddit_signals(subreddit);
CREATE INDEX IF NOT EXISTS idx_reddit_signals_problem_type ON reddit_signals(problem_type);
CREATE INDEX IF NOT EXISTS idx_reddit_signals_location ON reddit_signals(location) WHERE location IS NOT NULL;

-- =====================================================
-- PROCESSING STATS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS processing_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Run Information
    run_date DATE NOT NULL,
    source VARCHAR(50) NOT NULL, -- reddit, facebook, twitter, etc.
    
    -- Statistics
    posts_fetched INTEGER DEFAULT 0,
    posts_processed INTEGER DEFAULT 0,
    high_score_signals INTEGER DEFAULT 0,
    alerts_sent INTEGER DEFAULT 0,
    
    -- Performance Metrics
    duration_seconds INTEGER,
    errors_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per day per source
    UNIQUE(run_date, source)
);

-- Indexes for processing_stats
CREATE INDEX IF NOT EXISTS idx_processing_stats_run_date ON processing_stats(run_date DESC);
CREATE INDEX IF NOT EXISTS idx_processing_stats_source ON processing_stats(source);

-- =====================================================
-- ALERT HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Signal Reference
    signal_source VARCHAR(50) NOT NULL, -- reddit, facebook, etc.
    signal_id UUID NOT NULL,
    
    -- Alert Details
    alert_type VARCHAR(50) NOT NULL, -- email, slack, webhook, sms
    recipient VARCHAR(255) NOT NULL,
    subject TEXT,
    
    -- Delivery Status
    status VARCHAR(50) NOT NULL, -- sent, delivered, failed, bounced
    error_message TEXT,
    
    -- Email Service Response
    email_service_id VARCHAR(255), -- Resend message ID
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for alert_history
CREATE INDEX IF NOT EXISTS idx_alert_history_signal ON alert_history(signal_source, signal_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_status ON alert_history(status);
CREATE INDEX IF NOT EXISTS idx_alert_history_created ON alert_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_recipient ON alert_history(recipient);

-- =====================================================
-- UNIFIED SIGNALS VIEW (Optional)
-- =====================================================
-- Combines reddit_signals with other signal sources for unified querying

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

-- =====================================================
-- STORED PROCEDURE: Get Unalerted Signals
-- =====================================================

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

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
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

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE reddit_signals IS 'Reddit posts scored for HVAC lead potential with AI enhancement';
COMMENT ON TABLE processing_stats IS 'Daily statistics for scraping job executions';
COMMENT ON TABLE alert_history IS 'History of all alerts sent for pain signals';
COMMENT ON VIEW unified_signals IS 'Unified view of all signal sources for easy querying';
COMMENT ON FUNCTION get_unalerted_signals IS 'Returns high-score signals that have not been alerted yet';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 
    'Migration 021 completed successfully!' as status,
    'Created reddit_signals, processing_stats, and alert_history tables' as note,
    'Scrapers should now work correctly' as next_step;
