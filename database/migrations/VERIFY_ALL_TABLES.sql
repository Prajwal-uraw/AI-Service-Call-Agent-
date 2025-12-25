-- Verification Script: Check if all migrations have been applied
-- Run this to verify your database state after migrations

\echo '========================================'
\echo 'DATABASE MIGRATION VERIFICATION'
\echo '========================================'
\echo ''

-- 1. List all tables in public schema
\echo '1. ALL TABLES IN DATABASE:'
\echo '----------------------------------------'
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo '2. CHECKING REQUIRED TABLES:'
\echo '----------------------------------------'

-- Check for leads table and related tables
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') 
        THEN '✓ leads table exists'
        ELSE '✗ leads table MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lead_activities') 
        THEN '✓ lead_activities table exists'
        ELSE '✗ lead_activities table MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sample_report_downloads') 
        THEN '✓ sample_report_downloads table exists'
        ELSE '✗ sample_report_downloads table MISSING'
    END as status;

-- Check for analytics engine tables
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pilot_baselines') 
        THEN '✓ pilot_baselines table exists'
        ELSE '✗ pilot_baselines table MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assumption_sets') 
        THEN '✓ assumption_sets table exists'
        ELSE '✗ assumption_sets table MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pilot_metrics') 
        THEN '✓ pilot_metrics table exists'
        ELSE '✗ pilot_metrics table MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'call_classifications') 
        THEN '✓ call_classifications table exists'
        ELSE '✗ call_classifications table MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'capacity_analyses') 
        THEN '✓ capacity_analyses table exists'
        ELSE '✗ capacity_analyses table MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_measurements') 
        THEN '✓ performance_measurements table exists'
        ELSE '✗ performance_measurements table MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_reports') 
        THEN '✓ performance_reports table exists'
        ELSE '✗ performance_reports table MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pilot_reports') 
        THEN '✓ pilot_reports table exists'
        ELSE '✗ pilot_reports table MISSING'
    END as status;

\echo ''
\echo '3. LEADS TABLE STRUCTURE:'
\echo '----------------------------------------'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads'
ORDER BY ordinal_position;

\echo ''
\echo '4. CHECKING CRITICAL COLUMNS IN LEADS:'
\echo '----------------------------------------'

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'leads' AND column_name = 'source'
        ) 
        THEN '✓ source column exists'
        ELSE '✗ source column MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'leads' AND column_name = 'company'
        ) 
        THEN '✓ company column exists'
        ELSE '✗ company column MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'leads' AND column_name = 'job_title'
        ) 
        THEN '✓ job_title column exists'
        ELSE '✗ job_title column MISSING'
    END as status;

\echo ''
\echo '5. CHECKING INDEXES:'
\echo '----------------------------------------'
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN (
        'leads', 'lead_activities', 'sample_report_downloads',
        'pilot_baselines', 'assumption_sets', 'pilot_metrics',
        'call_classifications', 'capacity_analyses', 
        'performance_measurements', 'performance_reports', 'pilot_reports'
    )
ORDER BY tablename, indexname;

\echo ''
\echo '6. CHECKING TRIGGERS:'
\echo '----------------------------------------'
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
    AND event_object_table IN ('leads', 'lead_activities')
ORDER BY event_object_table, trigger_name;

\echo ''
\echo '7. CHECKING RLS POLICIES:'
\echo '----------------------------------------'
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

\echo ''
\echo '8. SAMPLE DATA CHECK:'
\echo '----------------------------------------'

-- Check if default assumption set exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM assumption_sets WHERE version = 'v1.0') 
        THEN '✓ Default assumption set (v1.0) exists'
        ELSE '✗ Default assumption set MISSING - migration may not have completed'
    END as status;

-- Count records in key tables
SELECT 'leads' as table_name, COUNT(*) as record_count FROM leads
UNION ALL
SELECT 'lead_activities', COUNT(*) FROM lead_activities
UNION ALL
SELECT 'sample_report_downloads', COUNT(*) FROM sample_report_downloads
UNION ALL
SELECT 'pilot_baselines', COUNT(*) FROM pilot_baselines
UNION ALL
SELECT 'assumption_sets', COUNT(*) FROM assumption_sets
UNION ALL
SELECT 'pilot_metrics', COUNT(*) FROM pilot_metrics
UNION ALL
SELECT 'call_classifications', COUNT(*) FROM call_classifications
UNION ALL
SELECT 'capacity_analyses', COUNT(*) FROM capacity_analyses
UNION ALL
SELECT 'performance_measurements', COUNT(*) FROM performance_measurements
UNION ALL
SELECT 'performance_reports', COUNT(*) FROM performance_reports
UNION ALL
SELECT 'pilot_reports', COUNT(*) FROM pilot_reports;

\echo ''
\echo '========================================'
\echo 'VERIFICATION COMPLETE'
\echo '========================================'
\echo ''
\echo 'Expected Results:'
\echo '- All 11 tables should exist (✓)'
\echo '- leads table should have source, company, job_title columns (✓)'
\echo '- Default assumption set v1.0 should exist (✓)'
\echo '- Indexes should be created for all tables'
\echo '- RLS policies should be enabled'
\echo ''
