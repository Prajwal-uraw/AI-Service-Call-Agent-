from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "HVAC Service Call Agent"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "standard")
    
    # Database
    SQL_ECHO: bool = os.getenv("SQL_ECHO", "false").lower() == "true"
    
    # Google Calendar
    GOOGLE_CREDENTIALS_PATH: str = os.getenv("GOOGLE_CREDENTIALS_PATH", "config/credentials.json")
    GOOGLE_TOKEN_PATH: str = os.getenv("GOOGLE_TOKEN_PATH", "config/token.json")
    GOOGLE_CALENDAR_ID: str = os.getenv("GOOGLE_CALENDAR_ID", "")
    
    # Application settings
    MAX_TOOL_CALLS: int = int(os.getenv("MAX_TOOL_CALLS", "5"))
    
    # ElevenLabs (if used)
    ELEVENLABS_API_KEY: Optional[str] = os.getenv("ELEVENLABS_API_KEY")
    ELEVENLABS_VOICE_ID: Optional[str] = os.getenv("ELEVENLABS_VOICE_ID")
    USE_ELEVENLABS: bool = os.getenv("USE_ELEVENLABS", "false").lower() == "true"
    STREAM_WEBSOCKET_URL: Optional[str] = os.getenv("STREAM_WEBSOCKET_URL")
    DEFAULT_VOICE_TONE: str = os.getenv("DEFAULT_VOICE_TONE", "friendly")

# Create settings instance
settings = Settings()