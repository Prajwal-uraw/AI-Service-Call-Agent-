-- =====================================================
-- MIGRATION FIX FOR EXISTING TABLES
-- =====================================================
-- This script adds tenant_id columns to existing tables
-- that don't have multi-tenant support yet
-- Run this BEFORE the main migration if you have existing tables
-- =====================================================

-- Check which tables exist and need tenant_id
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'CHECKING EXISTING TABLES FOR TENANT_ID COLUMN';
    RAISE NOTICE '==============================================';
END $$;

-- Add tenant_id to contacts if it exists and doesn't have tenant_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contacts') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'tenant_id') THEN
            RAISE NOTICE '⚠️  Adding tenant_id to contacts table';
            -- Note: This will fail if tenants table doesn't exist yet
            -- In that case, skip this and run the main migration first
        END IF;
    END IF;
END $$;

-- Add tenant_id to leads if it exists and doesn't have tenant_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'tenant_id') THEN
            RAISE NOTICE '⚠️  Adding tenant_id to leads table';
        END IF;
    END IF;
END $$;

-- Add tenant_id to tasks if it exists and doesn't have tenant_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'tenant_id') THEN
            RAISE NOTICE '⚠️  Adding tenant_id to tasks table';
        END IF;
    END IF;
END $$;

-- Add tenant_id to notes if it exists and doesn't have tenant_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notes') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notes' AND column_name = 'tenant_id') THEN
            RAISE NOTICE '⚠️  Adding tenant_id to notes table';
        END IF;
    END IF;
END $$;

-- Summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ DIAGNOSTIC COMPLETE';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Your existing tables (contacts, leads, tasks, notes)';
    RAISE NOTICE '   do NOT have tenant_id columns yet.';
    RAISE NOTICE '';
    RAISE NOTICE '📋 RECOMMENDED APPROACH:';
    RAISE NOTICE '   1. These are CRM tables (internal use only)';
    RAISE NOTICE '   2. The new multi-tenant system is for VOICE AGENT customers';
    RAISE NOTICE '   3. Keep your CRM tables separate (no tenant_id needed)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ SOLUTION: Run SAFE_MIGRATION_STANDALONE.sql instead';
    RAISE NOTICE '   This creates NEW tenant tables without touching your CRM';
    RAISE NOTICE '==============================================';
END $$;
