"""
State Licensing Board Scraper
Monitors new HVAC/Plumbing licenses for pain signals
"""

import os
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json
import re

class StateLicenseScraper:
    """
    Scrapes state licensing boards for new HVAC/Plumbing licenses
    New licenses = new businesses = potential customers
    """
    
    def __init__(self):
        # State licensing board configurations
        self.states = {
            "california": {
                "name": "California",
                "url": "https://www2.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx",
                "license_types": ["C20", "C36"],  # HVAC, Plumbing
                "api_available": False
            },
            "texas": {
                "name": "Texas",
                "url": "https://www.tdlr.texas.gov/LicenseSearch/",
                "license_types": ["Air Conditioning", "Plumbing"],
                "api_available": False
            },
            "florida": {
                "name": "Florida",
                "url": "https://www.myfloridalicense.com/LicenseDetail.asp",
                "license_types": ["CAC", "CFC"],  # AC Contractor, Plumbing
                "api_available": False
            },
            "new_york": {
                "name": "New York",
                "url": "https://www.dos.ny.gov/licensing/",
                "license_types": ["HVAC", "Plumbing"],
                "api_available": False
            },
            "illinois": {
                "name": "Illinois",
                "url": "https://www.idfpr.com/LicenseLookup/",
                "license_types": ["HVAC", "Plumbing"],
                "api_available": False
            }
        }
    
    def scrape_new_licenses(self, state: str, days_back: int = 30) -> List[Dict]:
        """
        Scrape new licenses from state board
        
        Args:
            state: State code (e.g., 'california')
            days_back: How many days back to check
            
        Returns:
            List of new license signals
        """
        if state not in self.states:
            print(f"❌ State '{state}' not configured")
            return []
        
        state_config = self.states[state]
        
        # Since most states don't have public APIs, we'll use mock data
        # In production, this would use web scraping or state-specific APIs
        print(f"⚠️  {state_config['name']} licensing board - Using mock data")
        print(f"   Real implementation would scrape: {state_config['url']}")
        
        return self._get_mock_licenses(state_config, days_back)
    
    def analyze_license_signal(self, license_data: Dict) -> Dict:
        """
        Analyze new license for pain signals
        
        Args:
            license_data: License information
            
        Returns:
            Pain signal analysis
        """
        # New license = new business opportunity
        # Higher scores for recent licenses
        days_old = (datetime.now() - datetime.fromisoformat(license_data['issue_date'])).days
        
        # Newer licenses score higher
        recency_score = max(100 - (days_old * 2), 40)
        
        return {
            "urgency_score": min(recency_score, 100),
            "budget_score": 80,  # New business = likely has budget
            "authority_score": 90,  # License holder = decision maker
            "pain_score": 70,  # New business = needs customers
            "total_score": min((recency_score + 80 + 90 + 70) // 4, 100),
            "signals": {
                "new_license": True,
                "days_old": days_old,
                "license_active": license_data.get('status') == 'active'
            }
        }
    
    def scrape_all_states(self, days_back: int = 30) -> List[Dict]:
        """
        Scrape all configured states
        
        Args:
            days_back: How many days back to check
            
        Returns:
            List of all license signals
        """
        all_signals = []
        
        for state_code, state_config in self.states.items():
            print(f"🔍 Checking {state_config['name']} licensing board...")
            
            licenses = self.scrape_new_licenses(state_code, days_back)
            
            for license_data in licenses:
                pain_analysis = self.analyze_license_signal(license_data)
                
                signal = {
                    **license_data,
                    **pain_analysis,
                    "source_type": "licensing_board",
                    "signal_type": "new_license",
                    "scraped_at": datetime.now().isoformat()
                }
                
                all_signals.append(signal)
            
            print(f"   Found {len(licenses)} new licenses")
        
        return all_signals
    
    def _get_mock_licenses(self, state_config: Dict, days_back: int) -> List[Dict]:
        """
        Generate mock license data for demo
        
        In production, this would be replaced with actual web scraping
        or API calls to state licensing boards
        """
        mock_licenses = []
        
        for i in range(3):  # Generate 3 mock licenses per state
            issue_date = datetime.now() - timedelta(days=i*10)
            
            license = {
                "license_number": f"{state_config['name'][:2].upper()}-{1000+i}",
                "business_name": f"{state_config['name']} HVAC Services #{i+1}",
                "license_type": state_config['license_types'][i % len(state_config['license_types'])],
                "status": "active",
                "issue_date": issue_date.isoformat(),
                "expiration_date": (issue_date + timedelta(days=365*2)).isoformat(),
                "business_address": f"123 Main St, {state_config['name']}",
                "city": state_config['name'].split()[0],
                "state": state_config['name'],
                "phone": f"555-{1000+i:04d}",
                "source_url": state_config['url']
            }
            
            mock_licenses.append(license)
        
        return mock_licenses


def main():
    """Test the state license scraper"""
    scraper = StateLicenseScraper()
    
    print("=" * 60)
    print("State Licensing Board Scraper - Test Run")
    print("=" * 60)
    print()
    
    # Test single state
    print("Testing California...")
    licenses = scraper.scrape_new_licenses("california", days_back=30)
    print(f"Found {len(licenses)} licenses")
    print()
    
    if licenses:
        print("Sample license:")
        license = licenses[0]
        pain_analysis = scraper.analyze_license_signal(license)
        
        print(f"  Business: {license['business_name']}")
        print(f"  License: {license['license_number']}")
        print(f"  Type: {license['license_type']}")
        print(f"  Issued: {license['issue_date'][:10]}")
        print(f"  Pain Score: {pain_analysis['total_score']}")
        print()
    
    # Test all states
    print("Testing all states...")
    all_signals = scraper.scrape_all_states(days_back=30)
    print(f"Total signals found: {len(all_signals)}")
    print()
    
    # Show high-scoring signals
    high_score_signals = [s for s in all_signals if s['total_score'] >= 70]
    print(f"High-score signals (≥70): {len(high_score_signals)}")
    
    if high_score_signals:
        print("\nTop signal:")
        signal = high_score_signals[0]
        print(f"  Business: {signal['business_name']}")
        print(f"  State: {signal['state']}")
        print(f"  Score: {signal['total_score']}")
        print(f"  Days old: {signal['signals']['days_old']}")


if __name__ == "__main__":
    main()
