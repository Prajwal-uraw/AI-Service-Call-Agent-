"""
Test script for Google Calendar integration.

This script tests the Google Calendar service by creating a test event.
"""
import os
import sys
from datetime import datetime, timedelta
import json

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import directly from the module
from app.services.google_calendar_service import GoogleCalendarService

def load_settings():
    """Load settings from environment variables or .env file."""
    from dotenv import load_dotenv
    load_dotenv()
    
    return {
        'GOOGLE_CREDENTIALS_PATH': os.getenv('GOOGLE_CREDENTIALS_PATH', 'config/credentials.json'),
        'GOOGLE_TOKEN_PATH': os.getenv('GOOGLE_TOKEN_PATH', 'config/token.json'),
        'GOOGLE_CALENDAR_ID': os.getenv('GOOGLE_CALENDAR_ID', 'primary')
    }

def test_google_calendar():
    """Test Google Calendar integration."""
    print("\n=== Testing Google Calendar Integration ===")
    
    # Load settings
    settings = load_settings()
    print("\nSettings:")
    print(f"Credentials: {settings['GOOGLE_CREDENTIALS_PATH']}")
    print(f"Token: {settings['GOOGLE_TOKEN_PATH']}")
    print(f"Calendar ID: {settings['GOOGLE_CALENDAR_ID']}")
    
    # Initialize the service
    print("\n1. Initializing Google Calendar service...")
    try:
        service = GoogleCalendarService(
            credentials_path=settings['GOOGLE_CREDENTIALS_PATH'],
            token_path=settings['GOOGLE_TOKEN_PATH']
        )
        
        if not service.service:
            print("❌ Failed to initialize Google Calendar service")
            return False
        
        print("✅ Successfully initialized Google Calendar service")
        
        # Test creating an event
        print("\n2. Testing event creation...")
        start_time = datetime.utcnow() + timedelta(days=1)
        end_time = start_time + timedelta(hours=1)
        
        event = {
            'summary': 'Test HVAC Appointment',
            'description': 'This is a test appointment for HVAC service',
            'start': {
                'dateTime': start_time.isoformat() + 'Z',  # 'Z' indicates UTC time
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat() + 'Z',
                'timeZone': 'UTC',
            },
            'attendees': [
                {'email': 'test@example.com'},
            ],
        }
        
        created_event = service.create_event(settings['GOOGLE_CALENDAR_ID'], event)
        
        if created_event:
            print("✅ Successfully created event:")
            print(f"   Event ID: {created_event.get('id')}")
            print(f"   HTML Link: {created_event.get('htmlLink')}")
            
            # Clean up: Delete the test event
            try:
                print("\n3. Cleaning up test event...")
                service.delete_event(settings['GOOGLE_CALENDAR_ID'], created_event['id'])
                print("✅ Test event deleted successfully")
            except Exception as e:
                print(f"⚠️  Warning: Could not delete test event: {e}")
                print("   You may need to delete it manually from your calendar.")
            
            return True
        else:
            print("❌ Failed to create event")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_google_calendar()