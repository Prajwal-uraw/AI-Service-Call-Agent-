"""Configuration module for Demand Engine."""

from .modal_config import app, scraper_image, secrets
from .supabase_config import get_supabase, SupabaseClient, Tables

__all__ = [
    "app",
    "scraper_image", 
    "secrets",
    "get_supabase",
    "SupabaseClient",
    "Tables",
]
