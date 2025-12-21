"""
Script to set up Google Calendar API access.

This script will guide you through the OAuth2 flow to generate the necessary credentials
for accessing the Google Calendar API.
"""
import os
import sys
import json
from pathlib import Path
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# If modifying these scopes, delete the token.json file
SCOPES = ['https://www.googleapis.com/auth/calendar']

def main():
    """Run the Google Calendar setup."""
    # Create config directory if it doesn't exist
    config_dir = Path("config")
    config_dir.mkdir(exist_ok=True)
    
    credentials_path = config_dir / "credentials.json"
    token_path = config_dir / "token.json"
    
    # Check if credentials file exists
    if not credentials_path.exists():
        print("\n=== Google Calendar Setup ===")
        print("To use Google Calendar integration, you need to set up OAuth 2.0 credentials:")
        print("1. Go to https://console.cloud.google.com/")
        print("2. Create a new project or select an existing one")
        print("3. Enable the Google Calendar API")
        print("4. Create OAuth 2.0 credentials (Desktop app)")
        print("5. Download the credentials JSON file")
        print("6. Save it as 'config/credentials.json'")
        print("\nOnce you've saved the credentials file, run this script again.")
        return
    
    creds = None
    
    # Load existing token if it exists
    if token_path.exists():
        try:
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        except Exception as e:
            print(f"Error loading existing token: {e}")
    
    # If there are no (valid) credentials available, let the user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                print("Successfully refreshed token!")
            except Exception as e:
                print(f"Error refreshing token: {e}")
                creds = None
        
        if not creds:
            try:
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(credentials_path), SCOPES)
                creds = flow.run_local_server(port=0)
                
                # Save the credentials for the next run
                with open(token_path, 'w') as token:
                    token.write(creds.to_json())
                print("\nSuccessfully authenticated with Google Calendar!")
                print(f"Token saved to: {token_path}")
                
            except Exception as e:
                print(f"Error during authentication: {e}")
                return
    
    # Test the credentials by listing calendars
    try:
        from googleapiclient.discovery import build
        service = build('calendar', 'v3', credentials=creds)
        calendar = service.calendars().get(calendarId='primary').execute()
        
        print("\n=== Google Calendar Setup Complete! ===")
        print(f"Successfully connected to calendar: {calendar['summary']}")
        print("\nYou can now use Google Calendar integration in your HVAC Service Call Agent.")
        
    except Exception as e:
        print(f"\nError testing calendar access: {e}")
        print("Please check your credentials and try again.")
        # Remove the invalid token file
        if token_path.exists():
            token_path.unlink()
            print("Invalid token has been removed. Please run this script again.")

if __name__ == '__main__':
    main()
