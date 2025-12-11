"""
Database connection and initialization service.

Supports SQLite (development) and PostgreSQL (production).
"""

import os
from typing import Generator

from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.db_models import Base, Location
from app.utils.logging import get_logger

logger = get_logger("db")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hvac_agent.db")

# Handle different database backends
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Verify connections before use
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error("Database error: %s", str(e))
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database tables and seed demo data.
    
    Creates all tables and seeds default locations if none exist.
    """
    logger.info("Initializing database...")
    
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except SQLAlchemyError as e:
        logger.error("Failed to create database tables: %s", str(e))
        raise

    db = SessionLocal()
    try:
        # Check if locations exist
        try:
            count = db.scalar(select(Location).limit(1))
            has_locations = count is not None
        except Exception:
            has_locations = False

        if not has_locations:
            logger.info("Seeding demo locations...")
            demo_locations = [
                Location(
                    name="Dallas",
                    code="DAL",
                    timezone="America/Chicago",
                    address="123 Main St, Dallas, TX 75201",
                    phone="(214) 555-0100",
                    emergency_phone="(214) 555-0911",
                    opening_hour=7,
                    closing_hour=19,
                ),
                Location(
                    name="Fort Worth",
                    code="FTW",
                    timezone="America/Chicago",
                    address="456 Oak Ave, Fort Worth, TX 76102",
                    phone="(817) 555-0100",
                    emergency_phone="(817) 555-0911",
                    opening_hour=7,
                    closing_hour=19,
                ),
                Location(
                    name="Arlington",
                    code="ARL",
                    timezone="America/Chicago",
                    address="789 Center Blvd, Arlington, TX 76010",
                    phone="(682) 555-0100",
                    emergency_phone="(682) 555-0911",
                    opening_hour=8,
                    closing_hour=18,
                ),
            ]
            db.add_all(demo_locations)
            db.commit()
            logger.info("Demo locations seeded: %d locations", len(demo_locations))
        else:
            logger.info("Locations already exist, skipping seed")
            
    except SQLAlchemyError as e:
        logger.error("Failed to seed demo data: %s", str(e))
        db.rollback()
    finally:
        db.close()


def check_db_health() -> dict:
    """
    Check database connectivity and health.
    
    Returns:
        dict: Health status with connection info
    """
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {
            "status": "healthy",
            "database": DATABASE_URL.split("://")[0],
            "message": "Database connection successful"
        }
    except Exception as e:
        logger.error("Database health check failed: %s", str(e))
        return {
            "status": "unhealthy",
            "database": DATABASE_URL.split("://")[0],
            "message": str(e)
        }
