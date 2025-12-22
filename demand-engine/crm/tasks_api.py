"""
CRM Tasks API
Manage follow-ups and to-do items
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.supabase_config import get_supabase

router = APIRouter(prefix="/api/crm/tasks", tags=["CRM - Tasks"])

# Models
class TaskCreate(BaseModel):
    lead_id: Optional[str] = None
    contact_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    task_type: Optional[str] = None  # call, email, meeting, follow_up, demo, proposal
    status: str = "pending"
    priority: str = "medium"  # low, medium, high, urgent
    due_date: Optional[datetime] = None
    reminder_date: Optional[datetime] = None
    assigned_to: Optional[str] = None
    created_by: Optional[str] = "system"
    metadata: dict = {}

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    reminder_date: Optional[str] = None
    assigned_to: Optional[str] = None
    completed_at: Optional[datetime] = None


@router.get("/")
async def get_tasks(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    lead_id: Optional[str] = None,
    assigned_to: Optional[str] = None,
    overdue: bool = False
):
    """Get tasks with filtering"""
    try:
        supabase = get_supabase()
        
        query = supabase.table("tasks").select("*, leads(business_name, contact_name)")
        
        if status:
            query = query.eq("status", status)
        
        if priority:
            query = query.eq("priority", priority)
        
        if lead_id:
            query = query.eq("lead_id", lead_id)
        
        if assigned_to:
            query = query.eq("assigned_to", assigned_to)
        
        if overdue:
            query = query.lt("due_date", datetime.now().isoformat()).eq("status", "pending")
        
        response = query.order("due_date", desc=False).range(offset, offset + limit - 1).execute()
        
        return {
            "tasks": response.data,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}")
async def get_task(task_id: str):
    """Get single task"""
    try:
        supabase = get_supabase()
        
        response = supabase.table("tasks").select("*, leads(business_name, contact_name)").eq("id", task_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return response.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
async def create_task(task: TaskCreate):
    """Create new task"""
    try:
        supabase = get_supabase()
        
        task_data = task.dict()
        
        response = supabase.table("tasks").insert(task_data).execute()
        
        # Update next_follow_up_at on lead if applicable
        if task_data.get("lead_id") and task_data.get("due_date"):
            supabase.table("leads").update({
                "next_follow_up_at": task_data["due_date"]
            }).eq("id", task_data["lead_id"]).execute()
        
        return {
            "success": True,
            "task": response.data[0] if response.data else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{task_id}")
async def update_task(task_id: str, task: TaskUpdate):
    """Update task"""
    try:
        supabase = get_supabase()
        
        update_data = {k: v for k, v in task.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        # Auto-set completed_at if status changed to completed
        if update_data.get("status") == "completed" and "completed_at" not in update_data:
            update_data["completed_at"] = datetime.now().isoformat()
        
        response = supabase.table("tasks").update(update_data).eq("id", task_id).execute()
        
        return {
            "success": True,
            "task": response.data[0] if response.data else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{task_id}")
async def delete_task(task_id: str):
    """Delete task"""
    try:
        supabase = get_supabase()
        
        response = supabase.table("tasks").delete().eq("id", task_id).execute()
        
        return {"success": True, "message": "Task deleted"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{task_id}/complete")
async def complete_task(task_id: str):
    """Mark task as completed"""
    try:
        supabase = get_supabase()
        
        response = supabase.table("tasks").update({
            "status": "completed",
            "completed_at": datetime.now().isoformat()
        }).eq("id", task_id).execute()
        
        return {
            "success": True,
            "task": response.data[0] if response.data else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/upcoming/summary")
async def get_upcoming_tasks_summary():
    """Get summary of upcoming tasks"""
    try:
        supabase = get_supabase()
        
        now = datetime.now()
        
        # Today's tasks
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        today_tasks = supabase.table("tasks").select("id", count="exact").gte("due_date", today_start.isoformat()).lte("due_date", today_end.isoformat()).eq("status", "pending").execute()
        
        # Overdue tasks
        overdue_tasks = supabase.table("tasks").select("id", count="exact").lt("due_date", now.isoformat()).eq("status", "pending").execute()
        
        # High priority tasks
        high_priority = supabase.table("tasks").select("id", count="exact").in_("priority", ["high", "urgent"]).eq("status", "pending").execute()
        
        return {
            "today": today_tasks.count or 0,
            "overdue": overdue_tasks.count or 0,
            "high_priority": high_priority.count or 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
