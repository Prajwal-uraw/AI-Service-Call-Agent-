"""
ZipRecruiter Job Board Scraper
Monitors HVAC/Plumbing job postings for pain signals
"""

import os
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json

class ZipRecruiterScraper:
    """
    Scrapes ZipRecruiter for HVAC/Plumbing job postings
    Identifies companies hiring = potential pain signals
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ZIPRECRUITER_API_KEY")
        self.base_url = "https://api.ziprecruiter.com/jobs/v1"
        
        # Target job titles
        self.target_keywords = [
            "HVAC",
            "plumber",
            "plumbing",
            "refrigeration",
            "service technician"
        ]
        
        # Location codes (can be expanded)
        self.target_locations = [
            "California",
            "Texas",
            "Florida",
            "New York",
            "Illinois"
        ]
    
    def search_jobs(self, keyword: str, location: str, days_back: int = 7) -> List[Dict]:
        """
        Search ZipRecruiter for jobs
        
        Args:
            keyword: Job keyword
            location: Location to search
            days_back: Days back to search
            
        Returns:
            List of job postings
        """
        if not self.api_key:
            print("⚠️  ZipRecruiter API key not set. Using mock data for demo.")
            return self._get_mock_data(keyword, location)
        
        params = {
            "api_key": self.api_key,
            "search": keyword,
            "location": location,
            "radius_miles": 50,
            "days_ago": days_back,
            "jobs_per_page": 20,
            "page": 1
        }
        
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return data.get("jobs", [])
        
        except requests.exceptions.RequestException as e:
            print(f"❌ ZipRecruiter API error: {e}")
            return []
    
    def extract_company_info(self, job: Dict) -> Dict:
        """Extract company information from job posting"""
        return {
            "company_name": job.get("hiring_company", {}).get("name", "Unknown"),
            "location": job.get("location", ""),
            "city": job.get("city", ""),
            "state": job.get("state", ""),
            "job_title": job.get("name", ""),
            "job_id": job.get("id", ""),
            "url": job.get("url", ""),
            "snippet": job.get("snippet", ""),
            "posted_time": job.get("posted_time", ""),
            "source": "ziprecruiter"
        }
    
    def analyze_pain_signals(self, job: Dict) -> Dict:
        """Analyze job posting for pain signals"""
        snippet = (job.get("snippet", "") + " " + job.get("name", "")).lower()
        
        # Pain signal keywords
        urgency_keywords = ["urgent", "immediate", "asap", "emergency", "now hiring"]
        growth_keywords = ["expanding", "growing", "new branch", "opening"]
        volume_keywords = ["high volume", "busy", "fast-paced", "multiple openings"]
        
        urgency_score = sum(20 for kw in urgency_keywords if kw in snippet)
        growth_score = sum(15 for kw in growth_keywords if kw in snippet)
        volume_score = sum(10 for kw in volume_keywords if kw in snippet)
        
        base_score = 40
        total_score = min(base_score + urgency_score + growth_score + volume_score, 100)
        
        return {
            "urgency_score": min(urgency_score, 100),
            "budget_score": min(growth_score + 30, 100),
            "authority_score": 70,
            "pain_score": min(volume_score + urgency_score, 100),
            "total_score": total_score,
            "signals": {
                "urgency_detected": urgency_score > 0,
                "growth_detected": growth_score > 0,
                "high_volume": volume_score > 0
            }
        }
    
    def scrape_all_locations(self, days_back: int = 7) -> List[Dict]:
        """Scrape all target keywords across all locations"""
        all_signals = []
        
        for keyword in self.target_keywords:
            for location in self.target_locations:
                print(f"🔍 Searching: {keyword} in {location}")
                
                jobs = self.search_jobs(keyword, location, days_back)
                
                for job in jobs:
                    company_info = self.extract_company_info(job)
                    pain_analysis = self.analyze_pain_signals(job)
                    
                    signal = {
                        **company_info,
                        **pain_analysis,
                        "source_type": "job_board_ziprecruiter",
                        "signal_type": "hiring_activity",
                        "keywords": [keyword],
                        "scraped_at": datetime.now().isoformat()
                    }
                    
                    all_signals.append(signal)
                
                print(f"   Found {len(jobs)} jobs")
        
        return all_signals
    
    def _get_mock_data(self, keyword: str, location: str) -> List[Dict]:
        """Generate mock data for demo"""
        return [
            {
                "name": f"{keyword} - Immediate Start",
                "hiring_company": {"name": "Premier HVAC Solutions"},
                "city": "Houston",
                "state": "TX",
                "location": "Houston, TX",
                "snippet": "Urgent hiring for experienced HVAC technician. Growing company with immediate openings.",
                "posted_time": datetime.now().isoformat(),
                "url": "https://www.ziprecruiter.com/c/mock/job/123",
                "id": "mock123"
            },
            {
                "name": f"Senior {keyword}",
                "hiring_company": {"name": "Elite Plumbing Services"},
                "city": "Miami",
                "state": "FL",
                "location": "Miami, FL",
                "snippet": "Fast-paced environment. Multiple positions available. Expanding business.",
                "posted_time": datetime.now().isoformat(),
                "url": "https://www.ziprecruiter.com/c/mock/job/456",
                "id": "mock456"
            }
        ]


def main():
    """Test the ZipRecruiter scraper"""
    scraper = ZipRecruiterScraper()
    
    print("=" * 60)
    print("ZipRecruiter Job Board Scraper - Test Run")
    print("=" * 60)
    print()
    
    # Test single search
    print("Testing single search...")
    jobs = scraper.search_jobs("HVAC", "Texas", days_back=7)
    print(f"Found {len(jobs)} jobs")
    print()
    
    if jobs:
        print("Sample job:")
        job = jobs[0]
        company_info = scraper.extract_company_info(job)
        pain_analysis = scraper.analyze_pain_signals(job)
        
        print(f"  Company: {company_info['company_name']}")
        print(f"  Location: {company_info['location']}")
        print(f"  Job: {company_info['job_title']}")
        print(f"  Pain Score: {pain_analysis['total_score']}")
        print()
    
    # Test full scrape (limited)
    print("Testing full scrape (limited)...")
    scraper.target_keywords = scraper.target_keywords[:2]
    scraper.target_locations = scraper.target_locations[:2]
    
    all_signals = scraper.scrape_all_locations(days_back=7)
    print(f"Total signals found: {len(all_signals)}")
    print()
    
    high_score_signals = [s for s in all_signals if s['total_score'] >= 60]
    print(f"High-score signals (≥60): {len(high_score_signals)}")


if __name__ == "__main__":
    main()
