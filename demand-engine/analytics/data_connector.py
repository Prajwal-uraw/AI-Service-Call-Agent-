"""
Data Connector for Analytics Engines
Fetches real call data from Supabase for report generation
"""

import os
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from supabase import create_client, Client
import logging

logger = logging.getLogger(__name__)


class AnalyticsDataConnector:
    """Connects analytics engines to real Supabase call data"""
    
    def __init__(self):
        """Initialize Supabase client"""
        supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            logger.warning("Supabase credentials not found, using mock data")
            self.client = None
        else:
            self.client = create_client(supabase_url, supabase_key)
            logger.info("Connected to Supabase for analytics data")
    
    def get_pilot_call_data(
        self,
        pilot_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Fetch all call data for a pilot period
        
        Args:
            pilot_id: Unique pilot identifier
            start_date: Start of pilot period (defaults to 30 days ago)
            end_date: End of pilot period (defaults to now)
        
        Returns:
            Dictionary with all call data needed for analytics
        """
        if not self.client:
            logger.warning("No Supabase client, returning mock data")
            return self._get_mock_data(pilot_id)
        
        # Default date range
        if not end_date:
            end_date = datetime.now()
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        try:
            # Fetch call logs
            call_logs = self._fetch_call_logs(start_date, end_date)
            
            # Fetch appointments/bookings
            appointments = self._fetch_appointments(start_date, end_date)
            
            # Fetch AI demo call logs (if available)
            ai_demo_logs = self._fetch_ai_demo_logs(start_date, end_date)
            
            # Combine and structure data
            return self._structure_pilot_data(
                pilot_id=pilot_id,
                call_logs=call_logs,
                appointments=appointments,
                ai_demo_logs=ai_demo_logs,
                start_date=start_date,
                end_date=end_date
            )
            
        except Exception as e:
            logger.error(f"Error fetching pilot data: {str(e)}")
            return self._get_mock_data(pilot_id)
    
    def _fetch_call_logs(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict]:
        """Fetch call logs from Supabase"""
        try:
            response = self.client.table("call_logs").select("*").gte(
                "created_at", start_date.isoformat()
            ).lte(
                "created_at", end_date.isoformat()
            ).execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error fetching call logs: {str(e)}")
            return []
    
    def _fetch_appointments(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict]:
        """Fetch appointments/bookings from Supabase"""
        try:
            response = self.client.table("appointments").select("*").gte(
                "created_at", start_date.isoformat()
            ).lte(
                "created_at", end_date.isoformat()
            ).execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error fetching appointments: {str(e)}")
            return []
    
    def _fetch_ai_demo_logs(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict]:
        """Fetch AI demo call logs from Supabase"""
        try:
            response = self.client.table("ai_demo_call_logs").select("*").gte(
                "created_at", start_date.isoformat()
            ).lte(
                "created_at", end_date.isoformat()
            ).execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error fetching AI demo logs: {str(e)}")
            return []
    
    def _structure_pilot_data(
        self,
        pilot_id: str,
        call_logs: List[Dict],
        appointments: List[Dict],
        ai_demo_logs: List[Dict],
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Structure raw data into format expected by analytics engines"""
        
        # Combine all call sources
        all_calls = []
        
        # Process call_logs
        for call in call_logs:
            all_calls.append({
                "call_id": call.get("id") or call.get("call_sid"),
                "start_time": self._parse_datetime(call.get("created_at")),
                "end_time": self._parse_datetime(call.get("updated_at")),
                "duration_seconds": call.get("duration", 0),
                "transcript": call.get("transcript", ""),
                "status": call.get("status"),
                "from_number": call.get("from_number"),
                "to_number": call.get("to_number"),
                "answered": call.get("status") == "completed"
            })
        
        # Process AI demo logs
        for call in ai_demo_logs:
            all_calls.append({
                "call_id": call.get("id"),
                "start_time": self._parse_datetime(call.get("call_start_time")),
                "end_time": self._parse_datetime(call.get("call_end_time")),
                "duration_seconds": call.get("call_duration_seconds", 0),
                "transcript": call.get("transcript", ""),
                "status": call.get("call_status"),
                "answered": call.get("call_status") == "completed"
            })
        
        # Calculate metrics
        total_calls = len(all_calls)
        calls_answered = len([c for c in all_calls if c.get("answered")])
        
        # Extract calls with transcripts for intent classification
        calls_with_transcripts = [
            {
                "call_id": call["call_id"],
                "transcript": call["transcript"]
            }
            for call in all_calls
            if call.get("transcript")
        ]
        
        # Extract call events for capacity analysis
        call_events = [
            {
                "call_id": call["call_id"],
                "start_time": call["start_time"],
                "end_time": call["end_time"],
                "duration_seconds": call["duration_seconds"]
            }
            for call in all_calls
            if call.get("start_time") and call.get("end_time")
        ]
        
        # Extract latency measurements (if available in call metadata)
        latency_measurements = []
        for call in all_calls:
            call_id = call["call_id"]
            # Add answer latency if available
            latency_measurements.append({
                "metric_type": "answer_latency",
                "value_ms": 200,  # Default, should extract from call metadata
                "call_id": call_id,
                "time_of_day": call["start_time"].hour if call.get("start_time") else 12
            })
        
        # Count bookings
        bookings_created = len(appointments)
        
        # Calculate average booking delay
        booking_delays = []
        for appt in appointments:
            created = self._parse_datetime(appt.get("created_at"))
            scheduled = self._parse_datetime(appt.get("scheduled_time"))
            if created and scheduled:
                delay_hours = (scheduled - created).total_seconds() / 3600
                booking_delays.append(delay_hours)
        
        avg_booking_delay = sum(booking_delays) / len(booking_delays) if booking_delays else 24.0
        
        return {
            "pilot_id": pilot_id,
            "customer_name": "Real Customer",  # Should be passed in or fetched
            "start_date": start_date,
            "end_date": end_date,
            "total_calls": total_calls,
            "calls_answered": calls_answered,
            "calls_with_transcripts": calls_with_transcripts,
            "call_events": call_events,
            "bookings_created": bookings_created,
            "average_booking_delay_minutes": avg_booking_delay * 60,
            "latency_measurements": latency_measurements,
            "declared_capacity": 3,  # Should be configured per pilot
            "average_ticket_value": 450,  # Should be configured per pilot
        }
    
    def _parse_datetime(self, dt_str: Any) -> Optional[datetime]:
        """Parse datetime string to datetime object"""
        if not dt_str:
            return None
        
        if isinstance(dt_str, datetime):
            return dt_str
        
        try:
            # Try ISO format
            return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        except:
            try:
                # Try common formats
                return datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
            except:
                logger.warning(f"Could not parse datetime: {dt_str}")
                return None
    
    def _get_mock_data(self, pilot_id: str) -> Dict[str, Any]:
        """Return mock data when Supabase is not available"""
        logger.info("Using mock data for pilot analytics")
        
        base_time = datetime.now() - timedelta(days=15)
        
        return {
            "pilot_id": pilot_id,
            "customer_name": "Mock Customer (No Real Data)",
            "start_date": base_time,
            "end_date": datetime.now(),
            "total_calls": 127,
            "calls_answered": 127,
            "calls_with_transcripts": [
                {"call_id": "mock_001", "transcript": "My AC stopped working, it's an emergency!"},
                {"call_id": "mock_002", "transcript": "I need to schedule maintenance for next week"},
            ],
            "call_events": [
                {
                    "call_id": "mock_001",
                    "start_time": base_time,
                    "end_time": base_time + timedelta(minutes=5),
                    "duration_seconds": 300
                }
            ],
            "bookings_created": 34,
            "average_booking_delay_minutes": 3.2,
            "latency_measurements": [
                {"metric_type": "answer_latency", "value_ms": 205, "call_id": "mock_001", "time_of_day": 10},
                {"metric_type": "speech_to_response", "value_ms": 290, "call_id": "mock_001", "time_of_day": 10},
            ],
            "declared_capacity": 3,
            "average_ticket_value": 450,
        }


# Convenience function for easy import
def get_pilot_data(pilot_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Fetch pilot data for analytics
    
    Args:
        pilot_id: Unique pilot identifier
        start_date: Start of pilot period
        end_date: End of pilot period
    
    Returns:
        Structured pilot data for analytics engines
    """
    connector = AnalyticsDataConnector()
    return connector.get_pilot_call_data(pilot_id, start_date, end_date)
