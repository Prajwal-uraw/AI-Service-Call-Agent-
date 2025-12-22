"""
Local execution wrapper for Reddit scraper (no Modal required)
"""
import os
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

import praw
from supabase import create_client
from tenacity import retry, stop_after_attempt, wait_exponential

# Import shared logic from reddit.py
from scrapers.reddit import (
    TARGET_SUBREDDITS,
    calculate_content_hash,
    extract_signals,
    calculate_raw_score,
    create_reddit_client,
    submission_to_signal,
)


def save_signal_to_db_local(signal: Dict) -> bool:
    """Save signal to Supabase (local execution)"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
    
    client = create_client(supabase_url, supabase_key)
    
    try:
        # Check for duplicate
        existing = client.table("signals").select("id").eq(
            "content_hash", signal["content_hash"]
        ).execute()
        
        if existing.data:
            print(f"⏭️  Duplicate signal skipped: {signal['source_id']}")
            return False
        
        # Insert new signal
        result = client.table("signals").insert(signal).execute()
        print(f"✅ Signal saved: {signal['source_id']} (score: {signal['raw_score']})")
        return True
        
    except Exception as e:
        print(f"❌ Error saving signal: {e}")
        # Log error
        try:
            client.table("error_logs").insert({
                "error_type": "signal_save_error",
                "error_message": str(e),
                "module": "reddit_scraper_local",
                "severity": "error",
                "context": {"signal_id": signal.get("source_id")}
            }).execute()
        except:
            pass
        raise


def scrape_subreddit_local(
    subreddit_name: str,
    limit: int = 100,
    time_filter: str = "week",
    sort: str = "hot"
) -> Dict[str, int]:
    """
    Scrape a subreddit locally (no Modal)
    """
    print(f"🔍 Scraping r/{subreddit_name} (limit={limit}, sort={sort})")
    
    reddit = create_reddit_client()
    subreddit = reddit.subreddit(subreddit_name)
    
    stats = {
        "total_fetched": 0,
        "signals_saved": 0,
        "duplicates_skipped": 0,
        "errors": 0,
    }
    
    try:
        # Get submissions
        if sort == "hot":
            submissions = subreddit.hot(limit=limit)
        elif sort == "new":
            submissions = subreddit.new(limit=limit)
        elif sort == "top":
            submissions = subreddit.top(time_filter=time_filter, limit=limit)
        elif sort == "rising":
            submissions = subreddit.rising(limit=limit)
        else:
            submissions = subreddit.hot(limit=limit)
        
        for submission in submissions:
            stats["total_fetched"] += 1
            
            # Skip if no text content
            if not submission.selftext or len(submission.selftext) < 50:
                continue
            
            try:
                signal = submission_to_signal(submission)
                
                # Only save if raw_score >= 20
                if signal["raw_score"] >= 20:
                    saved = save_signal_to_db_local(signal)
                    if saved:
                        stats["signals_saved"] += 1
                    else:
                        stats["duplicates_skipped"] += 1
                        
            except Exception as e:
                print(f"❌ Error processing submission {submission.id}: {e}")
                stats["errors"] += 1
                continue
        
        print(f"✅ Completed r/{subreddit_name}: {stats}")
        return stats
        
    except Exception as e:
        print(f"❌ Fatal error scraping r/{subreddit_name}: {e}")
        stats["errors"] += 1
        return stats


def scrape_all_subreddits_local(
    limit_per_subreddit: int = 50,
    subreddits: Optional[List[str]] = None
) -> Dict[str, Dict]:
    """
    Scrape all target subreddits locally
    """
    target_subs = subreddits or TARGET_SUBREDDITS
    
    print(f"🚀 Starting batch scrape of {len(target_subs)} subreddits")
    
    all_stats = {}
    
    for subreddit_name in target_subs:
        try:
            stats = scrape_subreddit_local(
                subreddit_name=subreddit_name,
                limit=limit_per_subreddit,
                sort="hot"
            )
            all_stats[subreddit_name] = stats
        except Exception as e:
            print(f"❌ Failed to scrape r/{subreddit_name}: {e}")
            all_stats[subreddit_name] = {"error": str(e)}
    
    # Summary
    total_saved = sum(s.get("signals_saved", 0) for s in all_stats.values())
    total_fetched = sum(s.get("total_fetched", 0) for s in all_stats.values())
    
    print(f"\n📊 BATCH COMPLETE")
    print(f"   Total fetched: {total_fetched}")
    print(f"   Total saved: {total_saved}")
    print(f"   Subreddits: {len(target_subs)}")
    
    return all_stats
