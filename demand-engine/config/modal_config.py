"""
Modal configuration for serverless scrapers
"""
import modal

# Create Modal app
app = modal.App("demand-engine-scrapers")

# Define image with dependencies
scraper_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "praw==7.7.1",
        "httpx==0.26.0",
        "beautifulsoup4==4.12.3",
        "lxml==5.1.0",
        "supabase==2.3.4",
        "openai==1.12.0",
        "python-dotenv==1.0.0",
        "tenacity==8.2.3",
    )
)

# Secrets for Modal (set via Modal dashboard)
secrets = [
    modal.Secret.from_name("hvac-agent-secrets"),  # Reuse existing HVAC agent secrets
]

# Volume for caching (optional)
cache_volume = modal.Volume.from_name("scraper-cache", create_if_missing=True)

# IP Rotation Configuration
# Decision: NO IP rotation for Phase 1
# Reasons:
# 1. Reddit API: Official API, no rotation needed
# 2. State licensing boards: Public data, rate-limited requests sufficient
# 3. Building permits: Municipal APIs where available
# 4. Cost: Rotating proxies add $50-100/month (Bright Data, ScraperAPI)
# 5. Complexity: Adds failure points and debugging overhead
#
# Facebook scraping: REMOVED entirely (ToS violation)
#
# Future consideration: Add IP rotation only if specific scrapers get blocked

IP_ROTATION_ENABLED = False
PROXY_PROVIDER = None  # Options: "brightdata", "scraperapi", None

# Rate limiting configuration (respectful scraping)
RATE_LIMITS = {
    "reddit": {
        "requests_per_minute": 60,  # Reddit API limit
        "concurrent_requests": 1,
    },
    "licensing": {
        "requests_per_minute": 10,  # Conservative for state sites
        "concurrent_requests": 2,
        "delay_between_requests": 6,  # seconds
    },
    "permits": {
        "requests_per_minute": 10,
        "concurrent_requests": 2,
        "delay_between_requests": 6,
    },
    "jobboards": {
        "requests_per_minute": 20,
        "concurrent_requests": 3,
        "delay_between_requests": 3,
    },
}

# User agents for respectful scraping
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
]

# Retry configuration
RETRY_CONFIG = {
    "max_attempts": 3,
    "initial_delay": 1,  # seconds
    "max_delay": 60,
    "exponential_base": 2,
}
