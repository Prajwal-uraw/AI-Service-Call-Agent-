"""
Run AlertStream migration on Neon DB
"""
import psycopg2

# Neon connection string from env.local (c-2 region)
NEON_URL = "postgresql://neondb_owner:npg_jry0eQfqV4TG@ep-muddy-mode-adfmj0bm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Alternative format without sslmode in URL
NEON_HOST = "ep-muddy-mode-adfmj0bm-pooler.us-east-1.aws.neon.tech"
NEON_USER = "neondb_owner"
NEON_PASSWORD = "npg_jry0eQfqV4TG"
NEON_DB = "neondb"

# Read migration file
with open('database/migrations/022_alertstream_neon.sql', 'r', encoding='utf-8') as f:
    migration_sql = f.read()

print("🚀 Connecting to Neon DB...")
print("=" * 60)

try:
    # Try with individual parameters first
    print("Trying connection with individual parameters...")
    conn = psycopg2.connect(
        host=NEON_HOST,
        database=NEON_DB,
        user=NEON_USER,
        password=NEON_PASSWORD,
        sslmode='require'
    )
    conn.autocommit = True
    cur = conn.cursor()
    
    print("✅ Connected to Neon DB")
    print("🔄 Running migration...")
    
    # Execute the migration
    cur.execute(migration_sql)
    
    print("✅ Migration completed successfully!")
    print("=" * 60)
    print("Tables created:")
    print("  - users")
    print("  - websites")
    print("  - triggers")
    print("  - events")
    print("  - sms_messages")
    print("  - api_keys")
    print("  - subscriptions")
    print("  - webhook_logs")
    print("=" * 60)
    
    # Verify tables
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    tables = cur.fetchall()
    print(f"\n📋 Tables in database: {[t[0] for t in tables]}")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error with individual params: {str(e)}")
    print("\nTrying URL connection...")
    
    try:
        conn = psycopg2.connect(NEON_URL)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(migration_sql)
        print("✅ Migration completed with URL connection!")
        cur.close()
        conn.close()
    except Exception as e2:
        print(f"❌ URL connection also failed: {str(e2)}")
        print("\n⚠️ Please run the migration manually in Neon Console:")
        print("1. Go to https://console.neon.tech")
        print("2. Select your project")
        print("3. Go to SQL Editor")
        print("4. Copy contents from database/migrations/022_alertstream_neon.sql")
        print("5. Run the SQL")
