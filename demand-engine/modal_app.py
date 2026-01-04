"""
Modal deployment configuration for Demand Engine API.

Deploy with: modal deploy modal_app.py

This deploys the FastAPI backend for calculator, PDF generation, CRM, and admin services.
"""

import modal

# Force cache invalidation
_CACHE_BUSTER = "v1.0.0-demand-engine"

# Define the Modal image with dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "fastapi>=0.109.0",
        "uvicorn[standard]>=0.27.0",
        "python-dotenv>=1.0.0",
        "python-multipart>=0.0.6",
        "openai>=1.50.0",
        "pydantic>=2.7.0",
        "sqlalchemy>=2.0.0",
        "psycopg2-binary>=2.9.0",
        "httpx>=0.27.0",
        "aiohttp>=3.9.0",
        "twilio>=8.0.0",
        "supabase>=2.3.4",
        "stripe>=7.0.0",
        "resend>=0.7.0",
        "jinja2>=3.1.0",
        "weasyprint>=60.0",
        "pillow>=10.0.0",
        "email-validator>=2.0.0",
    )
    .apt_install("libpango-1.0-0", "libpangoft2-1.0-0", "libharfbuzz0b")  # For WeasyPrint PDF generation
)

# Create Modal app
app = modal.App("kestrel-demand-engine", image=image)


@app.function(
    secrets=[
        modal.Secret.from_name("hvac-agent-secrets"),  # Reuse existing HVAC agent secrets
    ],
    scaledown_window=300,
    timeout=300,
)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def fastapi_app():
    """
    ASGI app entry point for Modal.
    
    All secrets are shared via 'shared-secrets' in Modal dashboard:
    - DATABASE_URL (Supabase connection string)
    - OPENAI_API_KEY
    - TWILIO_ACCOUNT_SID
    - TWILIO_AUTH_TOKEN
    - STRIPE_SECRET_KEY
    - STRIPE_WEBHOOK_SECRET
    - STRIPE_PUBLISHABLE_KEY
    """
    import sys
    sys.path.insert(0, '/root')
    
    from app import app as fastapi_application
    return fastapi_application


# Local development entry point
if __name__ == "__main__":
    modal.runner.deploy_app(app)
