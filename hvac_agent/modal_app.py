"""
Modal deployment configuration for HVAC Voice Agent.

Deploy with: modal deploy modal_app.py

Modal provides serverless deployment with:
- Auto-scaling
- GPU support (if needed)
- Easy secrets management
- WebSocket support

Deployment version: 2.0.1-queue-based (forces cache invalidation)
"""

import modal

# Force cache invalidation - change this value to force rebuild
_CACHE_BUSTER = "v4.8.0-20241219-please-hold-transcripts"

# Define the Modal image with dependencies and local app source
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg")  # Required for ElevenLabs audio conversion
    .pip_install(
        "fastapi>=0.109.0",
        "uvicorn[standard]>=0.27.0",
        "python-dotenv>=1.0.0",
        "python-multipart>=0.0.6",  # Required for form data (Twilio webhooks)
        "openai>=1.50.0",
        "pydantic>=2.7.0",
        "sqlalchemy>=2.0.0",
        "psycopg2-binary>=2.9.0",  # PostgreSQL driver
        "websockets>=12.0",
        "httpx>=0.27.0",
        "psycopg2-binary>=2.9.9",
        "python-multipart==0.0.20",
        "twilio==9.8.8",
        "aiohttp>=3.9.0",  # For ElevenLabs TTS streaming
        "twilio>=8.0.0",  # Twilio SDK for request validation
        # Phase 1-5 production hardening dependencies
        "redis>=5.0.0",  # Session store backend
        "cachetools>=5.3.0",  # Local TTL cache for session store
        "phonenumbers>=8.13.0",  # Phone number validation
    )
    .add_local_python_source("app")  # Include the app package
)

# Create Modal app
app = modal.App("hvac-voice-agent", image=image)


@app.function(
    secrets=[
        modal.Secret.from_name("hvac-agent-secrets"),  # Shared secret for all services
    ],
    scaledown_window=300,
    # REMOVED min_containers=1 to save ~$72/month
    # Cold start is now handled by TwiML "please hold" message before Stream connects
    # Container scales to zero when idle, caller hears "Thank you for calling, please hold..."
)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def fastapi_app():
    """
    ASGI app entry point for Modal.
    
    All secrets are shared via 'hvac-agent-secrets' in Modal dashboard:
    - OPENAI_API_KEY
    - TWILIO_ACCOUNT_SID
    - TWILIO_AUTH_TOKEN
    - DATABASE_URL
    - SUPABASE_URL
    - SUPABASE_KEY
    - STRIPE_SECRET_KEY
    - STRIPE_WEBHOOK_SECRET
    - STRIPE_PUBLISHABLE_KEY
    - REDDIT_CLIENT_ID
    - REDDIT_CLIENT_SECRET
    - REDDIT_USER_AGENT
    """
    from app.main import app
    return app


# Local development entry point
if __name__ == "__main__":
    # For local testing
    modal.runner.deploy_app(app)
