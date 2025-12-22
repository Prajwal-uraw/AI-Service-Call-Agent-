-- Phase 3 Session 2: AI Enhancement Schema
-- Adds AI scoring fields to existing pain signal tables

-- ============================================
-- AI Scoring Fields for Reddit Signals
-- ============================================

ALTER TABLE reddit_signals
ADD COLUMN IF NOT EXISTS ai_urgency_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_budget_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_authority_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_pain_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_total_score DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_tier VARCHAR(20) DEFAULT 'cold',
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(50),
ADD COLUMN IF NOT EXISTS intent VARCHAR(50),
ADD COLUMN IF NOT EXISTS lead_quality VARCHAR(20),
ADD COLUMN IF NOT EXISTS key_indicators JSONB,
ADD COLUMN IF NOT EXISTS recommended_action VARCHAR(50),
ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
ADD COLUMN IF NOT EXISTS ai_confidence VARCHAR(20),
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS ai_model VARCHAR(50);

-- Add indexes for AI fields
CREATE INDEX IF NOT EXISTS idx_reddit_ai_total_score ON reddit_signals(ai_total_score DESC);
CREATE INDEX IF NOT EXISTS idx_reddit_ai_tier ON reddit_signals(ai_tier);
CREATE INDEX IF NOT EXISTS idx_reddit_sentiment ON reddit_signals(sentiment);
CREATE INDEX IF NOT EXISTS idx_reddit_intent ON reddit_signals(intent);
CREATE INDEX IF NOT EXISTS idx_reddit_recommended_action ON reddit_signals(recommended_action);

-- ============================================
-- AI Scoring Fields for Facebook Signals
-- ============================================

ALTER TABLE facebook_signals
ADD COLUMN IF NOT EXISTS ai_urgency_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_budget_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_authority_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_pain_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_total_score DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_tier VARCHAR(20) DEFAULT 'cold',
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(50),
ADD COLUMN IF NOT EXISTS intent VARCHAR(50),
ADD COLUMN IF NOT EXISTS lead_quality VARCHAR(20),
ADD COLUMN IF NOT EXISTS key_indicators JSONB,
ADD COLUMN IF NOT EXISTS recommended_action VARCHAR(50),
ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
ADD COLUMN IF NOT EXISTS ai_confidence VARCHAR(20),
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS ai_model VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_facebook_ai_total_score ON facebook_signals(ai_total_score DESC);
CREATE INDEX IF NOT EXISTS idx_facebook_ai_tier ON facebook_signals(ai_tier);

-- ============================================
-- AI Scoring Fields for Job Board Signals
-- ============================================

ALTER TABLE job_board_signals
ADD COLUMN IF NOT EXISTS ai_urgency_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_budget_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_authority_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_pain_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_total_score DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_tier VARCHAR(20) DEFAULT 'cold',
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(50),
ADD COLUMN IF NOT EXISTS intent VARCHAR(50),
ADD COLUMN IF NOT EXISTS lead_quality VARCHAR(20),
ADD COLUMN IF NOT EXISTS key_indicators JSONB,
ADD COLUMN IF NOT EXISTS recommended_action VARCHAR(50),
ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
ADD COLUMN IF NOT EXISTS ai_confidence VARCHAR(20),
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS ai_model VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_job_board_ai_total_score ON job_board_signals(ai_total_score DESC);

-- ============================================
-- AI Scoring Fields for Licensing Signals
-- ============================================

ALTER TABLE licensing_signals
ADD COLUMN IF NOT EXISTS ai_urgency_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_budget_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_authority_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_pain_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_total_score DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_tier VARCHAR(20) DEFAULT 'cold',
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(50),
ADD COLUMN IF NOT EXISTS intent VARCHAR(50),
ADD COLUMN IF NOT EXISTS lead_quality VARCHAR(20),
ADD COLUMN IF NOT EXISTS key_indicators JSONB,
ADD COLUMN IF NOT EXISTS recommended_action VARCHAR(50),
ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
ADD COLUMN IF NOT EXISTS ai_confidence VARCHAR(20),
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS ai_model VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_licensing_ai_total_score ON licensing_signals(ai_total_score DESC);

-- ============================================
-- Update Unified Signals View with AI Fields
-- ============================================

CREATE OR REPLACE VIEW unified_signals_with_ai AS
SELECT 
    'reddit' as source,
    id,
    post_id as signal_id,
    subreddit as source_detail,
    author,
    title,
    body as content,
    url,
    created_utc as signal_time,
    
    -- Keyword scores
    urgency_score,
    budget_score,
    authority_score,
    pain_score,
    total_score as keyword_total_score,
    
    -- AI scores
    ai_urgency_score,
    ai_budget_score,
    ai_authority_score,
    ai_pain_score,
    ai_total_score,
    ai_tier,
    sentiment,
    intent,
    lead_quality,
    key_indicators,
    recommended_action,
    ai_reasoning,
    ai_confidence,
    ai_analyzed_at,
    ai_model,
    
    -- Combined score (average of keyword and AI)
    ROUND((total_score + ai_total_score) / 2, 2) as combined_score,
    
    -- Metadata
    location,
    company_mentioned,
    problem_type,
    processed,
    alerted,
    created_at
FROM reddit_signals

UNION ALL

SELECT 
    'facebook' as source,
    id,
    post_id as signal_id,
    group_name as source_detail,
    author_name as author,
    NULL as title,
    post_text as content,
    post_url as url,
    post_time as signal_time,
    
    urgency_score,
    budget_score,
    authority_score,
    pain_score,
    total_score as keyword_total_score,
    
    ai_urgency_score,
    ai_budget_score,
    ai_authority_score,
    ai_pain_score,
    ai_total_score,
    ai_tier,
    sentiment,
    intent,
    lead_quality,
    key_indicators,
    recommended_action,
    ai_reasoning,
    ai_confidence,
    ai_analyzed_at,
    ai_model,
    
    ROUND((total_score + ai_total_score) / 2, 2) as combined_score,
    
    location,
    company_mentioned,
    problem_type,
    processed,
    alerted,
    created_at
FROM facebook_signals

UNION ALL

SELECT 
    'job_board' as source,
    id,
    job_id as signal_id,
    platform as source_detail,
    company_name as author,
    job_title as title,
    job_description as content,
    job_url as url,
    posted_date as signal_time,
    
    urgency_score,
    budget_score,
    authority_score,
    pain_score,
    total_score as keyword_total_score,
    
    ai_urgency_score,
    ai_budget_score,
    ai_authority_score,
    ai_pain_score,
    ai_total_score,
    ai_tier,
    sentiment,
    intent,
    lead_quality,
    key_indicators,
    recommended_action,
    ai_reasoning,
    ai_confidence,
    ai_analyzed_at,
    ai_model,
    
    ROUND((total_score + ai_total_score) / 2, 2) as combined_score,
    
    location,
    company_name as company_mentioned,
    NULL as problem_type,
    processed,
    alerted,
    created_at
FROM job_board_signals

UNION ALL

SELECT 
    'licensing' as source,
    id,
    license_number as signal_id,
    state as source_detail,
    business_name as author,
    NULL as title,
    CONCAT('New ', license_type, ' license issued') as content,
    NULL as url,
    issue_date as signal_time,
    
    urgency_score,
    budget_score,
    authority_score,
    pain_score,
    total_score as keyword_total_score,
    
    ai_urgency_score,
    ai_budget_score,
    ai_authority_score,
    ai_pain_score,
    ai_total_score,
    ai_tier,
    sentiment,
    intent,
    lead_quality,
    key_indicators,
    recommended_action,
    ai_reasoning,
    ai_confidence,
    ai_analyzed_at,
    ai_model,
    
    ROUND((total_score + ai_total_score) / 2, 2) as combined_score,
    
    business_address as location,
    business_name as company_mentioned,
    license_type as problem_type,
    processed,
    alerted,
    created_at
FROM licensing_signals;

-- ============================================
-- Helper Functions for AI Scoring
-- ============================================

-- Get high-value AI-scored signals
CREATE OR REPLACE FUNCTION get_high_value_ai_signals(
    min_ai_score DECIMAL DEFAULT 70.0,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    source VARCHAR,
    signal_id VARCHAR,
    title TEXT,
    content TEXT,
    ai_total_score DECIMAL,
    ai_tier VARCHAR,
    sentiment VARCHAR,
    intent VARCHAR,
    recommended_action VARCHAR,
    key_indicators JSONB,
    url TEXT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.source,
        u.signal_id,
        u.title,
        u.content,
        u.ai_total_score,
        u.ai_tier,
        u.sentiment,
        u.intent,
        u.recommended_action,
        u.key_indicators,
        u.url,
        u.created_at
    FROM unified_signals_with_ai u
    WHERE u.ai_total_score >= min_ai_score
        AND u.alerted = FALSE
    ORDER BY u.ai_total_score DESC, u.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get signals by intent
CREATE OR REPLACE FUNCTION get_signals_by_intent(
    target_intent VARCHAR,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    source VARCHAR,
    signal_id VARCHAR,
    title TEXT,
    ai_total_score DECIMAL,
    sentiment VARCHAR,
    recommended_action VARCHAR,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.source,
        u.signal_id,
        u.title,
        u.ai_total_score,
        u.sentiment,
        u.recommended_action,
        u.created_at
    FROM unified_signals_with_ai u
    WHERE u.intent = target_intent
        AND u.alerted = FALSE
    ORDER BY u.ai_total_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get AI vs Keyword score comparison
CREATE OR REPLACE FUNCTION get_scoring_comparison()
RETURNS TABLE (
    source VARCHAR,
    avg_keyword_score DECIMAL,
    avg_ai_score DECIMAL,
    avg_combined_score DECIMAL,
    score_correlation DECIMAL,
    total_signals BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.source,
        ROUND(AVG(u.keyword_total_score), 2) as avg_keyword_score,
        ROUND(AVG(u.ai_total_score), 2) as avg_ai_score,
        ROUND(AVG(u.combined_score), 2) as avg_combined_score,
        ROUND(CORR(u.keyword_total_score, u.ai_total_score)::NUMERIC, 3) as score_correlation,
        COUNT(*) as total_signals
    FROM unified_signals_with_ai u
    WHERE u.ai_total_score > 0
    GROUP BY u.source;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments
-- ============================================

COMMENT ON COLUMN reddit_signals.ai_total_score IS 'AI-generated total score (0-100) based on GPT-4 analysis';
COMMENT ON COLUMN reddit_signals.ai_tier IS 'AI-determined lead tier: hot, warm, qualified, cold';
COMMENT ON COLUMN reddit_signals.sentiment IS 'AI-detected sentiment: positive, neutral, negative, frustrated, desperate';
COMMENT ON COLUMN reddit_signals.intent IS 'AI-detected user intent: seeking_help, comparing_options, emergency, planning, complaining';
COMMENT ON COLUMN reddit_signals.key_indicators IS 'JSON array of key phrases that influenced AI scoring';
COMMENT ON COLUMN reddit_signals.recommended_action IS 'AI recommendation: immediate_contact, nurture, monitor, skip';

COMMENT ON VIEW unified_signals_with_ai IS 'Unified view of all pain signals with both keyword and AI scoring';
COMMENT ON FUNCTION get_high_value_ai_signals IS 'Returns high-value signals based on AI scoring threshold';
COMMENT ON FUNCTION get_signals_by_intent IS 'Returns signals filtered by AI-detected intent';
COMMENT ON FUNCTION get_scoring_comparison IS 'Compares keyword vs AI scoring performance across sources';
