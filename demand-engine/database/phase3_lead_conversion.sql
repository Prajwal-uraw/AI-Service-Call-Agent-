-- Phase 3: Lead Conversion Enhancement
-- Add conversion tracking to pain signals

-- Add conversion tracking columns to signal tables
ALTER TABLE reddit_signals ADD COLUMN IF NOT EXISTS converted_to_lead BOOLEAN DEFAULT FALSE;
ALTER TABLE reddit_signals ADD COLUMN IF NOT EXISTS lead_id UUID;
ALTER TABLE reddit_signals ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMPTZ;

ALTER TABLE job_board_signals ADD COLUMN IF NOT EXISTS converted_to_lead BOOLEAN DEFAULT FALSE;
ALTER TABLE job_board_signals ADD COLUMN IF NOT EXISTS lead_id UUID;
ALTER TABLE job_board_signals ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMPTZ;

ALTER TABLE licensing_signals ADD COLUMN IF NOT EXISTS converted_to_lead BOOLEAN DEFAULT FALSE;
ALTER TABLE licensing_signals ADD COLUMN IF NOT EXISTS lead_id UUID;
ALTER TABLE licensing_signals ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMPTZ;

ALTER TABLE facebook_signals ADD COLUMN IF NOT EXISTS converted_to_lead BOOLEAN DEFAULT FALSE;
ALTER TABLE facebook_signals ADD COLUMN IF NOT EXISTS lead_id UUID;
ALTER TABLE facebook_signals ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMPTZ;

-- Create indexes for conversion queries
CREATE INDEX IF NOT EXISTS idx_reddit_signals_converted ON reddit_signals(converted_to_lead, combined_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_board_signals_converted ON job_board_signals(converted_to_lead, combined_score DESC);
CREATE INDEX IF NOT EXISTS idx_licensing_signals_converted ON licensing_signals(converted_to_lead, combined_score DESC);
CREATE INDEX IF NOT EXISTS idx_facebook_signals_converted ON facebook_signals(converted_to_lead, combined_score DESC);

-- Update unified view to include conversion status
DROP VIEW IF EXISTS unified_signals_with_ai CASCADE;

CREATE VIEW unified_signals_with_ai AS
SELECT 
    id,
    'reddit' as source,
    post_id as signal_id,
    title,
    content,
    url,
    subreddit as source_detail,
    author,
    location,
    company_mentioned,
    problem_type,
    keyword_urgency,
    keyword_budget,
    keyword_authority,
    keyword_pain,
    keyword_total,
    ai_urgency,
    ai_budget,
    ai_authority,
    ai_pain,
    ai_total,
    COALESCE(
        (keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6),
        keyword_total
    ) as combined_score,
    CASE 
        WHEN COALESCE((keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6), keyword_total) >= 85 THEN 'hot'
        WHEN COALESCE((keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6), keyword_total) >= 70 THEN 'warm'
        WHEN COALESCE((keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6), keyword_total) >= 50 THEN 'qualified'
        ELSE 'cold'
    END as tier,
    sentiment,
    intent,
    lead_quality,
    key_indicators,
    recommended_action,
    ai_reasoning,
    processed,
    alerted,
    converted_to_lead,
    lead_id,
    conversion_date,
    created_at,
    updated_at
FROM reddit_signals

UNION ALL

SELECT 
    id,
    'job_board' as source,
    job_id as signal_id,
    job_title as title,
    job_description as content,
    job_url as url,
    job_board as source_detail,
    company_name as author,
    location,
    company_name as company_mentioned,
    'hiring' as problem_type,
    keyword_urgency,
    keyword_budget,
    keyword_authority,
    keyword_pain,
    keyword_total,
    ai_urgency,
    ai_budget,
    ai_authority,
    ai_pain,
    ai_total,
    COALESCE(
        (keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6),
        keyword_total
    ) as combined_score,
    CASE 
        WHEN COALESCE((keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6), keyword_total) >= 85 THEN 'hot'
        WHEN COALESCE((keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6), keyword_total) >= 70 THEN 'warm'
        WHEN COALESCE((keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6), keyword_total) >= 50 THEN 'qualified'
        ELSE 'cold'
    END as tier,
    sentiment,
    intent,
    lead_quality,
    key_indicators,
    recommended_action,
    ai_reasoning,
    processed,
    alerted,
    converted_to_lead,
    lead_id,
    conversion_date,
    created_at,
    updated_at
FROM job_board_signals

UNION ALL

SELECT 
    id,
    'licensing' as source,
    license_number as signal_id,
    business_name as title,
    CONCAT('New HVAC license issued: ', license_type, ' - ', business_name) as content,
    board_url as url,
    state as source_detail,
    business_name as author,
    CONCAT(city, ', ', state) as location,
    business_name as company_mentioned,
    'new_license' as problem_type,
    keyword_urgency,
    keyword_budget,
    keyword_authority,
    keyword_pain,
    keyword_total,
    ai_urgency,
    ai_budget,
    ai_authority,
    ai_pain,
    ai_total,
    COALESCE(
        (keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6),
        keyword_total
    ) as combined_score,
    CASE 
        WHEN COALESCE((keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6), keyword_total) >= 85 THEN 'hot'
        WHEN COALESCE((keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6), keyword_total) >= 70 THEN 'warm'
        WHEN COALESCE((keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6), keyword_total) >= 50 THEN 'qualified'
        ELSE 'cold'
    END as tier,
    sentiment,
    intent,
    lead_quality,
    key_indicators,
    recommended_action,
    ai_reasoning,
    processed,
    alerted,
    converted_to_lead,
    lead_id,
    conversion_date,
    created_at,
    updated_at
FROM licensing_signals

UNION ALL

SELECT 
    id,
    'facebook' as source,
    post_id as signal_id,
    NULL as title,
    post_text as content,
    post_url as url,
    group_name as source_detail,
    author_name as author,
    location,
    company_mentioned,
    problem_type,
    keyword_urgency,
    keyword_budget,
    keyword_authority,
    keyword_pain,
    keyword_total,
    ai_urgency,
    ai_budget,
    ai_authority,
    ai_pain,
    ai_total,
    COALESCE(
        (keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6),
        keyword_total
    ) as combined_score,
    CASE 
        WHEN COALESCE((keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6), keyword_total) >= 85 THEN 'hot'
        WHEN COALESCE((keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6), keyword_total) >= 70 THEN 'warm'
        WHEN COALESCE((keyword_total * 0.4 + COALESCE(ai_total, keyword_total) * 0.6), keyword_total) >= 50 THEN 'qualified'
        ELSE 'cold'
    END as tier,
    sentiment,
    intent,
    lead_quality,
    key_indicators,
    recommended_action,
    ai_reasoning,
    processed,
    alerted,
    converted_to_lead,
    lead_id,
    conversion_date,
    created_at,
    updated_at
FROM facebook_signals;

-- Function to get signal detail (used by converter)
CREATE OR REPLACE FUNCTION get_signal_detail(signal_id UUID)
RETURNS TABLE (
    id UUID,
    source TEXT,
    signal_id TEXT,
    title TEXT,
    content TEXT,
    url TEXT,
    location TEXT,
    company_mentioned TEXT,
    problem_type TEXT,
    keyword_total INTEGER,
    ai_total NUMERIC,
    combined_score NUMERIC,
    sentiment TEXT,
    intent TEXT,
    ai_reasoning TEXT,
    key_indicators TEXT[],
    recommended_action TEXT,
    converted_to_lead BOOLEAN,
    lead_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.source,
        s.signal_id,
        s.title,
        s.content,
        s.url,
        s.location,
        s.company_mentioned,
        s.problem_type,
        s.keyword_total,
        s.ai_total,
        s.combined_score,
        s.sentiment,
        s.intent,
        s.ai_reasoning,
        s.key_indicators,
        s.recommended_action,
        s.converted_to_lead,
        s.lead_id
    FROM unified_signals_with_ai s
    WHERE s.id = signal_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get high-value pending signals for conversion
CREATE OR REPLACE FUNCTION get_high_value_pending_signals(
    min_score INTEGER DEFAULT 70,
    max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    source TEXT,
    signal_id TEXT,
    title TEXT,
    combined_score NUMERIC,
    sentiment TEXT,
    intent TEXT,
    location TEXT,
    company_mentioned TEXT,
    converted_to_lead BOOLEAN,
    alerted BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.source,
        s.signal_id,
        s.title,
        s.combined_score,
        s.sentiment,
        s.intent,
        s.location,
        s.company_mentioned,
        s.converted_to_lead,
        s.alerted,
        s.created_at
    FROM unified_signals_with_ai s
    WHERE s.combined_score >= min_score
        AND s.converted_to_lead = FALSE
        AND s.processed = TRUE
    ORDER BY s.combined_score DESC, s.created_at DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get conversion statistics
CREATE OR REPLACE FUNCTION get_signal_conversion_stats(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    total_signals BIGINT,
    converted_signals BIGINT,
    conversion_rate NUMERIC,
    avg_score_converted NUMERIC,
    avg_score_not_converted NUMERIC,
    by_source JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE converted_to_lead = TRUE) as converted,
            AVG(combined_score) FILTER (WHERE converted_to_lead = TRUE) as avg_converted,
            AVG(combined_score) FILTER (WHERE converted_to_lead = FALSE) as avg_not_converted,
            jsonb_object_agg(
                source,
                jsonb_build_object(
                    'total', COUNT(*),
                    'converted', COUNT(*) FILTER (WHERE converted_to_lead = TRUE),
                    'conversion_rate', CASE 
                        WHEN COUNT(*) > 0 
                        THEN ROUND((COUNT(*) FILTER (WHERE converted_to_lead = TRUE)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
                        ELSE 0 
                    END
                )
            ) as by_source
        FROM unified_signals_with_ai
        WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
    )
    SELECT 
        total,
        converted,
        CASE WHEN total > 0 THEN ROUND((converted::NUMERIC / total::NUMERIC * 100), 2) ELSE 0 END,
        COALESCE(ROUND(avg_converted, 2), 0),
        COALESCE(ROUND(avg_not_converted, 2), 0),
        by_source
    FROM stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get conversion timeline (for analytics)
CREATE OR REPLACE FUNCTION get_conversion_timeline(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    total_signals BIGINT,
    converted_signals BIGINT,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_signals,
        COUNT(*) FILTER (WHERE converted_to_lead = TRUE) as converted_signals,
        CASE 
            WHEN COUNT(*) > 0 
            THEN ROUND((COUNT(*) FILTER (WHERE converted_to_lead = TRUE)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
            ELSE 0 
        END as conversion_rate
    FROM unified_signals_with_ai
    WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY DATE(created_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_signal_detail(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_high_value_pending_signals(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_signal_conversion_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversion_timeline(INTEGER) TO authenticated;
