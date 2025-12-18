"""
Redis-backed session store for Twilio Gather conversations.

Provides:
- Persistent session storage (survives restarts)
- Multi-instance support (shared state across servers)
- Local cache layer for sub-millisecond reads
- Automatic expiration for cleanup
- Graceful fallback to in-memory if Redis unavailable

Usage:
    Set REDIS_URL environment variable to enable Redis:
    REDIS_URL=redis://localhost:6379/0

    If not set, falls back to in-memory storage.
"""

import os
import json
from typing import Dict, Any, Optional
from datetime import datetime
from cachetools import TTLCache

from app.utils.logging import get_logger

logger = get_logger("session_store")

# Try to import Redis, but make it optional
try:
    import redis
    from redis.exceptions import RedisError
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    RedisError = Exception  # Fallback for type hints
    logger.warning("Redis not installed. Install with: pip install redis")

# Configuration
REDIS_URL = os.getenv("REDIS_URL")
SESSION_TTL = int(os.getenv("SESSION_TTL", "3600"))  # 1 hour default
LOCAL_CACHE_SIZE = int(os.getenv("SESSION_CACHE_SIZE", "1000"))
LOCAL_CACHE_TTL = int(os.getenv("SESSION_CACHE_TTL", "300"))  # 5 min local cache


class SessionStore:
    """
    Redis-backed session store with local cache layer.
    
    Architecture:
    - Local TTL cache for sub-millisecond reads (hot data)
    - Redis for persistence and multi-instance sharing
    - In-memory fallback if Redis unavailable
    
    Write-through caching: writes go to both local and Redis.
    """
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.local_cache: TTLCache = TTLCache(
            maxsize=LOCAL_CACHE_SIZE, 
            ttl=LOCAL_CACHE_TTL
        )
        self.in_memory_fallback: Dict[str, Dict[str, Any]] = {}
        self._redis_healthy = False
        
        self._init_redis()
    
    def _init_redis(self):
        """Initialize Redis connection if available."""
        if REDIS_AVAILABLE and REDIS_URL:
            try:
                self.redis_client = redis.from_url(
                    REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2,
                    retry_on_timeout=True,
                )
                # Test connection
                self.redis_client.ping()
                self._redis_healthy = True
                logger.info("Session store initialized with Redis: %s", REDIS_URL)
            except Exception as e:
                logger.warning(
                    "Failed to connect to Redis (%s), using in-memory fallback",
                    str(e)
                )
                self.redis_client = None
                self._redis_healthy = False
        else:
            if not REDIS_AVAILABLE:
                logger.info("Redis not available, using in-memory session store")
            else:
                logger.info("REDIS_URL not configured, using in-memory session store")
    
    def _serialize(self, session: Dict[str, Any]) -> str:
        """Serialize session to JSON."""
        # Handle datetime objects
        serializable = {}
        for key, value in session.items():
            if isinstance(value, datetime):
                serializable[key] = value.isoformat()
            elif key == "history" and isinstance(value, list):
                # History items may have datetime
                serializable[key] = [
                    {
                        k: v.isoformat() if isinstance(v, datetime) else v
                        for k, v in item.items()
                    } if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                serializable[key] = value
        return json.dumps(serializable)
    
    def _deserialize(self, data: str) -> Dict[str, Any]:
        """Deserialize JSON to session dict."""
        session = json.loads(data)
        
        # Convert ISO strings back to datetime where needed
        if "created_at" in session and isinstance(session["created_at"], str):
            try:
                session["created_at"] = datetime.fromisoformat(session["created_at"])
            except ValueError:
                pass
        
        return session
    
    def get(self, call_sid: str) -> Optional[Dict[str, Any]]:
        """
        Get session by CallSid.
        
        Returns None if not found (caller should create new session).
        """
        # Check local cache first (sub-millisecond)
        if call_sid in self.local_cache:
            return self.local_cache[call_sid]
        
        # Try Redis
        if self.redis_client and self._redis_healthy:
            try:
                key = f"gather_session:{call_sid}"
                data = self.redis_client.get(key)
                if data:
                    session = self._deserialize(data)
                    # Populate local cache
                    self.local_cache[call_sid] = session
                    return session
            except RedisError as e:
                logger.error("Redis get failed: %s", str(e))
                self._redis_healthy = False
        
        # Check in-memory fallback
        if call_sid in self.in_memory_fallback:
            session = self.in_memory_fallback[call_sid]
            self.local_cache[call_sid] = session
            return session
        
        return None
    
    def set(self, call_sid: str, session: Dict[str, Any]) -> None:
        """
        Save session (write-through to all layers).
        """
        # Always update local cache
        self.local_cache[call_sid] = session
        
        # Try Redis
        if self.redis_client and self._redis_healthy:
            try:
                key = f"gather_session:{call_sid}"
                data = self._serialize(session)
                self.redis_client.setex(key, SESSION_TTL, data)
                return
            except RedisError as e:
                logger.error("Redis set failed: %s", str(e))
                self._redis_healthy = False
        
        # Fallback to in-memory
        self.in_memory_fallback[call_sid] = session
    
    def delete(self, call_sid: str) -> None:
        """Delete session from all layers."""
        # Remove from local cache
        if call_sid in self.local_cache:
            del self.local_cache[call_sid]
        
        # Remove from Redis
        if self.redis_client and self._redis_healthy:
            try:
                key = f"gather_session:{call_sid}"
                self.redis_client.delete(key)
            except RedisError as e:
                logger.error("Redis delete failed: %s", str(e))
        
        # Remove from in-memory fallback
        if call_sid in self.in_memory_fallback:
            del self.in_memory_fallback[call_sid]
    
    def exists(self, call_sid: str) -> bool:
        """Check if session exists."""
        if call_sid in self.local_cache:
            return True
        
        if self.redis_client and self._redis_healthy:
            try:
                key = f"gather_session:{call_sid}"
                return bool(self.redis_client.exists(key))
            except RedisError:
                pass
        
        return call_sid in self.in_memory_fallback
    
    def get_stats(self) -> Dict[str, Any]:
        """Get session store statistics."""
        stats = {
            "local_cache_size": len(self.local_cache),
            "in_memory_fallback_size": len(self.in_memory_fallback),
            "redis_healthy": self._redis_healthy,
            "redis_configured": bool(REDIS_URL),
        }
        
        if self.redis_client and self._redis_healthy:
            try:
                # Count Redis keys
                keys = self.redis_client.keys("gather_session:*")
                stats["redis_session_count"] = len(keys)
            except RedisError:
                stats["redis_session_count"] = -1
        
        return stats
    
    def health_check(self) -> bool:
        """Check if session store is healthy."""
        # If Redis is configured, check connection
        if self.redis_client:
            try:
                self.redis_client.ping()
                self._redis_healthy = True
                return True
            except RedisError:
                self._redis_healthy = False
                # Still healthy if we have fallback
                return True
        
        # In-memory mode is always healthy
        return True


# Global instance
session_store = SessionStore()


def get_session(call_sid: str, default_state: str = "greeting") -> Dict[str, Any]:
    """
    Get or create session for a call.
    
    This is the main interface for twilio_gather.py.
    """
    session = session_store.get(call_sid)
    
    if session is None:
        # Create new session
        session = {
            "state": default_state,
            "slots": {
                "name": None,
                "phone": None,
                "address": None,
                "issue": None,
                "date": None,
                "time": None,
            },
            "retries": 0,
            "history": [],
            "created_at": datetime.now().isoformat(),
        }
        session_store.set(call_sid, session)
        logger.debug("Created new session for call: %s", call_sid)
    
    return session


def save_session(call_sid: str, session: Dict[str, Any]) -> None:
    """Save session after updates."""
    session_store.set(call_sid, session)


def clear_session(call_sid: str) -> None:
    """Clear session after call ends."""
    session_store.delete(call_sid)
    logger.debug("Cleared session for call: %s", call_sid)
