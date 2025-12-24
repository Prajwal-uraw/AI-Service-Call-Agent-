"""
Scraped Leads API
Provides access to leads from scraping operations
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scraped-leads", tags=["scraped-leads"])


@router.get("")
async def get_scraped_leads(
    limit: int = Query(50, ge=1, le=200),
    status: str = Query("new", description="Filter by status: new, contacted, converted"),
    priority: Optional[str] = Query(None, description="Filter by priority: high, medium, low")
):
    """
    Get scraped leads from various sources (Reddit, Google Maps, etc.)
    Auto-refreshes to show new leads as they come in
    """
    try:
        # Mock data - will integrate with actual scraping results
        mock_leads = [
            {
                "id": "lead_001",
                "name": "John's HVAC Service",
                "phone": "+1 (555) 234-5678",
                "email": "john@hvacservice.com",
                "location": "Austin, TX",
                "source": "Reddit - r/HVAC",
                "priority": "high",
                "created_at": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
                "notes": "Posted about needing emergency AC repair service"
            },
            {
                "id": "lead_002",
                "name": "Sarah's Home Comfort",
                "phone": "+1 (555) 345-6789",
                "email": "sarah@homecomfort.com",
                "location": "Dallas, TX",
                "source": "Google Maps",
                "priority": "high",
                "created_at": (datetime.utcnow() - timedelta(minutes=12)).isoformat(),
                "notes": "Looking for maintenance contract quotes"
            },
            {
                "id": "lead_003",
                "name": "Mike's Cooling Solutions",
                "phone": "+1 (555) 456-7890",
                "location": "Houston, TX",
                "source": "Reddit - r/HomeImprovement",
                "priority": "medium",
                "created_at": (datetime.utcnow() - timedelta(minutes=25)).isoformat(),
                "notes": "Asked about AC installation costs"
            },
            {
                "id": "lead_004",
                "name": "Lisa's Property Management",
                "phone": "+1 (555) 567-8901",
                "email": "lisa@propertymanage.com",
                "location": "San Antonio, TX",
                "source": "Google Maps",
                "priority": "high",
                "created_at": (datetime.utcnow() - timedelta(minutes=35)).isoformat(),
                "notes": "Managing 50+ properties, needs bulk service contract"
            },
            {
                "id": "lead_005",
                "name": "Tom's Heating & Air",
                "phone": "+1 (555) 678-9012",
                "location": "Fort Worth, TX",
                "source": "Reddit - r/HVAC",
                "priority": "medium",
                "created_at": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                "notes": "Interested in preventive maintenance plans"
            },
            {
                "id": "lead_006",
                "name": "Jennifer's Home Services",
                "phone": "+1 (555) 789-0123",
                "email": "jen@homeservices.com",
                "location": "Plano, TX",
                "source": "Google Maps",
                "priority": "low",
                "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "notes": "General inquiry about services"
            },
            {
                "id": "lead_007",
                "name": "Robert's Commercial HVAC",
                "phone": "+1 (555) 890-1234",
                "location": "Arlington, TX",
                "source": "Reddit - r/CommercialHVAC",
                "priority": "high",
                "created_at": (datetime.utcnow() - timedelta(hours=3)).isoformat(),
                "notes": "Commercial building needs immediate service"
            },
            {
                "id": "lead_008",
                "name": "Emily's Comfort Solutions",
                "phone": "+1 (555) 901-2345",
                "email": "emily@comfortsolutions.com",
                "location": "Irving, TX",
                "source": "Google Maps",
                "priority": "medium",
                "created_at": (datetime.utcnow() - timedelta(hours=4)).isoformat(),
                "notes": "Looking for energy-efficient AC options"
            }
        ]
        
        # Filter by priority if specified
        if priority:
            mock_leads = [lead for lead in mock_leads if lead["priority"] == priority]
        
        # Limit results
        mock_leads = mock_leads[:limit]
        
        return {
            "leads": mock_leads,
            "total": len(mock_leads),
            "status": status,
            "priority_filter": priority
        }
        
    except Exception as e:
        logger.error(f"Error fetching scraped leads: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch leads: {str(e)}"
        )


@router.get("/{lead_id}")
async def get_lead_details(lead_id: str):
    """
    Get detailed information about a specific lead
    """
    try:
        # Mock data - will integrate with actual database
        lead_details = {
            "id": lead_id,
            "name": "John's HVAC Service",
            "phone": "+1 (555) 234-5678",
            "email": "john@hvacservice.com",
            "location": "Austin, TX",
            "source": "Reddit - r/HVAC",
            "priority": "high",
            "created_at": datetime.utcnow().isoformat(),
            "notes": "Posted about needing emergency AC repair service",
            "history": [
                {
                    "action": "Lead captured",
                    "timestamp": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
                    "details": "Scraped from Reddit post"
                }
            ],
            "metadata": {
                "post_url": "https://reddit.com/r/HVAC/comments/example",
                "sentiment": "urgent",
                "keywords": ["emergency", "AC repair", "not cooling"]
            }
        }
        
        return lead_details
        
    except Exception as e:
        logger.error(f"Error fetching lead details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch lead details: {str(e)}"
        )


@router.post("/{lead_id}/contact")
async def mark_lead_contacted(lead_id: str, notes: Optional[str] = None):
    """
    Mark a lead as contacted
    """
    try:
        # TODO: Update lead status in database
        return {
            "success": True,
            "lead_id": lead_id,
            "status": "contacted",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error marking lead as contacted: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update lead: {str(e)}"
        )
