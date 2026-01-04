"""
Run Supabase migrations using the REST API
"""
import requests
import os

# Supabase credentials from env.local
SUPABASE_URL = "https://soudakcdmpcfavticrxd.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdWRha2NkbXBjZmF2dGljcnhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTcxNCwiZXhwIjoyMDgxOTg3NzE0fQ.EHXM32IuInkNghwcFSewaSZgEo48gH0ttCcbAZD3Lck"

def run_sql_via_postgrest(sql):
    """Execute SQL via Supabase PostgREST RPC"""
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Try the SQL execution endpoint
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
        headers=headers,
        json={"query": sql}
    )
    return response

def run_migration_file(filepath):
    """Run a migration file"""
    print(f"\nProcessing: {filepath}")
    
    if not os.path.exists(filepath):
        print(f"  ERROR: File not found")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    print(f"  SQL loaded: {len(sql)} characters")
    
    # Split into individual statements for better error handling
    # Remove comments and split by semicolons
    statements = []
    current = []
    in_function = False
    
    for line in sql.split('\n'):
        stripped = line.strip()
        
        # Track if we're inside a function definition
        if 'CREATE OR REPLACE FUNCTION' in line or 'CREATE FUNCTION' in line:
            in_function = True
        if in_function and stripped.startswith('$$') and stripped.endswith('$$;'):
            in_function = False
        if in_function and '$$;' in line:
            in_function = False
            
        current.append(line)
        
        # End of statement (but not inside function)
        if stripped.endswith(';') and not in_function:
            stmt = '\n'.join(current).strip()
            if stmt and not stmt.startswith('--'):
                statements.append(stmt)
            current = []
    
    # Add any remaining
    if current:
        stmt = '\n'.join(current).strip()
        if stmt:
            statements.append(stmt)
    
    print(f"  Found {len(statements)} SQL statements")
    
    # For Supabase, we need to use the Management API or SQL Editor
    # The REST API doesn't support DDL directly
    # Let's output instructions instead
    
    return sql

def main():
    print("="*60)
    print("SUPABASE MIGRATION")
    print("="*60)
    
    migrations = [
        "database/migrations/023_complete_schema.sql",
        "database/migrations/024_god_admin_user.sql"
    ]
    
    print("\nSupabase doesn't support DDL via REST API.")
    print("Please run these migrations manually in Supabase SQL Editor:")
    print(f"\n1. Go to: {SUPABASE_URL}")
    print("2. Login: prajwal.uraw@haiec.com / Gingka@120")
    print("3. Click 'SQL Editor' in the left sidebar")
    print("4. Click 'New Query'")
    
    for i, migration in enumerate(migrations, 1):
        if os.path.exists(migration):
            print(f"\n{i+4}. Copy and paste contents of: {migration}")
            print(f"   Full path: {os.path.abspath(migration)}")
        else:
            print(f"\n   WARNING: {migration} not found!")
    
    print("\n" + "="*60)
    print("ALTERNATIVE: Direct PostgreSQL Connection")
    print("="*60)
    print("\nYou can also connect directly using psql:")
    print("psql 'postgresql://postgres.soudakcdmpcfavticrxd:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres'")
    print("\nGet the password from Supabase Dashboard > Settings > Database > Connection string")
    
    # Let's try to get the database password and connect directly
    print("\n" + "="*60)
    print("Attempting direct connection via Supabase pooler...")
    print("="*60)
    
    # Try using psycopg2 with Supabase connection pooler
    try:
        import psycopg2
        
        # Supabase connection string format for pooler
        # We need the database password from the dashboard
        # For now, let's check if we can use the service key somehow
        
        print("\nNote: Direct connection requires database password from Supabase Dashboard.")
        print("The service key is for API access, not direct DB connection.")
        
    except ImportError:
        print("psycopg2 not available")
    
    print("\n" + "="*60)
    print("QUICK COPY - Migration 023 (Complete Schema)")
    print("="*60)
    
    if os.path.exists("database/migrations/023_complete_schema.sql"):
        with open("database/migrations/023_complete_schema.sql", 'r') as f:
            content = f.read()
        print(f"\nFile ready: {len(content)} characters")
        print("Open the file and copy to Supabase SQL Editor")
    
    print("\n" + "="*60)
    print("QUICK COPY - Migration 024 (God Admin User)")
    print("="*60)
    
    if os.path.exists("database/migrations/024_god_admin_user.sql"):
        with open("database/migrations/024_god_admin_user.sql", 'r') as f:
            content = f.read()
        print(f"\nFile ready: {len(content)} characters")
        print("Open the file and copy to Supabase SQL Editor")

if __name__ == "__main__":
    main()
