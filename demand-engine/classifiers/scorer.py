"""
Signal scoring with hybrid keyword + AI approach
Runs on Modal for batch processing
"""
import os
import json
from typing import Dict, List, Optional
from datetime import datetime, timezone
import modal
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config.modal_config import app, scraper_image, secrets
from classifiers.keywords import calculate_keyword_score, should_use_ai_classification


AI_CLASSIFICATION_PROMPT = """You are a lead qualification expert for an AI call answering service targeting HVAC, plumbing, and electrical contractors.

Analyze this post and score it on these dimensions (0-25 each):

1. PAIN (0-25): How much is this business struggling with call handling, growth, or operations?
2. URGENCY (0-25): How time-sensitive is their need?
3. BUDGET (0-25): Do they have budget/authority to invest in solutions?
4. AUTHORITY (0-25): Is this person a decision-maker (owner/manager)?

POST:
Title: {title}
Content: {content}
Source: {source}

Respond ONLY with valid JSON:
{{
  "pain_score": <0-25>,
  "urgency_score": <0-25>,
  "budget_score": <0-25>,
  "authority_score": <0-25>,
  "reasoning": "<brief explanation>",
  "is_qualified": <true/false>,
  "business_type": "<hvac|plumbing|electrical|general_contractor|other|unknown>"
}}"""


def create_openai_client() -> OpenAI:
    """Create OpenAI client"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY must be set")
    return OpenAI(api_key=api_key)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def classify_with_ai(signal: Dict) -> Dict:
    """
    Use GPT-4o-mini to classify signal
    
    Returns dict with AI scores and reasoning
    """
    client = create_openai_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    prompt = AI_CLASSIFICATION_PROMPT.format(
        title=signal.get("title", ""),
        content=signal.get("content", "")[:2000],  # Limit content length
        source=signal.get("source_platform", "unknown")
    )
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a lead qualification expert. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=300,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        return {
            "ai_pain_score": result.get("pain_score", 0),
            "ai_urgency_score": result.get("urgency_score", 0),
            "ai_budget_score": result.get("budget_score", 0),
            "ai_authority_score": result.get("authority_score", 0),
            "ai_reasoning": result.get("reasoning", ""),
            "ai_is_qualified": result.get("is_qualified", False),
            "ai_business_type": result.get("business_type", "unknown"),
            "classification_method": "ai",
        }
        
    except Exception as e:
        print(f"❌ AI classification error: {e}")
        return {
            "ai_pain_score": 0,
            "ai_urgency_score": 0,
            "ai_budget_score": 0,
            "ai_authority_score": 0,
            "ai_reasoning": f"Error: {str(e)}",
            "ai_is_qualified": False,
            "classification_method": "error",
        }


def merge_scores(keyword_result: Dict, ai_result: Optional[Dict] = None) -> Dict:
    """
    Merge keyword and AI scores with weighted average
    
    Weights:
    - If AI used: 60% keyword, 40% AI (keyword is baseline)
    - If no AI: 100% keyword
    """
    if not ai_result or ai_result.get("classification_method") == "error":
        # Pure keyword scoring
        return {
            "final_pain_score": keyword_result["pain_score"],
            "final_urgency_score": keyword_result["urgency_score"],
            "final_budget_score": keyword_result["budget_score"],
            "final_authority_score": keyword_result["authority_score"],
            "final_score": keyword_result["total_score"],
            "classification_method": "keyword",
            "is_qualified": keyword_result["total_score"] >= 70,
            "business_type": keyword_result.get("business_type", "unknown"),
        }
    
    # Hybrid scoring (60% keyword, 40% AI)
    final_pain = int(keyword_result["pain_score"] * 0.6 + ai_result["ai_pain_score"] * 0.4)
    final_urgency = int(keyword_result["urgency_score"] * 0.6 + ai_result["ai_urgency_score"] * 0.4)
    final_budget = int(keyword_result["budget_score"] * 0.6 + ai_result["ai_budget_score"] * 0.4)
    final_authority = int(keyword_result["authority_score"] * 0.6 + ai_result["ai_authority_score"] * 0.4)
    
    final_score = final_pain + final_urgency + final_budget + final_authority
    
    return {
        "final_pain_score": final_pain,
        "final_urgency_score": final_urgency,
        "final_budget_score": final_budget,
        "final_authority_score": final_authority,
        "final_score": min(100, final_score),
        "classification_method": "hybrid",
        "is_qualified": final_score >= 70 or ai_result.get("ai_is_qualified", False),
        "business_type": ai_result.get("ai_business_type") or keyword_result.get("business_type", "unknown"),
        "ai_reasoning": ai_result.get("ai_reasoning", ""),
    }


@app.function(
    image=scraper_image,
    secrets=secrets,
    timeout=300,
)
def score_signal(signal_id: str) -> Dict:
    """
    Score a single signal with hybrid approach
    
    Args:
        signal_id: UUID of signal in database
    
    Returns:
        Updated signal with scores
    """
    from supabase import create_client
    
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


@app.function(
    image=scraper_image,
    secrets=secrets,
    timeout=1800,
)
def score_batch(batch_size: int = 50, source_type: Optional[str] = None) -> Dict:
    """
    Score a batch of unclassified signals
    
    Args:
        batch_size: Number of signals to process
        source_type: Optional filter by source type
    
    Returns:
        Stats dict
    """
    from supabase import create_client
    
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
            result = score_signal.remote(signal["id"])
            
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


@app.local_entrypoint()
def main(
    signal_id: Optional[str] = None,
    batch: bool = False,
    batch_size: int = 50
):
    """
    Local entrypoint for testing
    
    Usage:
        modal run classifiers.scorer --signal-id <uuid>
        modal run classifiers.scorer --batch --batch-size 50
    """
    if signal_id:
        print(f"Scoring single signal: {signal_id}")
        result = score_signal.remote(signal_id)
        print(json.dumps(result, indent=2))
    elif batch:
        print(f"Scoring batch of {batch_size} signals")
        stats = score_batch.remote(batch_size=batch_size)
        print(json.dumps(stats, indent=2))
    else:
        print("❌ Must specify --signal-id or --batch")
