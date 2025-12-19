"""
Response Cache for HVAC Voice Agent.

Provides caching for FAQ responses and common queries to eliminate
LLM latency for frequently asked questions.

Features:
- Semantic similarity matching (optional, with embeddings)
- Exact match caching for common phrases
- TTL-based expiration
- Cache warming on startup
- Hit rate tracking
"""

import os
import hashlib
import time
from typing import Optional, Dict, Any, List, Tuple
from cachetools import TTLCache

from app.utils.logging import get_logger

logger = get_logger("response_cache")

# Cache configuration
CACHE_TTL = int(os.getenv("RESPONSE_CACHE_TTL", "3600"))  # 1 hour default
CACHE_MAX_SIZE = int(os.getenv("RESPONSE_CACHE_SIZE", "500"))

# Pre-defined FAQ responses for instant answers
FAQ_RESPONSES: Dict[str, str] = {
    # Business hours
    "what are your hours": "We're open Monday through Friday, 8 AM to 6 PM, and Saturday 9 AM to 2 PM.",
    "when are you open": "We're open Monday through Friday, 8 AM to 6 PM, and Saturday 9 AM to 2 PM.",
    "are you open on weekends": "We're open Saturday from 9 AM to 2 PM. We're closed on Sundays, but we do have 24/7 emergency service available.",
    "do you have weekend hours": "Yes, we're open Saturday from 9 AM to 2 PM. We're closed on Sundays.",
    
    # Location
    "where are you located": "We serve the Dallas-Fort Worth metroplex, including Dallas, Fort Worth, and Arlington. Which area are you in?",
    "what areas do you serve": "We serve Dallas, Fort Worth, Arlington, and the surrounding DFW metroplex.",
    "do you service my area": "We serve the entire Dallas-Fort Worth metroplex. What's your zip code?",
    
    # Emergency
    "do you do emergency service": "Yes, we have 24/7 emergency service available. Is this an emergency?",
    "is this an emergency line": "I can help with emergencies. If you smell gas, please hang up and call 911 immediately. Otherwise, tell me what's happening.",
    "i have an emergency": "I understand this is urgent. Can you tell me what's happening? If you smell gas, please hang up and call 911 immediately.",
    
    # Pricing
    "how much does it cost": "Pricing depends on the service needed. We offer free estimates for most repairs. Would you like to schedule a technician to come out?",
    "what are your rates": "Our diagnostic fee is $89, which is waived if you proceed with the repair. Would you like to schedule an appointment?",
    "do you offer free estimates": "Yes, we offer free estimates for most repairs and installations. Would you like to schedule one?",
    
    # Services
    "what services do you offer": "We offer AC repair, heating repair, maintenance, installations, and 24/7 emergency service. What can I help you with today?",
    "do you install new units": "Yes, we install new AC and heating systems. Would you like to schedule a free consultation?",
    "do you do maintenance": "Yes, we offer annual maintenance plans to keep your system running efficiently. Would you like more information?",
    
    # Appointments
    "can i schedule an appointment": "Absolutely! I can help you schedule an appointment right now. What's your name?",
    "i need to book a service": "I'd be happy to help you book a service. Let's get started. What's your name?",
    "how soon can you come out": "We often have same-day or next-day availability. Let me check our schedule. What day works best for you?",
    
    # Common issues
    "my ac is not cooling": "I'm sorry to hear that. Let's get a technician out to take a look. Are you available today or tomorrow?",
    "my heater is not working": "I understand that's frustrating, especially in cold weather. Let's schedule a technician. When would be a good time?",
    "i hear a strange noise": "Strange noises can indicate various issues. It's best to have a technician diagnose it. Would you like to schedule an appointment?",
}

# Normalized versions for matching
_NORMALIZED_FAQ: Dict[str, str] = {}


def _normalize_query(query: str) -> str:
    """Normalize query for matching."""
    # Lowercase, remove punctuation, extra spaces
    normalized = query.lower().strip()
    normalized = ''.join(c for c in normalized if c.isalnum() or c.isspace())
    normalized = ' '.join(normalized.split())
    return normalized


def _init_normalized_faq():
    """Initialize normalized FAQ keys."""
    global _NORMALIZED_FAQ
    _NORMALIZED_FAQ = {
        _normalize_query(k): v
        for k, v in FAQ_RESPONSES.items()
    }


# Initialize on module load
_init_normalized_faq()


class ResponseCache:
    """
    Cache for LLM responses with FAQ fallback.
    
    Usage:
        cache = ResponseCache()
        
        # Check cache first
        cached = cache.get(user_query)
        if cached:
            return cached
        
        # Generate response
        response = await llm.generate(user_query)
        
        # Cache for future use
        cache.set(user_query, response)
    """
    
    def __init__(self, max_size: int = CACHE_MAX_SIZE, ttl: int = CACHE_TTL):
        self._cache: TTLCache = TTLCache(maxsize=max_size, ttl=ttl)
        self._hits = 0
        self._misses = 0
        self._faq_hits = 0
    
    def get(self, query: str) -> Optional[str]:
        """
        Get cached response for query.
        
        Checks FAQ first, then dynamic cache.
        
        Args:
            query: User query
            
        Returns:
            Cached response or None
        """
        # Check FAQ first (instant)
        faq_response = self._check_faq(query)
        if faq_response:
            self._faq_hits += 1
            self._hits += 1
            logger.debug("FAQ hit for: %s", query[:50])
            return faq_response
        
        # Check dynamic cache
        cache_key = self._get_cache_key(query)
        if cache_key in self._cache:
            self._hits += 1
            logger.debug("Cache hit for: %s", query[:50])
            return self._cache[cache_key]
        
        self._misses += 1
        return None
    
    def set(self, query: str, response: str) -> None:
        """
        Cache a response.
        
        Args:
            query: User query
            response: Generated response
        """
        cache_key = self._get_cache_key(query)
        self._cache[cache_key] = response
    
    def _check_faq(self, query: str) -> Optional[str]:
        """Check if query matches a FAQ."""
        normalized = _normalize_query(query)
        
        # Exact match
        if normalized in _NORMALIZED_FAQ:
            return _NORMALIZED_FAQ[normalized]
        
        # Partial match (query contains FAQ key)
        for faq_key, response in _NORMALIZED_FAQ.items():
            if faq_key in normalized or normalized in faq_key:
                # Only match if significant overlap
                if len(faq_key) > 10 or len(normalized) > 10:
                    return response
        
        return None
    
    def _get_cache_key(self, query: str) -> str:
        """Generate cache key from query."""
        normalized = _normalize_query(query)
        return hashlib.md5(normalized.encode()).hexdigest()
    
    def clear(self) -> None:
        """Clear the cache."""
        self._cache.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total = self._hits + self._misses
        hit_rate = self._hits / total if total > 0 else 0
        
        return {
            "hits": self._hits,
            "misses": self._misses,
            "faq_hits": self._faq_hits,
            "hit_rate": round(hit_rate, 3),
            "cache_size": len(self._cache),
            "max_size": self._cache.maxsize,
        }


# Global instance
_response_cache: Optional[ResponseCache] = None


def get_response_cache() -> ResponseCache:
    """Get the global response cache instance."""
    global _response_cache
    if _response_cache is None:
        _response_cache = ResponseCache()
    return _response_cache


def get_cached_response(query: str) -> Optional[str]:
    """
    Convenience function to get cached response.
    
    Args:
        query: User query
        
    Returns:
        Cached response or None
    """
    cache = get_response_cache()
    return cache.get(query)


def cache_response(query: str, response: str) -> None:
    """
    Convenience function to cache a response.
    
    Args:
        query: User query
        response: Generated response
    """
    cache = get_response_cache()
    cache.set(query, response)


def get_faq_response(query: str) -> Optional[str]:
    """
    Check if query matches a FAQ (no caching, just FAQ lookup).
    
    Args:
        query: User query
        
    Returns:
        FAQ response or None
    """
    normalized = _normalize_query(query)
    
    # Exact match
    if normalized in _NORMALIZED_FAQ:
        return _NORMALIZED_FAQ[normalized]
    
    # Keyword matching for common patterns
    keywords_to_response = {
        ("hours", "open", "when"): FAQ_RESPONSES["what are your hours"],
        ("location", "where", "area", "serve"): FAQ_RESPONSES["where are you located"],
        ("emergency", "urgent"): FAQ_RESPONSES["do you do emergency service"],
        ("cost", "price", "rate", "much"): FAQ_RESPONSES["how much does it cost"],
        ("service", "offer", "do you do"): FAQ_RESPONSES["what services do you offer"],
        ("schedule", "book", "appointment"): FAQ_RESPONSES["can i schedule an appointment"],
    }
    
    for keywords, response in keywords_to_response.items():
        if any(kw in normalized for kw in keywords):
            return response
    
    return None
