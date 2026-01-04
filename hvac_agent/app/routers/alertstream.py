"""
AlertStream SMS Alert System Routes
Integrated into existing Modal FastAPI app - reuses all existing secrets
"""

import os
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import hmac
import secrets
import bcrypt

router = APIRouter(prefix="/api/v1/alertstream", tags=["alertstream"])

# Reuse existing secrets from Modal
DATABASE_URL = os.getenv("DATABASE_URL")  # Supabase for voice agent
ALERTSTREAM_DB_URL = os.getenv("ALERTSTREAM_DATABASE_URL", DATABASE_URL)  # Neon for AlertStream
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Models
class WebsiteCreate(BaseModel):
    domain: str

class TriggerCreate(BaseModel):
    website_id: str
    name: str
    event_type: str
    conditions: dict
    sms_template: str
    phone_number: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    phone_number: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Database helper
def get_alertstream_db():
    """Get AlertStream database connection (Neon)"""
    return psycopg2.connect(ALERTSTREAM_DB_URL, cursor_factory=RealDictCursor)

# Auth helpers
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode(), hashed.encode())

def generate_api_key() -> str:
    """Generate secure API key"""
    return secrets.token_urlsafe(32)

def verify_hmac_signature(payload: str, signature: str, secret: str) -> bool:
    """Verify HMAC signature for webhooks"""
    expected = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

# Authentication
@router.post("/auth/register")
async def register(user: UserRegister):
    """Register new AlertStream user"""
    conn = get_alertstream_db()
    try:
        cur = conn.cursor()
        
        # Check if user exists
        cur.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        hashed_pw = hash_password(user.password)
        cur.execute(
            """
            INSERT INTO users (email, password_hash, phone_number, plan, sms_quota, sms_used)
            VALUES (%s, %s, %s, 'free', 100, 0)
            RETURNING id, email, phone_number, plan, sms_quota
            """,
            (user.email, hashed_pw, user.phone_number)
        )
        user_data = cur.fetchone()
        conn.commit()
        
        return {
            "success": True,
            "user": dict(user_data),
            "message": "User registered successfully"
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.post("/auth/login")
async def login(credentials: UserLogin):
    """Login to AlertStream"""
    conn = get_alertstream_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, email, password_hash, phone_number, plan FROM users WHERE email = %s",
            (credentials.email,)
        )
        user = cur.fetchone()
        
        if not user or not verify_password(credentials.password, user['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Generate session token (simplified - use JWT in production)
        token = generate_api_key()
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": user['id'],
                "email": user['email'],
                "phone_number": user['phone_number'],
                "plan": user['plan']
            }
        }
    finally:
        conn.close()

# Websites
@router.post("/websites")
async def create_website(website: WebsiteCreate, authorization: str = Header(None)):
    """Register a new website for monitoring"""
    conn = get_alertstream_db()
    try:
        cur = conn.cursor()
        
        # Generate API key for website
        api_key = generate_api_key()
        
        cur.execute(
            """
            INSERT INTO websites (user_id, domain, api_key, is_active)
            VALUES (1, %s, %s, true)
            RETURNING id, domain, api_key, is_active, created_at
            """,
            (website.domain, api_key)
        )
        site = cur.fetchone()
        conn.commit()
        
        return {"success": True, "website": dict(site)}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/websites")
async def list_websites():
    """List all registered websites"""
    conn = get_alertstream_db()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, domain, api_key, is_active, created_at
            FROM websites
            WHERE user_id = 1
            ORDER BY created_at DESC
            """
        )
        websites = cur.fetchall()
        return {"success": True, "websites": [dict(w) for w in websites]}
    finally:
        conn.close()

@router.delete("/websites/{website_id}")
async def delete_website(website_id: str):
    """Delete a website"""
    conn = get_alertstream_db()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM websites WHERE id = %s", (website_id,))
        conn.commit()
        return {"success": True, "message": "Website deleted"}
    finally:
        conn.close()

# Triggers
@router.post("/triggers")
async def create_trigger(trigger: TriggerCreate):
    """Create SMS alert trigger"""
    conn = get_alertstream_db()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO triggers (website_id, name, event_type, conditions, sms_template, phone_number, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, true)
            RETURNING id, name, event_type, sms_template, phone_number, is_active, created_at
            """,
            (trigger.website_id, trigger.name, trigger.event_type, 
             str(trigger.conditions), trigger.sms_template, trigger.phone_number)
        )
        new_trigger = cur.fetchone()
        conn.commit()
        return {"success": True, "trigger": dict(new_trigger)}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/triggers")
async def list_triggers(website_id: Optional[str] = None):
    """List all triggers"""
    conn = get_alertstream_db()
    try:
        cur = conn.cursor()
        if website_id:
            cur.execute(
                "SELECT * FROM triggers WHERE website_id = %s ORDER BY created_at DESC",
                (website_id,)
            )
        else:
            cur.execute("SELECT * FROM triggers ORDER BY created_at DESC")
        triggers = cur.fetchall()
        return {"success": True, "triggers": [dict(t) for t in triggers]}
    finally:
        conn.close()

@router.delete("/triggers/{trigger_id}")
async def delete_trigger(trigger_id: str):
    """Delete a trigger"""
    conn = get_alertstream_db()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM triggers WHERE id = %s", (trigger_id,))
        conn.commit()
        return {"success": True, "message": "Trigger deleted"}
    finally:
        conn.close()

# SMS History
@router.get("/sms")
async def get_sms_history(limit: int = 50, offset: int = 0):
    """Get SMS message history"""
    conn = get_alertstream_db()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, phone_number, message, status, cost, created_at, delivered_at
            FROM sms_messages
            WHERE user_id = 1
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
            """,
            (limit, offset)
        )
        messages = cur.fetchall()
        
        cur.execute("SELECT COUNT(*) as total FROM sms_messages WHERE user_id = 1")
        total = cur.fetchone()['total']
        
        return {
            "success": True,
            "messages": [dict(m) for m in messages],
            "total": total
        }
    finally:
        conn.close()

@router.get("/sms/stats")
async def get_sms_stats():
    """Get SMS statistics"""
    conn = get_alertstream_db()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT 
                COUNT(*) as total_sent,
                COUNT(*) FILTER (WHERE status = 'delivered') as total_delivered,
                COUNT(*) FILTER (WHERE status = 'failed') as total_failed,
                COALESCE(SUM(cost), 0) as total_cost
            FROM sms_messages
            WHERE user_id = 1
            """
        )
        stats = cur.fetchone()
        return {"success": True, "stats": dict(stats)}
    finally:
        conn.close()

# Events (webhook endpoint)
@router.post("/events")
async def ingest_event(event: dict, x_api_key: str = Header(None)):
    """Ingest event from website (webhook)"""
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    conn = get_alertstream_db()
    try:
        cur = conn.cursor()
        
        # Verify API key
        cur.execute("SELECT id, user_id FROM websites WHERE api_key = %s", (x_api_key,))
        website = cur.fetchone()
        if not website:
            raise HTTPException(status_code=401, detail="Invalid API key")
        
        # Store event
        cur.execute(
            """
            INSERT INTO events (website_id, event_type, event_data, ip_address)
            VALUES (%s, %s, %s, %s)
            RETURNING id
            """,
            (website['id'], event.get('event_type'), str(event), event.get('ip'))
        )
        event_id = cur.fetchone()['id']
        conn.commit()
        
        # TODO: Check triggers and send SMS if conditions match
        
        return {"success": True, "event_id": event_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Billing
@router.get("/billing")
async def get_billing_info():
    """Get billing information"""
    conn = get_alertstream_db()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT plan, sms_quota, sms_used, billing_cycle_start, billing_cycle_end
            FROM users
            WHERE id = 1
            """
        )
        billing = cur.fetchone()
        return {"success": True, "billing": dict(billing)}
    finally:
        conn.close()

# Health check
@router.get("/health")
async def alertstream_health():
    """AlertStream health check"""
    try:
        conn = get_alertstream_db()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        conn.close()
        return {
            "status": "healthy",
            "service": "alertstream",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "alertstream",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
