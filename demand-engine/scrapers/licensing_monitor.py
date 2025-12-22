"""
Licensing Board Monitor for HVAC Business Signals
Monitors state contractor licensing boards for new HVAC business licenses
"""

import os
import hashlib
import re
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional
import logging
import httpx
from bs4 import BeautifulSoup

from config.supabase_config import get_supabase

logger = logging.getLogger(__name__)

# Configuration
STATE_LICENSING_BOARDS = {
    'CA': {
        'name': 'California Contractors State License Board',
        'url': 'https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx',
        'search_url': 'https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/CheckLicense.aspx'
    },
    'TX': {
        'name': 'Texas Department of Licensing and Regulation',
        'url': 'https://www.tdlr.texas.gov/LicenseSearch/',
        'search_url': 'https://www.tdlr.texas.gov/LicenseSearch/licenseSearch.asp'
    },
    'FL': {
        'name': 'Florida Department of Business and Professional Regulation',
        'url': 'https://www.myfloridalicense.com/wl11.asp',
        'search_url': 'https://www.myfloridalicense.com/wl11.asp'
    },
    'NY': {
        'name': 'New York Department of State - Division of Licensing Services',
        'url': 'https://appext20.dos.ny.gov/lcns_public/chk_load',
        'search_url': 'https://appext20.dos.ny.gov/lcns_public/chk_load'
    },
    'AZ': {
        'name': 'Arizona Registrar of Contractors',
        'url': 'https://roc.az.gov/license-lookup',
        'search_url': 'https://roc.az.gov/license-lookup'
    }
}

HVAC_LICENSE_TYPES = [
    'HVAC',
    'Mechanical',
    'Air Conditioning',
    'Refrigeration',
    'Sheet Metal',
    'Plumbing',
    'Heating'
]

LOOKBACK_DAYS = 30
MIN_SCORE_THRESHOLD = 50


class LicensingMonitor:
    """Monitor state licensing boards for new HVAC businesses"""
    
    def __init__(self):
        """Initialize licensing monitor"""
        self.supabase = get_supabase()
        self.client = httpx.Client(
            timeout=30.0,
            follow_redirects=True,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        )
    
    def search_california_licenses(self) -> List[Dict]:
        """
        Search California CSLB for new HVAC licenses
        Note: This is a framework. Production requires proper API access or scraping setup
        """
        licenses = []
        
        try:
            logger.info("🔍 Searching California CSLB for new HVAC licenses")
            
            # Placeholder: Would fetch real data from CSLB
            # California CSLB has a public API that can be used
            # For now, return empty to avoid actual scraping
            
        except Exception as e:
            logger.error(f"❌ California license search failed: {str(e)}")
        
        return licenses
    
    def search_texas_licenses(self) -> List[Dict]:
        """
        Search Texas TDLR for new HVAC licenses
        Note: This is a framework. Production requires proper API access
        """
        licenses = []
        
        try:
            logger.info("🔍 Searching Texas TDLR for new HVAC licenses")
            
            # Placeholder: Would fetch real data from TDLR
            # For now, return empty to avoid actual scraping
            
        except Exception as e:
            logger.error(f"❌ Texas license search failed: {str(e)}")
        
        return licenses
    
    def search_florida_licenses(self) -> List[Dict]:
        """
        Search Florida DBPR for new HVAC licenses
        Note: This is a framework. Production requires proper API access
        """
        licenses = []
        
        try:
            logger.info("🔍 Searching Florida DBPR for new HVAC licenses")
            
            # Placeholder: Would fetch real data from Florida DBPR
            # For now, return empty to avoid actual scraping
            
        except Exception as e:
            logger.error(f"❌ Florida license search failed: {str(e)}")
        
        return licenses
    
    def parse_license_data(self, raw_data: Dict, state: str) -> Optional[Dict]:
        """Parse license data into structured format"""
        try:
            license_data = {
                'state': state,
                'license_number': raw_data.get('license_number', ''),
                'license_type': raw_data.get('license_type', ''),
                'business_name': raw_data.get('business_name', ''),
                'owner_name': raw_data.get('owner_name', ''),
                'business_address': raw_data.get('address', ''),
                'city': raw_data.get('city', ''),
                'zip_code': raw_data.get('zip_code', ''),
                'phone': raw_data.get('phone', ''),
                'email': raw_data.get('email', ''),
                'issue_date': raw_data.get('issue_date', datetime.now(timezone.utc)),
                'expiration_date': raw_data.get('expiration_date'),
                'status': raw_data.get('status', 'Active')
            }
            
            return license_data
            
        except Exception as e:
            logger.error(f"❌ Failed to parse license data: {str(e)}")
            return None
    
    def score_license(self, license_data: Dict) -> int:
        """
        Score licensing signal based on business indicators
        
        New licenses = high urgency (new business needs equipment/services)
        """
        score = 0
        
        # Base score for new license
        score += 40
        
        # Bonus for recent issue (within 30 days)
        if license_data.get('issue_date'):
            days_old = (datetime.now(timezone.utc) - license_data['issue_date']).days
            if days_old <= 30:
                score += 30
            elif days_old <= 90:
                score += 20
        
        # Bonus for having contact info
        if license_data.get('phone'):
            score += 10
        if license_data.get('email'):
            score += 10
        
        # Bonus for specific HVAC license types
        license_type = license_data.get('license_type', '').lower()
        if any(hvac_type.lower() in license_type for hvac_type in HVAC_LICENSE_TYPES):
            score += 10
        
        return min(100, score)
    
    def extract_location(self, license_data: Dict) -> str:
        """Extract formatted location"""
        parts = []
        if license_data.get('city'):
            parts.append(license_data['city'])
        if license_data.get('state'):
            parts.append(license_data['state'])
        if license_data.get('zip_code'):
            parts.append(license_data['zip_code'])
        
        return ', '.join(parts) if parts else None
    
    def generate_content_hash(self, license_number: str, state: str) -> str:
        """Generate hash for deduplication"""
        content = f"{state}{license_number}".encode('utf-8')
        return hashlib.md5(content).hexdigest()
    
    def check_duplicate(self, content_hash: str) -> bool:
        """Check if license already exists"""
        try:
            result = self.supabase.table("licensing_signals")\
                .select("id")\
                .eq("content_hash", content_hash)\
                .execute()
            
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"❌ Duplicate check failed: {str(e)}")
            return False
    
    def save_signal(self, license_data: Dict, score: int) -> bool:
        """Save licensing signal to database"""
        try:
            signal_data = {
                'license_number': license_data['license_number'],
                'state': license_data['state'],
                'license_type': license_data['license_type'],
                'business_name': license_data['business_name'],
                'owner_name': license_data.get('owner_name'),
                'business_address': license_data.get('business_address'),
                'city': license_data.get('city'),
                'zip_code': license_data.get('zip_code'),
                'phone': license_data.get('phone'),
                'email': license_data.get('email'),
                'issue_date': license_data['issue_date'].isoformat(),
                'expiration_date': license_data.get('expiration_date').isoformat() if license_data.get('expiration_date') else None,
                'status': license_data.get('status', 'Active'),
                
                # Scoring (simplified for licensing)
                'urgency_score': 8,  # New licenses = high urgency
                'budget_score': 7,   # New businesses need equipment
                'authority_score': 10,  # License holder = decision maker
                'pain_score': 6,     # Setting up new business
                'total_score': score,
                
                # Location
                'location': self.extract_location(license_data),
                
                # Deduplication
                'content_hash': self.generate_content_hash(
                    license_data['license_number'],
                    license_data['state']
                ),
                
                # Processing metadata
                'processed': True,
                'scoring_method': 'keywords'
            }
            
            # Insert into database
            self.supabase.table("licensing_signals").insert(signal_data).execute()
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to save signal: {str(e)}")
            return False
    
    def run(self) -> Dict[str, any]:
        """Main execution"""
        logger.info("🚀 Starting licensing board monitor")
        
        stats = {
            'total_licenses': 0,
            'duplicates': 0,
            'low_score': 0,
            'saved': 0,
            'by_state': {}
        }
        
        # Note: In production, this would actually scrape licensing boards
        # For now, it's a framework ready to be activated
        
        logger.info("=" * 60)
        logger.info("📊 Licensing Monitor Summary")
        logger.info("=" * 60)
        logger.info("⚠️  Licensing board scraping framework ready")
        logger.info("⚠️  Requires API access or scraping setup to activate")
        logger.info("=" * 60)
        
        return stats


def main():
    """CLI entry point"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    monitor = LicensingMonitor()
    stats = monitor.run()
    
    print("\n" + "=" * 60)
    print("✅ Licensing Monitor Complete")
    print("=" * 60)
    print(f"Framework ready for activation")
    print("=" * 60)


if __name__ == "__main__":
    main()
