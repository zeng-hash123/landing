import dotenv
import os
from supabase_client import supabase_client

dotenv.load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_PUBLIC")

print(f"SUPABASE_URL: {url}")
print(f"SUPABASE_KEY starts with: {key[:15] if key else 'None'}...")

try:
    print("\n1. Testing 'pages' table...")
    res1 = supabase_client.table("pages").select("id").limit(1).execute()
    print("   'pages' table exists! Found rows:", len(res1.data))
except Exception as e:
    print("   'pages' table check error:", e)

try:
    print("\n2. Testing 'page_versions' table...")
    res2 = supabase_client.table("page_versions").select("id").limit(1).execute()
    print("   'page_versions' table exists! Found rows:", len(res2.data))
except Exception as e:
    print("   'page_versions' table check error:", e)
