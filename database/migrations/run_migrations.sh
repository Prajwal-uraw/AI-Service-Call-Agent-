#!/bin/bash

# =====================================================
# Database Migration Runner
# =====================================================
# This script runs all migrations in order
# Usage: ./run_migrations.sh

set -e  # Exit on error

echo "=========================================="
echo "AI Service Call Agent - Database Migrations"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set your Supabase connection string:"
    echo "export DATABASE_URL='postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres'"
    echo ""
    exit 1
fi

echo "✅ Database connection string found"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Array of migration files in order
MIGRATIONS=(
    "001_initial_schema.sql"
    "002_crm_schema.sql"
)

echo "Found ${#MIGRATIONS[@]} migrations to run"
echo ""

# Run each migration
for migration in "${MIGRATIONS[@]}"; do
    migration_file="$SCRIPT_DIR/$migration"
    
    if [ ! -f "$migration_file" ]; then
        echo "❌ ERROR: Migration file not found: $migration"
        exit 1
    fi
    
    echo "📦 Running migration: $migration"
    
    # Run the migration
    if psql "$DATABASE_URL" -f "$migration_file" > /dev/null 2>&1; then
        echo "✅ Successfully applied: $migration"
    else
        echo "❌ Failed to apply: $migration"
        echo "   Check the error above for details"
        exit 1
    fi
    
    echo ""
done

echo "=========================================="
echo "✅ All migrations completed successfully!"
echo "=========================================="
echo ""

# Verify tables were created
echo "Verifying database schema..."
echo ""

psql "$DATABASE_URL" -c "
SELECT 
    'Tables: ' || COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
" -t

psql "$DATABASE_URL" -c "
SELECT 
    'Views: ' || COUNT(*) 
FROM information_schema.views 
WHERE table_schema = 'public';
" -t

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env files with database credentials"
echo "2. Start the backend server"
echo "3. Test the API endpoints"
echo ""
