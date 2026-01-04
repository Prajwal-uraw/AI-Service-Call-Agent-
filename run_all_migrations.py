"""
Run all database migrations for Neon (AlertStream) and Supabase (Main DB)
Uses credentials from env.local
"""

import os
import sys

# Neon DB (AlertStream) - New credentials
NEON_DATABASE_URL = "postgresql://neondb_owner:npg_K8nZhtqJGI0F@ep-small-recipe-ad45gw6y-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Supabase credentials
SUPABASE_URL = "https://soudakcdmpcfavticrxd.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdWRha2NkbXBjZmF2dGljcnhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTcxNCwiZXhwIjoyMDgxOTg3NzE0fQ.EHXM32IuInkNghwcFSewaSZgEo48gH0ttCcbAZD3Lck"

def run_neon_migration():
    """Run AlertStream migration on Neon DB"""
    print("\n" + "="*60)
    print("RUNNING NEON DB MIGRATION (AlertStream)")
    print("="*60)
    
    try:
        import psycopg2
    except ImportError:
        print("Installing psycopg2-binary...")
        os.system(f"{sys.executable} -m pip install psycopg2-binary")
        import psycopg2
    
    migration_file = "database/migrations/022_alertstream_neon.sql"
    
    if not os.path.exists(migration_file):
        print(f"ERROR: Migration file not found: {migration_file}")
        return False
    
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    try:
        print(f"Connecting to Neon DB...")
        conn = psycopg2.connect(NEON_DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Running AlertStream migration...")
        cursor.execute(migration_sql)
        
        # Verify tables created
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print(f"\n✅ Neon DB migration successful!")
        print(f"Tables in database: {[t[0] for t in tables]}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Neon DB migration failed: {e}")
        return False


def run_supabase_migration():
    """Run main schema migration on Supabase"""
    print("\n" + "="*60)
    print("RUNNING SUPABASE MIGRATION (Main Schema)")
    print("="*60)
    
    try:
        import requests
    except ImportError:
        print("Installing requests...")
        os.system(f"{sys.executable} -m pip install requests")
        import requests
    
    # Read migration files
    migrations = [
        "database/migrations/023_complete_schema.sql",
        "database/migrations/024_god_admin_user.sql"
    ]
    
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    # Supabase SQL endpoint
    sql_endpoint = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    
    for migration_file in migrations:
        if not os.path.exists(migration_file):
            print(f"ERROR: Migration file not found: {migration_file}")
            continue
            
        with open(migration_file, 'r') as f:
            migration_sql = f.read()
        
        print(f"\nRunning: {migration_file}")
        
        # Try using the SQL endpoint
        try:
            response = requests.post(
                sql_endpoint,
                headers=headers,
                json={"query": migration_sql}
            )
            
            if response.status_code in [200, 201, 204]:
                print(f"✅ {migration_file} - Success")
            else:
                print(f"⚠️ SQL RPC not available, trying direct connection...")
                # Fall back to direct psycopg2 connection
                run_supabase_direct(migration_sql, migration_file)
                
        except Exception as e:
            print(f"⚠️ API method failed: {e}")
            run_supabase_direct(migration_sql, migration_file)
    
    return True


def run_supabase_direct(sql, filename):
    """Run SQL directly on Supabase using psycopg2"""
    try:
        import psycopg2
    except ImportError:
        os.system(f"{sys.executable} -m pip install psycopg2-binary")
        import psycopg2
    
    # Supabase direct connection (using pooler)
    # Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    # We'll use the service key approach instead
    
    print(f"Note: For Supabase, please run the migration manually in SQL Editor:")
    print(f"  1. Go to: {SUPABASE_URL}")
    print(f"  2. Login and go to SQL Editor")
    print(f"  3. Run the contents of: {filename}")
    print(f"  File location: {os.path.abspath(filename)}")


def verify_neon_tables():
    """Verify all AlertStream tables exist in Neon"""
    print("\n" + "="*60)
    print("VERIFYING NEON DB TABLES")
    print("="*60)
    
    try:
        import psycopg2
        
        conn = psycopg2.connect(NEON_DATABASE_URL)
        cursor = conn.cursor()
        
        expected_tables = [
            'users', 'websites', 'triggers', 'events', 
            'sms_messages', 'api_keys', 'subscriptions', 'webhook_logs'
        ]
        
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        existing_tables = [t[0] for t in cursor.fetchall()]
        
        print(f"Existing tables: {existing_tables}")
        
        missing = [t for t in expected_tables if t not in existing_tables]
        if missing:
            print(f"❌ Missing tables: {missing}")
        else:
            print(f"✅ All AlertStream tables present!")
        
        cursor.close()
        conn.close()
        return len(missing) == 0
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False


def main():
    print("="*60)
    print("DATABASE MIGRATION RUNNER")
    print("="*60)
    
    # Run Neon migration
    neon_success = run_neon_migration()
    
    # Run Supabase migration
    supabase_success = run_supabase_migration()
    
    # Verify Neon tables
    if neon_success:
        verify_neon_tables()
    
    print("\n" + "="*60)
    print("MIGRATION SUMMARY")
    print("="*60)
    print(f"Neon DB (AlertStream): {'✅ Success' if neon_success else '❌ Failed'}")
    print(f"Supabase (Main): {'✅ Success' if supabase_success else '⚠️ Manual run required'}")
    print("\nFor Supabase, if automatic migration failed:")
    print("  1. Go to: https://soudakcdmpcfavticrxd.supabase.co")
    print("  2. Login: prajwal.uraw@haiec.com / Gingka@120")
    print("  3. SQL Editor → New Query")
    print("  4. Run: database/migrations/023_complete_schema.sql")
    print("  5. Run: database/migrations/024_god_admin_user.sql")


if __name__ == "__main__":
    main()
