"""
HVAC Voice Agent - Main FastAPI Application.

Production-ready HVAC AI Voice Agent with:
- Twilio voice integration (turn-based and streaming)
- OpenAI-powered conversation
- Multi-location appointment scheduling
- Emergency detection and routing
- Empathetic, soft-tone responses
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
load_dotenv() 
from app.services.db import init_db, check_db_health
from app.routers import (
    health_router,
    booking_router,
    twilio_voice_router,
    twilio_stream_router,
    twilio_elevenlabs_router,
    twilio_gather_router,
    twilio_realtime_router,
    twilio_ivr_router,
    audio_router,
)
from app.utils.logging import get_logger
from app.utils.error_handler import HVACAgentError
from app.middleware.logging_middleware import log_requests
from app.middleware.twilio_auth_middleware import validate_twilio_request
logger = get_logger("main")


# Configuration
APP_NAME = os.getenv("APP_NAME", "HVAC Voice Agent")
APP_VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "false").lower() == "true"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting %s v%s", APP_NAME, APP_VERSION)
    
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error("Failed to initialize database: %s", str(e))
        raise
    
    # Verify OpenAI API key is configured
    if not os.getenv("OPENAI_API_KEY"):
        logger.warning("OPENAI_API_KEY not configured - agent will not function")
    
    logger.info("%s is ready to accept requests", APP_NAME)
    
    yield
    
    # Shutdown
    logger.info("Shutting down %s", APP_NAME)


# Create FastAPI application
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Production-ready HVAC AI Voice Agent with Twilio and OpenAI integration",
    lifespan=lifespan,
    # docs_url="/docs" if DEBUG else None,
    docs_url="/docs",
    redoc_url="/redoc" if DEBUG else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(validate_twilio_request)
app.middleware("http")(log_requests) # Logging middleware
 
# Global exception handler
@app.exception_handler(HVACAgentError)
async def hvac_error_handler(request: Request, exc: HVACAgentError):
    """Handle HVAC Agent errors."""
    logger.error("HVACAgentError: %s", exc.message)
    return JSONResponse(
        status_code=500,
        content=exc.to_dict(),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.error("Unexpected error: %s", str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again.",
        },
    )


# Include routers
app.include_router(health_router)
app.include_router(booking_router)
app.include_router(twilio_voice_router)
app.include_router(twilio_stream_router)
app.include_router(twilio_elevenlabs_router)
app.include_router(twilio_gather_router)  # Enterprise Gather-based voice agent
app.include_router(twilio_realtime_router)  # OpenAI Realtime API (best latency)
app.include_router(twilio_ivr_router)  # IVR menu to choose system
app.include_router(audio_router)  # Audio serving for ElevenLabs TTS


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "running",
        "endpoints": {
            "health": "/health",
            "twilio_voice": "/twilio/voice",
            "twilio_stream": "/twilio/stream",
            "twilio_elevenlabs_stream": "/twilio/elevenlabs/stream",
            "twilio_gather": "/twilio/gather/incoming",  # Enterprise Gather-based
            "twilio_realtime": "/twilio/realtime/incoming",  # OpenAI Realtime API (BEST - lowest latency)
            "twilio_ivr": "/twilio/ivr/incoming",  # IVR menu - Press 1 for Realtime, 2 for Gather
            "debug_locations": "/debug/locations",
            "debug_appointments": "/debug/appointments",
            "docs": "/docs" if DEBUG else "disabled",
        },
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=DEBUG,
    )
