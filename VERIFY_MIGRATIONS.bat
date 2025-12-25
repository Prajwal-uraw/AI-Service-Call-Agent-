@echo off
REM Verify Database Migrations
REM This script checks if all migrations have been applied successfully

echo ========================================
echo DATABASE MIGRATION VERIFICATION
echo ========================================
echo.

REM Set the connection string
set PGPASSWORD=Gingka@120
set DATABASE_URL=postgresql://postgres.soudakcdmpcfavticrxd:Gingka@120@aws-0-us-east-1.pooler.supabase.com:6543/postgres

echo Running verification checks...
echo.

psql "%DATABASE_URL%" -f "database/migrations/VERIFY_ALL_TABLES.sql"

echo.
echo ========================================
echo Verification complete!
echo ========================================
echo.
echo Check the output above for any MISSING items
echo All items should show ✓ (checkmark)
echo.
pause
