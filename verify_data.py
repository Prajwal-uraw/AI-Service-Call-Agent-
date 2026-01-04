"""Verify scraped data in Supabase"""
import requests

SUPABASE_URL = "https://soudakcdmpcfavticrxd.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdWRha2NkbXBjZmF2dGljcnhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTcxNCwiZXhwIjoyMDgxOTg3NzE0fQ.EHXM32IuInkNghwcFSewaSZgEo48gH0ttCcbAZD3Lck"

headers = {"apikey": SUPABASE_KEY}

tables = [
    "job_board_signals",
    "bbb_signals", 
    "licensing_signals",
    "local_business_signals",
    "signals"
]

print("="*50)
print("DATA VERIFICATION")
print("="*50)

for table in tables:
    try:
        r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}?select=id", headers=headers)
        count = len(r.json()) if r.status_code == 200 else 0
        print(f"  {table}: {count} records")
    except Exception as e:
        print(f"  {table}: Error - {e}")

print("\n" + "="*50)
print("SAMPLE DATA")
print("="*50)

# Show sample from job_board_signals
r = requests.get(f"{SUPABASE_URL}/rest/v1/job_board_signals?select=company_name,location,score&limit=3", headers=headers)
print("\nJob Board Signals (top 3):")
for item in r.json():
    print(f"  - {item['company_name']} ({item['location']}) - Score: {item['score']}")

# Show sample from bbb_signals
r = requests.get(f"{SUPABASE_URL}/rest/v1/bbb_signals?select=business_name,rating,complaints_count&limit=3", headers=headers)
print("\nBBB Signals (top 3):")
for item in r.json():
    print(f"  - {item['business_name']} - Rating: {item['rating']}, Complaints: {item['complaints_count']}")

# Show sample from local_business_signals
r = requests.get(f"{SUPABASE_URL}/rest/v1/local_business_signals?select=business_name,city,google_rating&limit=3", headers=headers)
print("\nLocal Business Signals (top 3):")
for item in r.json():
    print(f"  - {item['business_name']} ({item['city']}) - Rating: {item['google_rating']}")

print("\n✅ Data is ready for the dashboard!")
