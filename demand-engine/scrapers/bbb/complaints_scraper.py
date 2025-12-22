"""
BBB Complaints Scraper
Monitors Better Business Bureau complaints for HVAC/Plumbing companies
Companies with complaints = potential customers looking to switch
"""

import os
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json
import re

class BBBComplaintsScraper:
    """
    Scrapes BBB for complaints against HVAC/Plumbing companies
    Complaints = dissatisfied customers = potential leads
    """
    
    def __init__(self):
        # BBB doesn't have a public API, so we use mock data
        # In production, this would use web scraping
        self.base_url = "https://www.bbb.org"
        
        # Target business categories
        self.target_categories = [
            "Heating and Air Conditioning",
            "Plumbing",
            "HVAC",
            "Air Conditioning & Heating",
            "Plumbing Contractors"
        ]
        
        # Geographic areas to monitor
        self.target_areas = [
            "Los Angeles, CA",
            "Dallas, TX",
            "Miami, FL",
            "New York, NY",
            "Chicago, IL"
        ]
    
    def scrape_complaints(self, category: str, area: str, days_back: int = 30) -> List[Dict]:
        """
        Scrape BBB complaints for a category in an area
        
        Args:
            category: Business category
            area: Geographic area
            days_back: How many days back to check
            
        Returns:
            List of complaint signals
        """
        print(f"⚠️  BBB scraping - Using mock data (no public API)")
        print(f"   Real implementation would scrape BBB website")
        
        return self._get_mock_complaints(category, area, days_back)
    
    def analyze_complaint_signal(self, complaint: Dict) -> Dict:
        """
        Analyze complaint for pain signals
        
        Args:
            complaint: Complaint data
            
        Returns:
            Pain signal analysis
        """
        # Recent complaints = hot leads
        days_old = (datetime.now() - datetime.fromisoformat(complaint['complaint_date'])).days
        recency_score = max(100 - (days_old * 3), 30)
        
        # Unresolved complaints score higher
        resolution_penalty = 0 if complaint.get('status') == 'unresolved' else 20
        
        # Severity based on complaint text
        complaint_text = complaint.get('complaint_text', '').lower()
        severity_keywords = ['terrible', 'worst', 'never', 'scam', 'fraud', 'horrible']
        severity_score = sum(15 for kw in severity_keywords if kw in complaint_text)
        
        total_score = min(recency_score + severity_score - resolution_penalty, 100)
        
        return {
            "urgency_score": min(recency_score, 100),
            "budget_score": 70,  # Dissatisfied customer = willing to pay for better service
            "authority_score": 80,  # Complainant = decision maker
            "pain_score": min(severity_score + 50, 100),
            "total_score": total_score,
            "signals": {
                "recent_complaint": days_old < 30,
                "unresolved": complaint.get('status') == 'unresolved',
                "high_severity": severity_score > 30,
                "days_old": days_old
            }
        }
    
    def extract_customer_info(self, complaint: Dict) -> Dict:
        """
        Extract potential customer information from complaint
        
        Args:
            complaint: Complaint data
            
        Returns:
            Customer information
        """
        return {
            "customer_name": complaint.get('complainant_name', 'Anonymous'),
            "customer_location": complaint.get('complainant_location', ''),
            "complained_about": complaint.get('business_name', ''),
            "complaint_category": complaint.get('category', ''),
            "complaint_date": complaint.get('complaint_date', ''),
            "complaint_text": complaint.get('complaint_text', ''),
            "status": complaint.get('status', 'unknown'),
            "source_url": complaint.get('url', '')
        }
    
    def scrape_all_areas(self, days_back: int = 30) -> List[Dict]:
        """
        Scrape all target categories across all areas
        
        Args:
            days_back: How many days back to check
            
        Returns:
            List of all complaint signals
        """
        all_signals = []
        
        for category in self.target_categories:
            for area in self.target_areas:
                print(f"🔍 Checking BBB complaints: {category} in {area}")
                
                complaints = self.scrape_complaints(category, area, days_back)
                
                for complaint in complaints:
                    customer_info = self.extract_customer_info(complaint)
                    pain_analysis = self.analyze_complaint_signal(complaint)
                    
                    signal = {
                        **customer_info,
                        **pain_analysis,
                        "source_type": "bbb_complaints",
                        "signal_type": "customer_complaint",
                        "category": category,
                        "area": area,
                        "scraped_at": datetime.now().isoformat()
                    }
                    
                    all_signals.append(signal)
                
                print(f"   Found {len(complaints)} complaints")
        
        return all_signals
    
    def _get_mock_complaints(self, category: str, area: str, days_back: int) -> List[Dict]:
        """
        Generate mock complaint data for demo
        
        In production, this would scrape actual BBB website
        """
        mock_complaints = []
        
        for i in range(2):  # 2 complaints per category/area
            complaint_date = datetime.now() - timedelta(days=i*15)
            
            complaint = {
                "business_name": f"{area.split(',')[0]} {category.split()[0]} Co.",
                "complainant_name": f"Customer {i+1}",
                "complainant_location": area,
                "category": category,
                "complaint_date": complaint_date.isoformat(),
                "complaint_text": f"Terrible service. They never showed up on time and the work was horrible. Would not recommend.",
                "status": "unresolved" if i == 0 else "resolved",
                "url": f"https://www.bbb.org/complaint/mock-{i}"
            }
            
            mock_complaints.append(complaint)
        
        return mock_complaints


def main():
    """Test the BBB complaints scraper"""
    scraper = BBBComplaintsScraper()
    
    print("=" * 60)
    print("BBB Complaints Scraper - Test Run")
    print("=" * 60)
    print()
    
    # Test single category/area
    print("Testing HVAC in Los Angeles...")
    complaints = scraper.scrape_complaints("HVAC", "Los Angeles, CA", days_back=30)
    print(f"Found {len(complaints)} complaints")
    print()
    
    if complaints:
        print("Sample complaint:")
        complaint = complaints[0]
        customer_info = scraper.extract_customer_info(complaint)
        pain_analysis = scraper.analyze_complaint_signal(complaint)
        
        print(f"  Customer: {customer_info['customer_name']}")
        print(f"  Complained about: {customer_info['complained_about']}")
        print(f"  Location: {customer_info['customer_location']}")
        print(f"  Status: {customer_info['status']}")
        print(f"  Pain Score: {pain_analysis['total_score']}")
        print()
    
    # Test all areas (limited)
    print("Testing all areas (limited)...")
    scraper.target_categories = scraper.target_categories[:2]
    scraper.target_areas = scraper.target_areas[:2]
    
    all_signals = scraper.scrape_all_areas(days_back=30)
    print(f"Total signals found: {len(all_signals)}")
    print()
    
    # Show high-scoring signals
    high_score_signals = [s for s in all_signals if s['total_score'] >= 60]
    print(f"High-score signals (≥60): {len(high_score_signals)}")
    
    if high_score_signals:
        print("\nTop signal:")
        signal = high_score_signals[0]
        print(f"  Customer: {signal['customer_name']}")
        print(f"  Location: {signal['customer_location']}")
        print(f"  Complained about: {signal['complained_about']}")
        print(f"  Score: {signal['total_score']}")
        print(f"  Unresolved: {signal['signals']['unresolved']}")


if __name__ == "__main__":
    main()
