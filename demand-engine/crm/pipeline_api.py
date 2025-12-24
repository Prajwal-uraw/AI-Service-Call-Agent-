"""
CRM Pipeline API
Manage lead pipeline and stages
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.supabase_config import get_supabase

router = APIRouter(prefix="/api/crm/pipeline", tags=["CRM - Pipeline"])

# Models
class StageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    position: Optional[int] = None
    is_active: Optional[bool] = None

class LeadStageUpdate(BaseModel):
    stage_name: str
    notes: Optional[str] = None


@router.get("/stages")
async def get_pipeline_stages():
    """Get all pipeline stages - returns default stages if table doesn't exist"""
    try:
        supabase = get_supabase()
        
        try:
            response = supabase.table("pipeline_stages").select("*").eq("is_active", True).order("position").execute()
            if response.data:
                return response.data
        except Exception as e:
            print(f"pipeline_stages table not found, using defaults: {e}")
        
        # Return default stages if table doesn't exist
        return [
            {"id": "1", "name": "New", "color": "#3B82F6", "position": 1, "is_active": True},
            {"id": "2", "name": "Contacted", "color": "#F59E0B", "position": 2, "is_active": True},
            {"id": "3", "name": "Qualified", "color": "#8B5CF6", "position": 3, "is_active": True},
            {"id": "4", "name": "Proposal", "color": "#EC4899", "position": 4, "is_active": True},
            {"id": "5", "name": "Negotiation", "color": "#F97316", "position": 5, "is_active": True},
            {"id": "6", "name": "Won", "color": "#10B981", "position": 6, "is_active": True},
            {"id": "7", "name": "Lost", "color": "#EF4444", "position": 7, "is_active": True}
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/view")
async def get_pipeline_view(
    stage: Optional[str] = None,
    search: Optional[str] = None
):
    """Get pipeline view with leads grouped by stage - uses signals table as fallback"""
    try:
        supabase = get_supabase()
        
        # Define default stages with colors
        default_stages = {
            "new": {"name": "New", "color": "#3B82F6", "position": 1},
            "contacted": {"name": "Contacted", "color": "#F59E0B", "position": 2},
            "qualified": {"name": "Qualified", "color": "#8B5CF6", "position": 3},
            "proposal": {"name": "Proposal", "color": "#EC4899", "position": 4},
            "negotiation": {"name": "Negotiation", "color": "#F97316", "position": 5},
            "won": {"name": "Won", "color": "#10B981", "position": 6},
            "lost": {"name": "Lost", "color": "#EF4444", "position": 7}
        }
        
        stages_data = {}
        
        # Initialize all stages
        for key, stage_info in default_stages.items():
            stages_data[stage_info["name"]] = {
                "name": stage_info["name"],
                "color": stage_info["color"],
                "position": stage_info["position"],
                "leads": []
            }
        
        # Try to get from lead_pipeline_view first
        try:
            query = supabase.table("lead_pipeline_view").select("*")
            if stage:
                query = query.eq("stage_name", stage)
            if search:
                query = query.or_(f"business_name.ilike.%{search}%,contact_name.ilike.%{search}%,email.ilike.%{search}%")
            
            response = query.order("stage_position").order("lead_score", desc=True).execute()
            
            for lead in response.data or []:
                stage_name = lead.get("stage_name") or "New"
                if stage_name in stages_data:
                    stages_data[stage_name]["leads"].append(lead)
        except Exception as e:
            print(f"lead_pipeline_view not found, using signals: {e}")
        
        # Also get from signals table as leads
        try:
            query = supabase.table("signals").select("*")
            if search:
                query = query.or_(f"business_name.ilike.%{search}%,phone.ilike.%{search}%")
            
            response = query.order("created_at", desc=True).execute()
            
            for signal in response.data or []:
                # Map signal status to pipeline stage
                status = signal.get("status", "new")
                stage_name = default_stages.get(status, default_stages["new"])["name"]
                
                if stage and stage != stage_name:
                    continue
                
                lead = {
                    "id": signal.get("id"),
                    "business_name": signal.get("business_name"),
                    "contact_name": signal.get("business_name"),
                    "email": signal.get("email"),
                    "phone": signal.get("phone"),
                    "lead_score": signal.get("pain_score", 0),
                    "stage_name": stage_name,
                    "city": signal.get("city"),
                    "state": signal.get("state"),
                    "source": signal.get("source"),
                    "created_at": signal.get("created_at")
                }
                stages_data[stage_name]["leads"].append(lead)
        except Exception as e:
            print(f"Error fetching signals for pipeline: {e}")
        
        # Convert to list and sort by position
        pipeline = list(stages_data.values())
        pipeline.sort(key=lambda x: x.get("position", 999))
        
        return pipeline
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads/{lead_id}/move")
async def move_lead_to_stage(lead_id: str, update: LeadStageUpdate):
    """Move lead to different stage"""
    try:
        supabase = get_supabase()
        
        # Convert stage name to status format
        status = update.stage_name.lower().replace(" ", "_")
        
        # Update lead
        response = supabase.table("leads").update({
            "status": status
        }).eq("id", lead_id).execute()
        
        # Create activity
        supabase.table("activities").insert({
            "lead_id": lead_id,
            "activity_type": "status_change",
            "subject": f"Moved to {update.stage_name}",
            "description": update.notes or f"Lead moved to {update.stage_name} stage",
            "created_by": "system"
        }).execute()
        
        return {
            "success": True,
            "lead": response.data[0] if response.data else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_pipeline_stats():
    """Get pipeline statistics"""
    try:
        supabase = get_supabase()
        
        # Get leads by stage
        response = supabase.table("lead_pipeline_view").select("stage_name, lead_score").execute()
        
        stats = {}
        total_value = 0
        
        for lead in response.data or []:
            stage = lead.get("stage_name") or "New"
            if stage not in stats:
                stats[stage] = {
                    "count": 0,
                    "total_score": 0,
                    "avg_score": 0
                }
            
            stats[stage]["count"] += 1
            stats[stage]["total_score"] += lead.get("lead_score", 0)
        
        # Calculate averages
        for stage in stats:
            if stats[stage]["count"] > 0:
                stats[stage]["avg_score"] = round(stats[stage]["total_score"] / stats[stage]["count"], 1)
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/stages/{stage_id}")
async def update_stage(stage_id: str, update: StageUpdate):
    """Update pipeline stage"""
    try:
        supabase = get_supabase()
        
        update_data = {k: v for k, v in update.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        response = supabase.table("pipeline_stages").update(update_data).eq("id", stage_id).execute()
        
        return {
            "success": True,
            "stage": response.data[0] if response.data else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversion-funnel")
async def get_conversion_funnel():
    """Get conversion funnel data"""
    try:
        supabase = get_supabase()
        
        # Get all stages in order
        stages_response = supabase.table("pipeline_stages").select("*").eq("is_active", True).order("position").execute()
        
        funnel = []
        
        for stage in stages_response.data or []:
            # Count leads in this stage
            status = stage["name"].lower().replace(" ", "_")
            count_response = supabase.table("leads").select("id", count="exact").eq("status", status).execute()
            
            funnel.append({
                "stage": stage["name"],
                "count": count_response.count or 0,
                "color": stage.get("color"),
                "position": stage.get("position")
            })
        
        # Calculate conversion rates
        for i in range(len(funnel) - 1):
            current_count = funnel[i]["count"]
            next_count = funnel[i + 1]["count"]
            
            if current_count > 0:
                funnel[i]["conversion_rate"] = round((next_count / current_count) * 100, 1)
            else:
                funnel[i]["conversion_rate"] = 0
        
        return funnel
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
