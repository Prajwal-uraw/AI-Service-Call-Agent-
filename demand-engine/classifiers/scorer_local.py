"""
Local execution wrapper for signal scoring (no Modal required)
"""
import os
from typing import Dict, Optional
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

from openai import OpenAI
from supabase import create_client
from tenacity import retry, stop_after_attempt, wait_exponential

# Import shared logic
from classifiers.keywords import calculate_keyword_score, should_use_ai_classification
from classifiers.scorer import (
    AI_CLASSIFICATION_PROMPT,
    create_openai_client,
    classify_with_ai,
    merge_scores,
)


def score_signal_local(signal_id: str) -> Dict:
    """
    Score a single signal locally (no Modal)
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    client = create_client(supabase_url, supabase_key)
    
    # Fetch signal
    result = client.table("signals").select("*").eq("id", signal_id).execute()
    
    if not result.data:
        raise ValueError(f"Signal {signal_id} not found")
    
    signal = result.data[0]
    
    # Step 1: Keyword scoring
    text = f"{signal.get('title', '')} {signal.get('content', '')}"
    keyword_result = calculate_keyword_score(text)
    
    print(f"📊 Signal {signal_id[:8]}... keyword score: {keyword_result['total_score']}")
    
    # Step 2: Decide if AI needed
    ai_result = None
    if should_use_ai_classification(keyword_result):
        print(f"🤖 Using AI for refinement...")
        ai_result = classify_with_ai(signal)
    else:
        print(f"⚡ Keyword score sufficient, skipping AI")
    
    # Step 3: Merge scores
    final_result = merge_scores(keyword_result, ai_result)
    
    # Step 4: Update database
    update_data = {
        "classified_score": final_result["final_score"],
        "urgency_signals": keyword_result["matched_keywords"]["urgency"],
        "budget_signals": keyword_result["matched_keywords"]["budget"],
        "authority_signals": keyword_result["matched_keywords"]["authority"],
        "pain_signals": keyword_result["matched_keywords"]["pain"],
        "is_qualified": final_result["is_qualified"],
        "classification_method": final_result["classification_method"],
        "classification_confidence": 0.85 if final_result["classification_method"] == "hybrid" else 0.70,
        "status": "classified",
        "processed_at": datetime.now(timezone.utc).isoformat(),
    }
    
    # Add AI data to raw_data if used
    if ai_result:
        signal["raw_data"] = signal.get("raw_data", {})
        signal["raw_data"]["ai_classification"] = ai_result
        update_data["raw_data"] = signal["raw_data"]
    
    client.table("signals").update(update_data).eq("id", signal_id).execute()
    
    print(f"✅ Signal {signal_id[:8]}... scored: {final_result['final_score']} (qualified: {final_result['is_qualified']})")
    
    return final_result


def score_batch_local(batch_size: int = 50, source_type: Optional[str] = None) -> Dict:
    """
    Score a batch of unclassified signals locally
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    client = create_client(supabase_url, supabase_key)
    
    # Fetch unclassified signals
    query = client.table("signals").select("id").eq("status", "pending")
    
    if source_type:
        query = query.eq("source_type", source_type)
    
    result = query.order("created_at", desc=False).limit(batch_size).execute()
    
    signals = result.data
    
    print(f"🔄 Processing batch of {len(signals)} signals")
    
    stats = {
        "total_processed": 0,
        "qualified": 0,
        "not_qualified": 0,
        "ai_used": 0,
        "keyword_only": 0,
        "errors": 0,
    }
    
    for signal in signals:
        try:
            result = score_signal_local(signal["id"])
            
            stats["total_processed"] += 1
            
            if result["is_qualified"]:
                stats["qualified"] += 1
            else:
                stats["not_qualified"] += 1
            
            if result["classification_method"] == "hybrid":
                stats["ai_used"] += 1
            else:
                stats["keyword_only"] += 1
                
        except Exception as e:
            print(f"❌ Error scoring signal {signal['id']}: {e}")
            stats["errors"] += 1
    
    print(f"\n✅ Batch complete: {stats}")
    
    return stats
