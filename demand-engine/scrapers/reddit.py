"""
Reddit scraper using official PRAW API (compliant, no IP rotation needed)
Runs on Modal.com for serverless execution
"""
import os
import hashlib
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional
import modal
from praw import Reddit
from praw.models import Submission, Comment
from tenacity import retry, stop_after_attempt, wait_exponential

# Import Modal config
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config.modal_config import app, scraper_image, secrets

# Subreddit targets for HVAC/Plumbing businesses
TARGET_SUBREDDITS = [
    "HVAC",
    "hvacadvice", 
    "Plumbing",
    "electricians",
    "smallbusiness",
    "sweatystartup",
]

# Keywords indicating pain signals
PAIN_KEYWORDS = [
    "overwhelmed", "busy", "can't keep up", "missing calls", "losing customers",
    "need help", "struggling", "too many calls", "can't answer", "voicemail full",
    "hiring", "need staff", "growing fast", "scaling", "expansion",
]

URGENCY_KEYWORDS = [
    "urgent", "asap", "immediately", "right now", "today", "this week",
    "emergency", "critical", "desperate", "quickly",
]

BUDGET_KEYWORDS = [
    "budget", "afford", "cost", "price", "investment", "roi", "revenue",
    "profit", "money", "expensive", "cheap", "worth it",
]

AUTHORITY_KEYWORDS = [
    "owner", "ceo", "founder", "partner", "manager", "director",
    "my business", "my company", "we run", "i own",
]


def calculate_content_hash(content: str) -> str:
    """Generate SHA256 hash for deduplication"""
    return hashlib.sha256(content.encode()).hexdigest()


def extract_signals(text: str) -> Dict[str, List[str]]:
    """Extract signal keywords from text"""
    text_lower = text.lower()
    
    return {
        "pain_signals": [kw for kw in PAIN_KEYWORDS if kw in text_lower],
        "urgency_signals": [kw for kw in URGENCY_KEYWORDS if kw in text_lower],
        "budget_signals": [kw for kw in BUDGET_KEYWORDS if kw in text_lower],
        "authority_signals": [kw for kw in AUTHORITY_KEYWORDS if kw in text_lower],
    }


def calculate_raw_score(signals: Dict[str, List[str]]) -> int:
    """Calculate initial score based on keyword matches"""
    score = 0
    score += len(signals["pain_signals"]) * 10
    score += len(signals["urgency_signals"]) * 8
    score += len(signals["budget_signals"]) * 5
    score += len(signals["authority_signals"]) * 12
    
    return min(100, score)


def create_reddit_client() -> Reddit:
    """Create authenticated Reddit client"""
    client_id = os.getenv("REDDIT_CLIENT_ID")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    user_agent = os.getenv("REDDIT_USER_AGENT", "DemandEngine/1.0")
    
    if not client_id or not client_secret:
        raise ValueError("REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET must be set")
    
    return Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent,
    )


def submission_to_signal(submission: Submission) -> Dict:
    """Convert Reddit submission to signal format"""
    content = f"{submission.title}\n\n{submission.selftext}"
    content_hash = calculate_content_hash(content)
    signals = extract_signals(content)
    raw_score = calculate_raw_score(signals)
    
    return {
        "source_type": "reddit",
        "source_platform": f"r/{submission.subreddit.display_name}",
        "source_url": f"https://reddit.com{submission.permalink}",
        "source_id": submission.id,
        "title": submission.title,
        "content": submission.selftext,
        "author": str(submission.author) if submission.author else "[deleted]",
        "author_url": f"https://reddit.com/user/{submission.author}" if submission.author else None,
        "content_hash": content_hash,
        "raw_score": raw_score,
        "pain_signals": signals["pain_signals"],
        "urgency_signals": signals["urgency_signals"],
        "budget_signals": signals["budget_signals"],
        "authority_signals": signals["authority_signals"],
        "status": "pending",
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "raw_data": {
            "upvotes": submission.score,
            "num_comments": submission.num_comments,
            "created_utc": submission.created_utc,
            "is_self": submission.is_self,
        }
    }


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def save_signal_to_db(signal: Dict) -> bool:
    """Save signal to Supabase with retry logic"""
    from supabase import create_client
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
    
    client = create_client(supabase_url, supabase_key)
    
    try:
        # Check for duplicate by content_hash
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
        # Log error to database
        try:
            client.table("error_logs").insert({
                "error_type": "signal_save_error",
                "error_message": str(e),
                "module": "reddit_scraper",
                "severity": "error",
                "context": {"signal_id": signal.get("source_id")}
            }).execute()
        except:
            pass
        raise


@app.function(
    image=scraper_image,
    secrets=secrets,
    timeout=600,  # 10 minutes
)
def scrape_subreddit(
    subreddit_name: str,
    limit: int = 100,
    time_filter: str = "week",
    sort: str = "hot"
) -> Dict[str, int]:
    """
    Scrape a subreddit for signals
    
    Args:
        subreddit_name: Name of subreddit (without r/)
        limit: Number of posts to fetch
        time_filter: Time filter (hour, day, week, month, year, all)
        sort: Sort method (hot, new, top, rising)
    
    Returns:
        Stats dict with counts
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
        # Get submissions based on sort method
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
                
                # Only save if raw_score >= 20 (has some signals)
                if signal["raw_score"] >= 20:
                    saved = save_signal_to_db(signal)
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


@app.function(
    image=scraper_image,
    secrets=secrets,
    timeout=1800,  # 30 minutes
)
def scrape_all_subreddits(
    limit_per_subreddit: int = 50,
    subreddits: Optional[List[str]] = None
) -> Dict[str, Dict]:
    """
    Scrape all target subreddits
    
    Args:
        limit_per_subreddit: Number of posts per subreddit
        subreddits: Optional list of subreddits (uses TARGET_SUBREDDITS if None)
    
    Returns:
        Dict of stats per subreddit
    """
    target_subs = subreddits or TARGET_SUBREDDITS
    
    print(f"🚀 Starting batch scrape of {len(target_subs)} subreddits")
    
    all_stats = {}
    
    for subreddit_name in target_subs:
        try:
            stats = scrape_subreddit.remote(
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


@app.local_entrypoint()
def main(
    subreddit: str = "HVAC",
    limit: int = 50,
    batch: bool = False
):
    """
    Local entrypoint for testing
    
    Usage:
        modal run scrapers.reddit --subreddit HVAC --limit 10
        modal run scrapers.reddit --batch
    """
    if batch:
        print("Running batch scrape of all subreddits...")
        stats = scrape_all_subreddits.remote(limit_per_subreddit=limit)
        print(json.dumps(stats, indent=2))
    else:
        print(f"Scraping r/{subreddit}...")
        stats = scrape_subreddit.remote(
            subreddit_name=subreddit,
            limit=limit
        )
        print(json.dumps(stats, indent=2))
