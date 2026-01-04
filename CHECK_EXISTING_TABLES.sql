-- =====================================================
-- DATABASE DIAGNOSTIC SCRIPT
-- =====================================================
-- Run this FIRST to see what tables already exist
-- This is 100% SAFE - it only reads, doesn't modify anything
-- =====================================================

-- Check all existing tables
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check specifically for our required tables
SELECT 
    'tenants' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants')
        THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'tenant_users',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenant_users')
        THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'tenant_api_keys',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenant_api_keys')
        THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'call_logs',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'call_logs')
        THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'appointments',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments')
        THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'usage_tracking',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_tracking')
        THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'ai_agent_configs',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_agent_configs')
        THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'ai_config_templates',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_config_templates')
        THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'ai_config_audit_log',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_config_audit_log')
        THEN '✅ EXISTS' ELSE '❌ MISSING' END;

-- Check for any existing data (to avoid breaking things)
DO $$
DECLARE
    tenant_count INTEGER;
    call_count INTEGER;
BEGIN
    -- Check if tenants table exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
        SELECT COUNT(*) INTO tenant_count FROM tenants;
        RAISE NOTICE '📊 Existing tenants: %', tenant_count;
    ELSE
        RAISE NOTICE '⚠️  Tenants table does not exist yet';
    END IF;
    
    -- Check if call_logs exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'call_logs') THEN
        SELECT COUNT(*) INTO call_count FROM call_logs;
        RAISE NOTICE '📊 Existing call logs: %', call_count;
    ELSE
        RAISE NOTICE '⚠️  Call logs table does not exist yet';
    END IF;
END $$;

-- Check for Twilio-related columns (to ensure we don't break existing setup)
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name LIKE '%twilio%'
ORDER BY table_name, ordinal_position;

-- Check for triggers
SELECT 
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ DIAGNOSTIC COMPLETE';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Review the results above to see:';
    RAISE NOTICE '  1. Which tables already exist';
    RAISE NOTICE '  2. How much data you have';
    RAISE NOTICE '  3. Existing Twilio configuration';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run SAFE_MIGRATION_ONLY_MISSING.sql';
    RAISE NOTICE '==============================================';
END $$;
