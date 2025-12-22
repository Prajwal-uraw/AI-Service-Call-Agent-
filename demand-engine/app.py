"""
Main FastAPI Application for Demand Engine
Includes calculator and PDF generation services
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from calculator.api import router as calculator_router
from pdf_generator.router import router as pdf_router
from admin.api import router as admin_router
from admin.signals_api import router as signals_router

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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://hvacaiagent.frontofai.com",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(calculator_router, prefix="/api")
app.include_router(pdf_router)
app.include_router(admin_router)
app.include_router(signals_router)

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
