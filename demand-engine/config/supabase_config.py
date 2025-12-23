"""
Supabase configuration and helper functions
"""
import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class SupabaseClient:
    """Singleton Supabase client"""
    
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client"""
        if cls._instance is None:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_KEY")
            
            if not url or not key:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_KEY must be set in environment"
                )
            
            cls._instance = create_client(url, key)
        
        return cls._instance
    
    @classmethod
    def reset_client(cls):
        """Reset client (useful for testing)"""
        cls._instance = None


def get_supabase() -> Client:
    """Convenience function to get Supabase client"""
    return SupabaseClient.get_client()


# Table names
class Tables:
    LEADS = "leads"
    SIGNALS = "signals"
    CALL_RECORDS = "call_records"
    TRIGGERS = "triggers"
    FOLLOW_UP_EMAILS = "follow_up_emails"
    ENGAGEMENT_TRACKING = "engagement_tracking"
    CALCULATOR_SUBMISSIONS = "calculator_submissions"
    ERROR_LOGS = "error_logs"
