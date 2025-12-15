"""
Modal deployment configuration for HVAC Voice Agent.

Deploy with: modal deploy modal_app.py

Modal provides serverless deployment with:
- Auto-scaling
- GPU support (if needed)
- Easy secrets management
- WebSocket support
"""

import modal

# Define the Modal image with dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "fastapi>=0.109.0",
        "uvicorn[standard]>=0.27.0",
        "python-dotenv>=1.0.0",
        "openai>=1.50.0",
        "pydantic>=2.7.0",
        "sqlalchemy>=2.0.0",
        "websockets>=12.0",
        "httpx>=0.27.0",
        "psycopg2-binary>=2.9.9",
        "python-multipart==0.0.20",
        "twilio==9.8.8",
    )
    .add_local_dir("app", remote_path="/root/app")
)

# Create Modal app
app = modal.App("hvac-voice-agent", image=image)


@app.function(
    secrets=[modal.Secret.from_name("hvac-agent-secrets")],
    scaledown_window=300,
    
)
@modal.asgi_app()
def fastapi_app():
    """
    ASGI app entry point for Modal.
    
    Secrets should be configured in Modal dashboard with:
    - OPENAI_API_KEY
    - DATABASE_URL (optional, defaults to SQLite)
    - HVAC_COMPANY_NAME (optional)
    """
    from app.main import app
    return app


# Local development entry point
if __name__ == "__main__":
    # For local testing
    modal.runner.deploy_app(app)
