"""
Local Business Contact Scraper
Focuses on business owner contact information from professional sources
Sources: BBB, Licensing Boards, Business Associations (no social media)
"""

import os
import sys
import asyncio
import httpx
from datetime import datetime
from typing import List, Dict, Any
import json

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import Supabase directly to avoid Modal dependency
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Tables enum
class Tables:
    SIGNALS = "signals"
    BUSINESS_CONTACTS = "business_contacts"
    SCRAPING_JOBS = "scraping_jobs"

def get_supabase() -> Client:
    """Get Supabase client"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment")
    
    return create_client(url, key)


class LocalBusinessScraper:
    """Scraper for business owner contact information"""
    
    def __init__(self):
        self.supabase = get_supabase()
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.results = []
        
    async def scrape_bbb_sample(self) -> List[Dict[str, Any]]:
        """
        Scrape BBB complaints (sample data for testing)
        In production, this would use BBB's API or web scraping
        """
        print("📋 Scraping BBB complaints...")
        
        # Sample BBB complaint data (in production, scrape from BBB.org)
        sample_complaints = [
            {
                "business_name": "Arctic Air Solutions",
                "industry": "hvac",
                "contact_name": "John Smith",
                "phone": "+1-555-0101",
                "email": "john@arcticair.com",
                "address": "123 Main St, Dallas, TX 75201",
                "city": "Dallas",
                "state": "TX",
                "complaint_count": 5,
                "rating": "B+",
                "years_in_business": 12,
                "pain_score": 65,
                "source": "bbb",
                "source_url": "https://www.bbb.org/us/tx/dallas/profile/hvac/arctic-air-solutions"
            },
            {
                "business_name": "Comfort Zone HVAC",
                "industry": "hvac",
                "contact_name": "Sarah Johnson",
                "phone": "+1-555-0102",
                "email": "sarah@comfortzonehvac.com",
                "address": "456 Oak Ave, Fort Worth, TX 76102",
                "city": "Fort Worth",
                "state": "TX",
                "complaint_count": 3,
                "rating": "A",
                "years_in_business": 8,
                "pain_score": 45,
                "source": "bbb",
                "source_url": "https://www.bbb.org/us/tx/fort-worth/profile/hvac/comfort-zone"
            },
            {
                "business_name": "Premier Plumbing Services",
                "industry": "plumbing",
                "contact_name": "Mike Davis",
                "phone": "+1-555-0103",
                "email": "mike@premierplumbing.com",
                "address": "789 Elm St, Austin, TX 78701",
                "city": "Austin",
                "state": "TX",
                "complaint_count": 8,
                "rating": "C",
                "years_in_business": 15,
                "pain_score": 75,
                "source": "bbb",
                "source_url": "https://www.bbb.org/us/tx/austin/profile/plumbing/premier-plumbing"
            }
        ]
        
        print(f"✅ Found {len(sample_complaints)} BBB businesses")
        return sample_complaints
    
    async def scrape_licensing_boards(self) -> List[Dict[str, Any]]:
        """
        Scrape state licensing boards (sample data)
        In production, scrape from state licensing websites
        """
        print("🏛️ Scraping licensing boards...")
        
        # Sample licensing data
        sample_licenses = [
            {
                "business_name": "Texas Cool Air",
                "industry": "hvac",
                "contact_name": "Robert Williams",
                "phone": "+1-555-0104",
                "email": "robert@texascoolair.com",
                "address": "321 Pine St, Houston, TX 77001",
                "city": "Houston",
                "state": "TX",
                "license_number": "TACLA12345",
                "license_status": "Active",
                "years_in_business": 20,
                "pain_score": 40,
                "source": "licensing_board",
                "source_url": "https://www.tdlr.texas.gov/ACSearch/"
            },
            {
                "business_name": "Elite HVAC & Refrigeration",
                "industry": "hvac",
                "contact_name": "Jennifer Martinez",
                "phone": "+1-555-0105",
                "email": "jennifer@elitehvac.com",
                "address": "654 Maple Dr, San Antonio, TX 78201",
                "city": "San Antonio",
                "state": "TX",
                "license_number": "TACLA67890",
                "license_status": "Active",
                "years_in_business": 5,
                "pain_score": 55,
                "source": "licensing_board",
                "source_url": "https://www.tdlr.texas.gov/ACSearch/"
            }
        ]
        
        print(f"✅ Found {len(sample_licenses)} licensed businesses")
        return sample_licenses
    
    async def scrape_business_associations(self) -> List[Dict[str, Any]]:
        """
        Scrape business association directories (sample data)
        Sources: ACCA, PHCC, local chambers of commerce
        """
        print("🏢 Scraping business associations...")
        
        # Sample association member data
        sample_members = [
            {
                "business_name": "Reliable Heating & Cooling",
                "industry": "hvac",
                "contact_name": "David Brown",
                "phone": "+1-555-0106",
                "email": "david@reliablehvac.com",
                "website": "https://www.reliablehvac.com",
                "address": "987 Cedar Ln, Plano, TX 75024",
                "city": "Plano",
                "state": "TX",
                "employee_count": "10-25",
                "annual_revenue": "$1M-$5M",
                "association": "ACCA",
                "years_in_business": 18,
                "pain_score": 50,
                "source": "association",
                "source_url": "https://www.acca.org/member-directory"
            },
            {
                "business_name": "All-Pro Plumbing Co",
                "industry": "plumbing",
                "contact_name": "Lisa Anderson",
                "phone": "+1-555-0107",
                "email": "lisa@allproplumbing.com",
                "website": "https://www.allproplumbing.com",
                "address": "147 Birch Ave, Irving, TX 75038",
                "city": "Irving",
                "state": "TX",
                "employee_count": "5-10",
                "annual_revenue": "$500K-$1M",
                "association": "PHCC",
                "years_in_business": 10,
                "pain_score": 60,
                "source": "association",
                "source_url": "https://www.phccweb.org/find-a-contractor"
            }
        ]
        
        print(f"✅ Found {len(sample_members)} association members")
        return sample_members
    
    async def score_with_ai(self, business: Dict[str, Any]) -> Dict[str, Any]:
        """Use OpenAI to score business opportunity"""
        if not self.openai_api_key:
            # Return default scores if no API key
            return business
        
        try:
            async with httpx.AsyncClient() as client:
                prompt = f"""
                Analyze this business and score the opportunity for selling an AI voice agent service:
                
                Business: {business.get('business_name')}
                Industry: {business.get('industry')}
                Complaints: {business.get('complaint_count', 0)}
                Years in Business: {business.get('years_in_business', 0)}
                Rating: {business.get('rating', 'N/A')}
                
                Provide scores (0-100):
                1. Pain Score: How much pain/problems do they likely have?
                2. Urgency Score: How urgent is their need?
                3. Fit Score: How well do they fit our ideal customer profile?
                
                Respond in JSON format only:
                {{"pain_score": X, "urgency_score": Y, "fit_score": Z, "reasoning": "brief explanation"}}
                """
                
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.3,
                        "max_tokens": 200
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result['choices'][0]['message']['content']
                    
                    # Extract JSON from response
                    if '{' in content and '}' in content:
                        json_str = content[content.find('{'):content.rfind('}')+1]
                        scores = json.loads(json_str)
                        business.update(scores)
                
        except Exception as e:
            print(f"⚠️ AI scoring failed: {e}")
        
        return business
    
    async def save_to_supabase(self, businesses: List[Dict[str, Any]]):
        """Save scraped businesses to Supabase"""
        print(f"\n💾 Saving {len(businesses)} businesses to Supabase...")
        
        saved_count = 0
        updated_count = 0
        
        for biz in businesses:
            try:
                # Create signal record
                signal_data = {
                    "title": f"{biz['business_name']} - {biz.get('industry', 'business').upper()} Opportunity",
                    "content": f"Business with {biz.get('complaint_count', 0)} complaints, {biz.get('years_in_business', 0)} years in business",
                    "url": biz.get('source_url', ''),
                    "source": biz.get('source', 'unknown'),
                    "pain_score": biz.get('pain_score', 50),
                    "urgency_score": biz.get('urgency_score', 50),
                    "relevance_score": biz.get('fit_score', 50),
                    "business_name": biz.get('business_name'),
                    "contact_name": biz.get('contact_name'),
                    "contact_email": biz.get('email'),
                    "contact_phone": biz.get('phone'),
                    "location": f"{biz.get('city', '')}, {biz.get('state', '')}",
                    "industry": biz.get('industry'),
                    "status": "new"
                }
                
                # Insert signal
                self.supabase.table(Tables.SIGNALS).insert(signal_data).execute()
                saved_count += 1
                
                # Create business contact record
                contact_data = {
                    "business_name": biz.get('business_name'),
                    "industry": biz.get('industry'),
                    "contact_name": biz.get('contact_name'),
                    "email": biz.get('email'),
                    "phone": biz.get('phone'),
                    "website": biz.get('website'),
                    "address": biz.get('address'),
                    "city": biz.get('city'),
                    "state": biz.get('state'),
                    "license_number": biz.get('license_number'),
                    "license_status": biz.get('license_status'),
                    "years_in_business": biz.get('years_in_business'),
                    "employee_count": biz.get('employee_count'),
                    "annual_revenue": biz.get('annual_revenue'),
                    "source": biz.get('source'),
                    "source_url": biz.get('source_url'),
                    "source_data": json.dumps(biz),
                    "data_quality_score": 80,
                    "status": "new"
                }
                
                # Try to insert, update if exists
                try:
                    self.supabase.table("business_contacts").insert(contact_data).execute()
                except:
                    # Update existing record
                    self.supabase.table("business_contacts").update(contact_data).eq(
                        "business_name", biz.get('business_name')
                    ).eq("phone", biz.get('phone')).execute()
                    updated_count += 1
                
            except Exception as e:
                print(f"❌ Error saving {biz.get('business_name')}: {e}")
        
        print(f"✅ Saved {saved_count} new businesses, updated {updated_count}")
        return saved_count, updated_count
    
    async def run(self):
        """Run the complete scraping pipeline"""
        print("🚀 Starting Local Business Scraper...")
        print("=" * 60)
        
        # Create scraping job record
        job_start = datetime.utcnow()
        job_data = {
            "job_type": "local_business_scrape",
            "status": "running",
            "started_at": job_start.isoformat()
        }
        
        try:
            job_result = self.supabase.table("scraping_jobs").insert(job_data).execute()
            job_id = job_result.data[0]['id'] if job_result.data else None
        except:
            job_id = None
        
        all_businesses = []
        
        try:
            # Scrape all sources
            bbb_data = await self.scrape_bbb_sample()
            all_businesses.extend(bbb_data)
            
            license_data = await self.scrape_licensing_boards()
            all_businesses.extend(license_data)
            
            association_data = await self.scrape_business_associations()
            all_businesses.extend(association_data)
            
            print(f"\n📊 Total businesses found: {len(all_businesses)}")
            
            # AI scoring (optional, only if API key available)
            if self.openai_api_key:
                print("\n🤖 Scoring businesses with AI...")
                for i, biz in enumerate(all_businesses):
                    scored = await self.score_with_ai(biz)
                    all_businesses[i] = scored
                    print(f"  ✓ Scored {biz['business_name']}: Pain={scored.get('pain_score', 50)}")
            
            # Save to Supabase
            saved, updated = await self.save_to_supabase(all_businesses)
            
            # Update job status
            if job_id:
                job_end = datetime.utcnow()
                duration = (job_end - job_start).total_seconds()
                
                self.supabase.table("scraping_jobs").update({
                    "status": "completed",
                    "completed_at": job_end.isoformat(),
                    "duration_seconds": int(duration),
                    "results_count": len(all_businesses),
                    "signals_created": saved,
                    "signals_updated": updated,
                    "metadata": json.dumps({
                        "sources": ["bbb", "licensing_board", "association"],
                        "total_businesses": len(all_businesses)
                    })
                }).eq("id", job_id).execute()
            
            print("\n" + "=" * 60)
            print("✅ Scraping Complete!")
            print(f"📈 Results:")
            print(f"   - Total businesses: {len(all_businesses)}")
            print(f"   - New signals: {saved}")
            print(f"   - Updated signals: {updated}")
            print(f"   - Duration: {duration:.1f}s")
            print("=" * 60)
            
            return {
                "success": True,
                "total_businesses": len(all_businesses),
                "saved": saved,
                "updated": updated,
                "duration": duration
            }
            
        except Exception as e:
            print(f"\n❌ Scraping failed: {e}")
            
            # Update job status to failed
            if job_id:
                self.supabase.table("scraping_jobs").update({
                    "status": "failed",
                    "completed_at": datetime.utcnow().isoformat(),
                    "error": str(e)
                }).eq("id", job_id).execute()
            
            return {
                "success": False,
                "error": str(e)
            }


async def main():
    """Main entry point for local scraper"""
    scraper = LocalBusinessScraper()
    result = await scraper.run()
    
    if result['success']:
        print("\n✅ Check your Supabase database for the new signals!")
        print("📊 View in dashboard: http://localhost:3000/admin/scraping")
    else:
        print(f"\n❌ Scraping failed: {result.get('error')}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
