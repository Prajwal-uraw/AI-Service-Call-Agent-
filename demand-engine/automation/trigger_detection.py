"""
Trigger Detection System
Identifies re-engagement opportunities for leads
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json

class TriggerDetector:
    """
    Detects triggers for re-engaging leads
    - Seasonal triggers (winter prep, summer maintenance)
    - Time-based triggers (follow-up reminders)
    - Event-based triggers (license renewals, etc.)
    """
    
    def __init__(self):
        # Seasonal triggers
        self.seasonal_triggers = {
            "winter_prep": {
                "months": [9, 10, 11],  # Sept-Nov
                "message": "Winter is coming - time for heating system maintenance",
                "urgency": "high"
            },
            "summer_prep": {
                "months": [3, 4, 5],  # Mar-May
                "message": "Summer is approaching - AC tune-up recommended",
                "urgency": "high"
            },
            "spring_maintenance": {
                "months": [2, 3],  # Feb-Mar
                "message": "Spring maintenance special",
                "urgency": "medium"
            },
            "fall_maintenance": {
                "months": [8, 9],  # Aug-Sept
                "message": "Fall system check recommended",
                "urgency": "medium"
            }
        }
        
        # Time-based triggers
        self.time_triggers = {
            "no_contact_30_days": 30,
            "no_contact_60_days": 60,
            "no_contact_90_days": 90
        }
    
    def detect_seasonal_triggers(self, current_month: Optional[int] = None) -> List[Dict]:
        """
        Detect active seasonal triggers
        
        Args:
            current_month: Month to check (1-12), defaults to current month
            
        Returns:
            List of active triggers
        """
        if current_month is None:
            current_month = datetime.now().month
        
        active_triggers = []
        
        for trigger_name, trigger_data in self.seasonal_triggers.items():
            if current_month in trigger_data['months']:
                active_triggers.append({
                    "trigger_type": "seasonal",
                    "trigger_name": trigger_name,
                    "message": trigger_data['message'],
                    "urgency": trigger_data['urgency'],
                    "detected_at": datetime.now().isoformat()
                })
        
        return active_triggers
    
    def detect_time_triggers(self, lead: Dict) -> List[Dict]:
        """
        Detect time-based triggers for a lead
        
        Args:
            lead: Lead data with last_contact_at
            
        Returns:
            List of triggered time-based events
        """
        triggers = []
        
        last_contact = lead.get('last_contact_at')
        if not last_contact:
            return triggers
        
        last_contact_date = datetime.fromisoformat(last_contact.replace('Z', '+00:00'))
        days_since_contact = (datetime.now() - last_contact_date).days
        
        for trigger_name, days_threshold in self.time_triggers.items():
            if days_since_contact >= days_threshold:
                triggers.append({
                    "trigger_type": "time_based",
                    "trigger_name": trigger_name,
                    "days_since_contact": days_since_contact,
                    "message": f"No contact in {days_since_contact} days",
                    "urgency": "high" if days_since_contact > 60 else "medium",
                    "detected_at": datetime.now().isoformat()
                })
                break  # Only trigger once
        
        return triggers
    
    def match_triggers_to_leads(self, leads: List[Dict]) -> List[Dict]:
        """
        Match all triggers to leads
        
        Args:
            leads: List of leads to check
            
        Returns:
            List of lead-trigger matches
        """
        matches = []
        seasonal_triggers = self.detect_seasonal_triggers()
        
        for lead in leads:
            lead_triggers = []
            
            # Add seasonal triggers (apply to all leads)
            lead_triggers.extend(seasonal_triggers)
            
            # Add time-based triggers
            time_triggers = self.detect_time_triggers(lead)
            lead_triggers.extend(time_triggers)
            
            if lead_triggers:
                matches.append({
                    "lead_id": lead.get('id'),
                    "business_name": lead.get('business_name'),
                    "email": lead.get('email'),
                    "tier": lead.get('tier'),
                    "triggers": lead_triggers,
                    "trigger_count": len(lead_triggers)
                })
        
        return matches


def main():
    """Test trigger detection"""
    detector = TriggerDetector()
    
    print("=" * 60)
    print("Trigger Detection System - Test")
    print("=" * 60)
    print()
    
    # Test seasonal triggers
    print("Current seasonal triggers:")
    seasonal = detector.detect_seasonal_triggers()
    for trigger in seasonal:
        print(f"  - {trigger['trigger_name']}: {trigger['message']}")
    print()
    
    # Test with mock leads
    mock_leads = [
        {
            "id": "1",
            "business_name": "ABC HVAC",
            "email": "contact@abchvac.com",
            "tier": "warm",
            "last_contact_at": (datetime.now() - timedelta(days=35)).isoformat()
        },
        {
            "id": "2",
            "business_name": "XYZ Plumbing",
            "email": "info@xyzplumbing.com",
            "tier": "cold",
            "last_contact_at": (datetime.now() - timedelta(days=65)).isoformat()
        }
    ]
    
    print("Testing trigger matching...")
    matches = detector.match_triggers_to_leads(mock_leads)
    
    for match in matches:
        print(f"\n{match['business_name']}:")
        print(f"  Triggers: {match['trigger_count']}")
        for trigger in match['triggers']:
            print(f"    - {trigger['trigger_name']} ({trigger['urgency']})")


if __name__ == "__main__":
    main()
