"""
Push Supabase migrations using direct PostgreSQL connection
Supabase provides a direct connection via their pooler
"""
import os

# Supabase project details
PROJECT_REF = "soudakcdmpcfavticrxd"

# The database password is typically the same as the one you set when creating the project
# Or you can get it from: Supabase Dashboard > Settings > Database > Connection string

# Try common connection formats
SUPABASE_DB_CONNECTIONS = [
    # Transaction pooler (port 6543)
    f"postgresql://postgres.{PROJECT_REF}:Gingka%40120@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
    # Session pooler (port 5432)  
    f"postgresql://postgres.{PROJECT_REF}:Gingka%40120@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
    # Direct connection
    f"postgresql://postgres:Gingka%40120@db.{PROJECT_REF}.supabase.co:5432/postgres",
]

def run_migration():
    print("="*60)
    print("SUPABASE DIRECT DATABASE CONNECTION")
    print("="*60)
    
    try:
        import psycopg2
    except ImportError:
        print("Installing psycopg2-binary...")
        os.system("pip install psycopg2-binary")
        import psycopg2
    
    # Read the migration SQL
    migration_file = "supabase_migration_ready.sql"
    if not os.path.exists(migration_file):
        print(f"ERROR: {migration_file} not found. Run push_supabase_migration.py first.")
        return False
    
    with open(migration_file, 'r', encoding='utf-8') as f:
        migration_sql = f.read()
    
    print(f"Migration SQL loaded: {len(migration_sql)} characters")
    
    # Try each connection string
    for i, conn_str in enumerate(SUPABASE_DB_CONNECTIONS):
        print(f"\nTrying connection {i+1}...")
        # Hide password in output
        safe_str = conn_str.replace("Gingka%40120", "****")
        print(f"  URL: {safe_str[:80]}...")
        
        try:
            conn = psycopg2.connect(conn_str, connect_timeout=10)
            conn.autocommit = True
            cursor = conn.cursor()
            
            print("  ✅ Connected!")
            print("  Running migration...")
            
            cursor.execute(migration_sql)
            
            # Verify tables
            cursor.execute("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
            print(f"\n✅ Migration successful!")
            print(f"\nTables in Supabase:")
            for t in tables:
                print(f"  - {t[0]}")
            
            # Verify god admin
            cursor.execute("SELECT email, role, is_god_admin FROM admin_users WHERE email = 'Suvodkc@gmail.com';")
            admin = cursor.fetchone()
            if admin:
                print(f"\n✅ God admin created: {admin[0]} ({admin[1]}, god_admin={admin[2]})")
            
            cursor.close()
            conn.close()
            return True
            
        except psycopg2.OperationalError as e:
            error_msg = str(e)
            if "password authentication failed" in error_msg:
                print(f"  ❌ Password authentication failed")
            elif "could not connect" in error_msg or "timeout" in error_msg.lower():
                print(f"  ❌ Connection timeout/refused")
            else:
                print(f"  ❌ Connection error: {error_msg[:100]}")
        except Exception as e:
            print(f"  ❌ Error: {str(e)[:100]}")
    
    print("\n" + "="*60)
    print("MANUAL STEPS REQUIRED")
    print("="*60)
    print("\nCould not connect automatically. Please run manually:")
    print("\n1. Go to: https://supabase.com/dashboard/project/soudakcdmpcfavticrxd")
    print("2. Click 'SQL Editor' in the left sidebar")
    print("3. Click 'New Query'")
    print("4. Copy the contents of: supabase_migration_ready.sql")
    print("5. Paste into the SQL Editor")
    print("6. Click 'Run'")
    print("\nThe file is ready at: supabase_migration_ready.sql")
    
    return False

if __name__ == "__main__":
    run_migration()
