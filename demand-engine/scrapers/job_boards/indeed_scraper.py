"""
Indeed Job Board Scraper
Monitors HVAC/Plumbing job postings for pain signals
"""

import os
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json
import re

class IndeedScraper:
    """
    Scrapes Indeed for HVAC/Plumbing job postings
    Identifies companies hiring = potential pain signals
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("INDEED_API_KEY")
        self.base_url = "https://api.indeed.com/ads/apisearch"
        
        # Target job titles indicating HVAC/Plumbing needs
        self.target_keywords = [
            "HVAC technician",
            "HVAC installer",
            "HVAC service",
            "plumber",
            "plumbing technician",
            "refrigeration technician",
            "service technician HVAC",
            "commercial HVAC",
            "residential HVAC"
        ]
        
        # Location targeting (can be expanded)
        self.target_locations = [
            "United States",
            "California",
            "Texas",
            "Florida",
            "New York",
            "Illinois"
        ]
    
    def search_jobs(self, keyword: str, location: str, days_back: int = 7) -> List[Dict]:
        """
        Search Indeed for jobs matching keyword and location
        
        Args:
            keyword: Job title/keyword to search
            location: Location to search in
            days_back: How many days back to search
            
        Returns:
            List of job postings
        """
        if not self.api_key:
            print("⚠️  Indeed API key not set. Using mock data for demo.")
            return self._get_mock_data(keyword, location)
        
        params = {
            "publisher": self.api_key,
            "q": keyword,
            "l": location,
            "sort": "date",
            "radius": 50,
            "st": "jobsite",
            "jt": "fulltime",
            "start": 0,
            "limit": 25,
            "fromage": days_back,
            "format": "json",
            "v": "2"
        }
        
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return data.get("results", [])
        
        except requests.exceptions.RequestException as e:
            print(f"❌ Indeed API error: {e}")
            return []
    
    def extract_company_info(self, job: Dict) -> Dict:
        """
        Extract company information from job posting
        
        Args:
            job: Job posting data
            
        Returns:
            Company information dict
        """
        return {
            "company_name": job.get("company", "Unknown"),
            "location": job.get("formattedLocation", ""),
            "city": job.get("city", ""),
            "state": job.get("state", ""),
            "country": job.get("country", "US"),
            "job_title": job.get("jobtitle", ""),
            "job_key": job.get("jobkey", ""),
            "url": job.get("url", ""),
            "snippet": job.get("snippet", ""),
            "date": job.get("date", ""),
            "source": "indeed"
        }
    
    def analyze_pain_signals(self, job: Dict) -> Dict:
        """
        Analyze job posting for pain signals
        
        Args:
            job: Job posting data
            
        Returns:
            Pain signal analysis
        """
        snippet = (job.get("snippet", "") + " " + job.get("jobtitle", "")).lower()
        
        # Pain signal keywords
        urgency_keywords = ["urgent", "immediate", "asap", "emergency", "critical"]
        growth_keywords = ["expanding", "growing", "new location", "opening"]
        volume_keywords = ["high volume", "busy", "fast-paced", "multiple"]
        
        urgency_score = sum(20 for kw in urgency_keywords if kw in snippet)
        growth_score = sum(15 for kw in growth_keywords if kw in snippet)
        volume_score = sum(10 for kw in volume_keywords if kw in snippet)
        
        # Base score for actively hiring
        base_score = 40
        
        total_score = min(base_score + urgency_score + growth_score + volume_score, 100)
        
        return {
            "urgency_score": min(urgency_score, 100),
            "budget_score": min(growth_score + 30, 100),  # Hiring = budget available
            "authority_score": 70,  # Company decision makers
            "pain_score": min(volume_score + urgency_score, 100),
            "total_score": total_score,
            "signals": {
                "urgency_detected": urgency_score > 0,
                "growth_detected": growth_score > 0,
                "high_volume": volume_score > 0
            }
        }
    
    def scrape_all_locations(self, days_back: int = 7) -> List[Dict]:
        """
        Scrape all target keywords across all locations
        
        Args:
            days_back: How many days back to search
            
        Returns:
            List of all signals found
        """
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
                        "source_type": "job_board_indeed",
                        "signal_type": "hiring_activity",
                        "keywords": [keyword],
                        "scraped_at": datetime.now().isoformat()
                    }
                    
                    all_signals.append(signal)
                
                print(f"   Found {len(jobs)} jobs")
        
        return all_signals
    
    def _get_mock_data(self, keyword: str, location: str) -> List[Dict]:
        """
        Generate mock data for demo purposes when API key not available
        """
        return [
            {
                "jobtitle": f"{keyword}",
                "company": "ABC HVAC Services",
                "city": "Los Angeles",
                "state": "CA",
                "country": "US",
                "formattedLocation": "Los Angeles, CA",
                "snippet": "Urgent need for experienced HVAC technician. Growing company with high volume of service calls.",
                "date": datetime.now().isoformat(),
                "url": "https://www.indeed.com/viewjob?jk=mock123",
                "jobkey": "mock123"
            },
            {
                "jobtitle": f"Senior {keyword}",
                "company": "XYZ Plumbing Co",
                "city": "Dallas",
                "state": "TX",
                "country": "US",
                "formattedLocation": "Dallas, TX",
                "snippet": "Expanding business needs immediate hire. Multiple positions available.",
                "date": datetime.now().isoformat(),
                "url": "https://www.indeed.com/viewjob?jk=mock456",
                "jobkey": "mock456"
            }
        ]


def main():
    """Test the Indeed scraper"""
    scraper = IndeedScraper()
    
    print("=" * 60)
    print("Indeed Job Board Scraper - Test Run")
    print("=" * 60)
    print()
    
    # Test single search
    print("Testing single search...")
    jobs = scraper.search_jobs("HVAC technician", "California", days_back=7)
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
    
    # Test full scrape (limited for demo)
    print("Testing full scrape (limited)...")
    scraper.target_keywords = scraper.target_keywords[:2]  # Limit for demo
    scraper.target_locations = scraper.target_locations[:2]
    
    all_signals = scraper.scrape_all_locations(days_back=7)
    print(f"Total signals found: {len(all_signals)}")
    print()
    
    # Show high-scoring signals
    high_score_signals = [s for s in all_signals if s['total_score'] >= 60]
    print(f"High-score signals (≥60): {len(high_score_signals)}")
    
    if high_score_signals:
        print("\nTop signal:")
        signal = high_score_signals[0]
        print(f"  Company: {signal['company_name']}")
        print(f"  Location: {signal['location']}")
        print(f"  Score: {signal['total_score']}")
        print(f"  Signals: {signal['signals']}")


if __name__ == "__main__":
    main()
