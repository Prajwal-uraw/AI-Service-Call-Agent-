"""
Get Supabase database connection URL using Management API
"""
import requests

# Supabase credentials
SUPABASE_URL = "https://soudakcdmpcfavticrxd.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdWRha2NkbXBjZmF2dGljcnhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTcxNCwiZXhwIjoyMDgxOTg3NzE0fQ.EHXM32IuInkNghwcFSewaSZgEo48gH0ttCcbAZD3Lck"
PROJECT_REF = "soudakcdmpcfavticrxd"

def get_project_info():
    """Try to get project info from Supabase API"""
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    }
    
    # Try different endpoints
    endpoints = [
        f"{SUPABASE_URL}/rest/v1/",
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}",
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, headers=headers, timeout=10)
            print(f"Endpoint: {endpoint}")
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print(f"Response: {response.text[:500]}")
        except Exception as e:
            print(f"Error: {e}")
    
    print("\n" + "="*60)
    print("TO GET DATABASE PASSWORD:")
    print("="*60)
    print("""
1. Go to: https://supabase.com/dashboard/project/soudakcdmpcfavticrxd/settings/database
2. Look for "Connection string" section
3. Click "Copy" on the connection string
4. The format will be:
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

Then run:
   psql "[YOUR-CONNECTION-STRING]" -f supabase_migration_ready.sql

OR copy the contents of supabase_migration_ready.sql into the SQL Editor.
""")

if __name__ == "__main__":
    get_project_info()
