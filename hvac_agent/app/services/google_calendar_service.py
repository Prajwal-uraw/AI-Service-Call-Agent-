"""
Google Calendar integration service for HVAC appointments.

Handles synchronization of appointments between the HVAC system and Google Calendar.
"""
import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.utils.logging import get_logger

logger = get_logger("google_calendar")

# If modifying these scopes, delete the token.json file
SCOPES = ['https://www.googleapis.com/auth/calendar']

class GoogleCalendarService:
    """Service for interacting with Google Calendar API."""
    
    def __init__(self, credentials_path: str = 'config/credentials.json', 
                 token_path: str = 'config/token.json'):
        """Initialize the Google Calendar service.
        
        Args:
            credentials_path: Path to the OAuth 2.0 credentials file
            token_path: Path to store the user's access and refresh tokens
        """
        self.credentials_path = credentials_path
        self.token_path = token_path
        self.service = self._get_calendar_service()
    
    def _get_calendar_service(self):
        """Get an authorized Google Calendar API service instance.
        
        Returns:
            A Google Calendar API service instance or None if initialization fails.
        """
        try:
            if not os.path.exists(self.credentials_path):
                logger.error(f"Credentials file not found at: {self.credentials_path}")
                return None
                
            creds = None
            
            # The file token.json stores the user's access and refresh tokens
            if os.path.exists(self.token_path):
                try:
                    creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
                    logger.info("Successfully loaded credentials from token file")
                except Exception as e:
                    logger.error(f"Error loading credentials from token file: {e}")
                    # Remove the invalid token file to force re-authentication
                    os.unlink(self.token_path)
                    return None
            
            # If there are no (valid) credentials available, let the user log in
            if not creds or not creds.valid:
                logger.info("No valid credentials found, attempting to refresh or get new credentials")
                if creds and creds.expired and creds.refresh_token:
                    try:
                        logger.info("Refreshing expired credentials")
                        creds.refresh(Request())
                        logger.info("Successfully refreshed credentials")
                    except Exception as e:
                        logger.error(f"Error refreshing credentials: {e}")
                        # If refresh fails, we'll need to get new credentials
                        creds = None
                
                if not creds:
                    try:
                        logger.info("Starting OAuth flow to get new credentials")
                        flow = InstalledAppFlow.from_client_secrets_file(
                            self.credentials_path, SCOPES)
                        creds = flow.run_local_server(port=0)
                        logger.info("Successfully obtained new credentials")
                    except Exception as e:
                        logger.error(f"Error during OAuth flow: {e}")
                        return None
                
                # Save the credentials for the next run
                try:
                    with open(self.token_path, 'w') as token:
                        token.write(creds.to_json())
                    logger.info(f"Saved credentials to {self.token_path}")
                except Exception as e:
                    logger.error(f"Error saving credentials: {e}")
                    # Continue even if we can't save the token
            
            logger.info("Building Google Calendar service")
            service = build('calendar', 'v3', 
                          credentials=creds,
                          cache_discovery=False)  # Avoids a warning
            
            # Test the service by making a simple API call
            try:
                service.calendars().get(calendarId='primary').execute()
                logger.info("Successfully connected to Google Calendar API")
                return service
            except Exception as e:
                logger.error(f"Failed to connect to Google Calendar API: {e}")
                return None
                
        except Exception as e:
            logger.error(f"Unexpected error initializing Google Calendar service: {e}", exc_info=True)
            return None
    
    def create_event(self, calendar_id: str, event_data: Dict[str, Any]) -> Optional[Dict]:
        """Create a new calendar event.
        
        Args:
            calendar_id: ID of the calendar to add the event to
            event_data: Dictionary containing event details
                {
                    'summary': str,
                    'description': str,
                    'start': {'dateTime': '2023-01-01T09:00:00', 'timeZone': 'America/Chicago'},
                    'end': {'dateTime': '2023-01-01T10:00:00', 'timeZone': 'America/Chicago'},
                    'attendees': [{'email': 'customer@example.com'}],
                    'reminders': {
                        'useDefault': False,
                        'overrides': [
                            {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                            {'method': 'popup', 'minutes': 30},       # 30 min before
                        ],
                    },
                }
                
        Returns:
            The created event data or None if failed
        """
        try:
            logger.info(f"Attempting to create event in calendar: {calendar_id}")
            logger.debug(f"Event data: {event_data}")
            
            # Validate required fields
            required_fields = ['summary', 'start', 'end']
            for field in required_fields:
                if field not in event_data:
                    logger.error(f"Missing required field in event data: {field}")
                    return None
            
            # Ensure timeZone is set
            for time_field in ['start', 'end']:
                if 'timeZone' not in event_data[time_field]:
                    event_data[time_field]['timeZone'] = 'America/Chicago'
                    logger.warning(f"No timeZone specified for {time_field}, defaulting to America/Chicago")
            
            # Create the event
            event = self.service.events().insert(
                calendarId=calendar_id,
                body=event_data,
                sendUpdates='all'
            ).execute()
            
            logger.info(f"Successfully created event: {event.get('htmlLink')}")
            logger.debug(f"Full event data: {event}")
            return event
                
        except HttpError as error:
            # More detailed error logging
            error_details = error.content.decode('utf-8') if hasattr(error, 'content') else str(error)
            logger.error(f"HTTP Error creating Google Calendar event: {error}")
            logger.error(f"Error details: {error_details}")
            logger.error(f"Status code: {getattr(error, 'status_code', 'N/A')}")
            logger.error(f"URL: {getattr(error, 'uri', 'N/A')}")
            return None
        except Exception as error:
            logger.error(f"Unexpected error creating Google Calendar event: {error}", exc_info=True)
            return None
    
    def update_event(self, calendar_id: str, event_id: str, event_data: Dict[str, Any]) -> Optional[Dict]:
        """Update an existing calendar event."""
        try:
            event = self.service.events().update(
                calendarId=calendar_id,
                eventId=event_id,
                body=event_data,
                sendUpdates='all'
            ).execute()
            
            logger.info(f"Event updated: {event.get('htmlLink')}")
            return event
            
        except HttpError as error:
            logger.error(f"Error updating Google Calendar event: {error}")
            return None
    
    def delete_event(self, calendar_id: str, event_id: str) -> bool:
        """Delete a calendar event."""
        try:
            self.service.events().delete(
                calendarId=calendar_id,
                eventId=event_id,
                sendUpdates='all'
            ).execute()
            
            logger.info(f"Event {event_id} deleted successfully")
            return True
            
        except HttpError as error:
            logger.error(f"Error deleting Google Calendar event: {error}")
            return False
    
    def get_available_slots(self, calendar_id: str, time_min: str, time_max: str, 
                          time_zone: str = 'America/Chicago') -> List[Dict]:
        """Get available time slots from Google Calendar.
        
        Args:
            calendar_id: ID of the calendar to check
            time_min: Start of time range in RFC3339 format (e.g., '2023-01-01T09:00:00-06:00')
            time_max: End of time range in RFC3339 format
            time_zone: Time zone for the time range
            
        Returns:
            List of available time slots
        """
        try:
            # Get busy intervals
            body = {
                "timeMin": time_min,
                "timeMax": time_max,
                "timeZone": time_zone,
                "items": [{"id": calendar_id}]
            }
            
            events_result = self.service.freebusy().query(body=body).execute()
            
            # Process busy intervals to find available slots
            busy = events_result.get('calendars', {}).get(calendar_id, {}).get('busy', [])
            
            # Convert to datetime objects for easier manipulation
            from dateutil import parser
            
            busy_slots = []
            for slot in busy:
                start = parser.parse(slot['start'])
                end = parser.parse(slot['end'])
                busy_slots.append((start, end))
            
            # Sort by start time
            busy_slots.sort()
            
            # Find available slots (gaps between busy slots)
            available_slots = []
            time_min_dt = parser.parse(time_min)
            time_max_dt = parser.parse(time_max)
            
            # If no busy slots, the whole period is available
            if not busy_slots:
                return [{
                    'start': time_min,
                    'end': time_max
                }]
            
            # Check before first busy slot
            first_busy_start = busy_slots[0][0]
            if time_min_dt < first_busy_start:
                available_slots.append({
                    'start': time_min_dt.isoformat(),
                    'end': first_busy_start.isoformat()
                })
            
            # Check between busy slots
            for i in range(len(busy_slots) - 1):
                current_end = busy_slots[i][1]
                next_start = busy_slots[i + 1][0]
                
                if current_end < next_start:
                    available_slots.append({
                        'start': current_end.isoformat(),
                        'end': next_start.isoformat()
                    })
            
            # Check after last busy slot
            last_busy_end = busy_slots[-1][1]
            if last_busy_end < time_max_dt:
                available_slots.append({
                    'start': last_busy_end.isoformat(),
                    'end': time_max_dt.isoformat()
                })
            
            return available_slots
            
        except HttpError as error:
            logger.error(f"Error getting available slots from Google Calendar: {error}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in get_available_slots: {e}")
            return []

# Singleton instance
google_calendar_service = None

def get_google_calendar_service() -> GoogleCalendarService:
    """Get or create a singleton instance of GoogleCalendarService."""
    global google_calendar_service
    if google_calendar_service is None:
        from app.core.config import settings
        credentials_path = settings.GOOGLE_CREDENTIALS_PATH
        token_path = settings.GOOGLE_TOKEN_PATH
        google_calendar_service = GoogleCalendarService(credentials_path, token_path)
    return google_calendar_service
