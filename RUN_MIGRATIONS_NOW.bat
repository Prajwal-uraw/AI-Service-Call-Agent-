@echo off
REM Run Supabase Migrations (DROP then CREATE approach)
REM This script connects to your Supabase database and runs the required migrations
REM Works without local Supabase CLI - uses psql directly

echo ========================================
echo Running Database Migrations
echo ========================================
echo.
echo NOTE: This uses DROP then CREATE approach
echo Any existing data in these tables will be preserved
echo but indexes and policies will be recreated
echo.

REM Set the connection string
set PGPASSWORD=Gingka@120
set DATABASE_URL=postgresql://postgres.soudakcdmpcfavticrxd:Gingka@120@aws-0-us-east-1.pooler.supabase.com:6543/postgres

echo Step 1: Fixing leads table (DROP then CREATE)...
psql "%DATABASE_URL%" -f "database/migrations/FIX_015_leads_DROP_CREATE.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to run FIX_015_leads_DROP_CREATE.sql
    echo.
    echo Troubleshooting:
    echo - Make sure PostgreSQL client (psql) is installed
    echo - Check if the database is accessible
    echo - Verify credentials are correct
    pause
    exit /b 1
)
echo ✓ Leads table fixed successfully
echo.

echo Step 2: Creating analytics engines tables (DROP then CREATE)...
psql "%DATABASE_URL%" -f "database/migrations/016_analytics_DROP_CREATE.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to run 016_analytics_DROP_CREATE.sql
    echo.
    echo Troubleshooting:
    echo - Check previous step completed successfully
    echo - Verify database connection is still active
    pause
    exit /b 1
)
echo ✓ Analytics engines created successfully
echo.

echo ========================================
echo All migrations completed successfully!
echo ========================================
echo.
echo What was done:
echo - Leads table updated with all required columns
echo - Lead activities and sample downloads tables created
echo - All 8 analytics engine tables created
echo - Indexes and RLS policies applied
echo - Sample assumption set inserted
echo.
echo You can now:
echo 1. Start your backend server
echo 2. Test report generation at /admin/generate-report
echo.
pause
