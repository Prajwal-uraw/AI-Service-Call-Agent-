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
_CACHE_BUSTER = "v2.0.1-queue-based-20231218"

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
        "aiohttp>=3.9.0",  # For ElevenLabs TTS streaming
        "twilio>=8.0.0",  # Twilio SDK for request validation
    )
    .add_local_python_source("app")  # Include the app package
)

# Create Modal app
app = modal.App("hvac-voice-agent", image=image)


@app.function(
    secrets=[
        modal.Secret.from_name("hvac-agent-secrets"),
        modal.Secret.from_name("elevenlabs", required_keys=[]),  # Optional ElevenLabs secret
    ],
    scaledown_window=300,
)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def fastapi_app():
    """
    ASGI app entry point for Modal.
    
    Secrets should be configured in Modal dashboard with:
    - OPENAI_API_KEY
    - DATABASE_URL (optional, defaults to SQLite)
    - HVAC_COMPANY_NAME (optional)
    - ELEVENLABS_API_KEY (optional, for natural voice)
    - ELEVENLABS_VOICE_ID (optional)
    - USE_ELEVENLABS (optional, set to "true" to enable)
    """
    from app.main import app
    return app


# Local development entry point
if __name__ == "__main__":
    # For local testing
    modal.runner.deploy_app(app)
