"""
Main FastAPI Application for Demand Engine
Includes calculator and PDF generation services
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from middleware.rate_limiter import rate_limit_middleware
from middleware.request_id import RequestIDMiddleware

from calculator.api import router as calculator_router
from pdf_generator.router import router as pdf_router
from admin.api import router as admin_router
from admin.signals_api import router as signals_router
from admin.conversion_api import router as conversion_router
from admin.analytics_api import router as analytics_router
from crm.contacts_api import router as contacts_router
from crm.activities_api import router as activities_router
from crm.tasks_api import router as tasks_router
from crm.pipeline_api import router as pipeline_router
from crm.email_marketing_api import router as email_marketing_router
from crm.scrapers_api import router as scrapers_router
from routers.admin_tenants import router as tenants_router
from routers.ai_guru import router as ai_guru_router
from routers.twilio_provisioning import router as twilio_router
from routers.daily_video import router as video_router
from routers.ai_demo_meetings import router as ai_demo_router
from routers.click_to_call import router as click_to_call_router
from routers.integrations import router as integrations_router
from routers.call_workflow import router as call_workflow_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Kestrel Demand Engine API",
    description="Calculator and PDF generation services for HVAC AI Call Agent",
    version="2.0.0"
)

# Request ID middleware (first)
app.add_middleware(RequestIDMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://hvacaiagent.frontofai.com",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware (after CORS)
app.middleware("http")(rate_limit_middleware)

# Include routers
app.include_router(calculator_router, prefix="/api")
app.include_router(pdf_router)
app.include_router(admin_router)
app.include_router(signals_router)
app.include_router(conversion_router)
app.include_router(analytics_router)
app.include_router(contacts_router)
app.include_router(activities_router)
app.include_router(tasks_router)
app.include_router(pipeline_router)
app.include_router(email_marketing_router)
app.include_router(scrapers_router)
# New routers for multi-tenant, video, and AI features
app.include_router(tenants_router)
app.include_router(ai_guru_router)
app.include_router(twilio_router)
app.include_router(video_router)
app.include_router(ai_demo_router)
app.include_router(click_to_call_router)
app.include_router(integrations_router)
app.include_router(call_workflow_router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Kestrel Demand Engine",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "calculator": "/api/calculator",
            "pdf": "/api/pdf",
            "admin": "/api/admin",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "calculator": "operational",
            "pdf_generation": "operational",
            "admin": "operational"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
