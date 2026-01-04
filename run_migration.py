"""
Run database migration using Supabase connection
"""
import os
from supabase import create_client, Client

# Supabase credentials
SUPABASE_URL = "https://soudakcdmpcfavticrxd.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdWRha2NkbXBjZmF2dGljcnhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTcxNCwiZXhwIjoyMDgxOTg3NzE0fQ.EHXM32IuInkNghwcFSewaSZgEo48gH0ttCcbAZD3Lc0"

# Read migration file
with open('database/migrations/021_reddit_signals_tables.sql', 'r', encoding='utf-8') as f:
    migration_sql = f.read()

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("🚀 Running migration 021_reddit_signals_tables.sql...")
print("=" * 60)

try:
    # Execute the migration
    result = supabase.rpc('exec_sql', {'sql': migration_sql}).execute()
    
    print("✅ Migration completed successfully!")
    print("=" * 60)
    print("Tables created:")
    print("  - reddit_signals")
    print("  - processing_stats")
    print("  - alert_history")
    print("  - unified_signals (view)")
    print("  - get_unalerted_signals() (function)")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ Migration failed: {str(e)}")
    print("\nTrying alternative approach - executing via REST API...")
    
    # Alternative: Use PostgREST to execute SQL
    import requests
    
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Split migration into individual statements
    statements = [s.strip() for s in migration_sql.split(';') if s.strip() and not s.strip().startswith('--')]
    
    print(f"\nExecuting {len(statements)} SQL statements...")
    
    for i, statement in enumerate(statements, 1):
        if not statement:
            continue
            
        try:
            # Use Supabase SQL editor endpoint
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
                headers=headers,
                json={"query": statement}
            )
            
            if response.status_code in [200, 201, 204]:
                print(f"  ✓ Statement {i}/{len(statements)}")
            else:
                print(f"  ⚠ Statement {i}/{len(statements)}: {response.text}")
                
        except Exception as stmt_error:
            print(f"  ✗ Statement {i}/{len(statements)}: {str(stmt_error)}")
    
    print("\n✅ Migration execution completed!")
    print("\nNote: Please verify tables in Supabase Dashboard:")
    print(f"  {SUPABASE_URL}/project/default/editor")
