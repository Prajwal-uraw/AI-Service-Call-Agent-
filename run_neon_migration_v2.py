"""
Run Neon DB migration for AlertStream tables
"""
import psycopg2
import os

# New Neon DB credentials
NEON_URL = "postgresql://neondb_owner:npg_K8nZhtqJGI0F@ep-small-recipe-ad45gw6y-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

def main():
    print("="*60)
    print("NEON DB MIGRATION - AlertStream Tables")
    print("="*60)
    
    # Read migration file
    migration_file = "database/migrations/022_alertstream_neon.sql"
    
    if not os.path.exists(migration_file):
        print(f"ERROR: Migration file not found: {migration_file}")
        return
    
    with open(migration_file, 'r', encoding='utf-8') as f:
        migration_sql = f.read()
    
    print(f"Migration file loaded: {len(migration_sql)} characters")
    
    try:
        print("\nConnecting to Neon DB...")
        conn = psycopg2.connect(NEON_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Running migration...")
        cursor.execute(migration_sql)
        
        print("\nVerifying tables...")
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print(f"\n✅ Migration successful!")
        print(f"\nTables in Neon DB:")
        for t in tables:
            print(f"  - {t[0]}")
        
        # Check expected AlertStream tables
        expected = ['users', 'websites', 'triggers', 'events', 'sms_messages', 'api_keys', 'subscriptions', 'webhook_logs']
        existing = [t[0] for t in tables]
        
        print(f"\nAlertStream tables check:")
        for table in expected:
            status = "✅" if table in existing else "❌"
            print(f"  {status} {table}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
