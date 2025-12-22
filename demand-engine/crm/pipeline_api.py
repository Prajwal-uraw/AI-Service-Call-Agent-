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
    """Get all pipeline stages"""
    try:
        supabase = get_supabase()
        
        response = supabase.table("pipeline_stages").select("*").eq("is_active", True).order("position").execute()
        
        return response.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/view")
async def get_pipeline_view(
    stage: Optional[str] = None,
    search: Optional[str] = None
):
    """Get pipeline view with leads grouped by stage"""
    try:
        supabase = get_supabase()
        
        query = supabase.table("lead_pipeline_view").select("*")
        
        if stage:
            query = query.eq("stage_name", stage)
        
        if search:
            query = query.or_(f"business_name.ilike.%{search}%,contact_name.ilike.%{search}%,email.ilike.%{search}%")
        
        response = query.order("stage_position").order("lead_score", desc=True).execute()
        
        # Group by stage
        stages_data = {}
        for lead in response.data or []:
            stage_name = lead.get("stage_name") or "New"
            if stage_name not in stages_data:
                stages_data[stage_name] = {
                    "name": stage_name,
                    "color": lead.get("stage_color"),
                    "position": lead.get("stage_position"),
                    "leads": []
                }
            stages_data[stage_name]["leads"].append(lead)
        
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
