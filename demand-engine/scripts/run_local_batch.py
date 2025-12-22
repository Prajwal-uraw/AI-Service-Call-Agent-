"""
Local batch runner for demand engine - NO Modal required
Run scrapers and classifiers locally for testing and initial batches
"""
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import argparse
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Import local execution modules
from scrapers.reddit_local import scrape_subreddit_local, scrape_all_subreddits_local
from classifiers.scorer_local import score_signal_local, score_batch_local
from alerts.daily_digest_local import send_daily_digest_local


def validate_environment():
    """Validate all required environment variables are set"""
    required = [
        "SUPABASE_URL",
        "SUPABASE_KEY",
        "OPENAI_API_KEY",
        "REDDIT_CLIENT_ID",
        "REDDIT_CLIENT_SECRET",
    ]
    
    missing = [var for var in required if not os.getenv(var)]
    
    if missing:
        print("❌ Missing required environment variables:")
        for var in missing:
            print(f"   - {var}")
        print("\nPlease set these in your .env file")
        return False
    
    print("✅ Environment validated")
    return True


def run_reddit_scraper(args):
    """Run Reddit scraper locally"""
    print(f"\n{'='*60}")
    print("REDDIT SCRAPER - LOCAL EXECUTION")
    print(f"{'='*60}\n")
    
    if args.batch:
        print(f"Scraping {len(args.subreddits or [])} subreddits...")
        stats = scrape_all_subreddits_local(
            limit_per_subreddit=args.limit,
            subreddits=args.subreddits
        )
    else:
        subreddit = args.subreddit or "HVAC"
        print(f"Scraping r/{subreddit}...")
        stats = scrape_subreddit_local(
            subreddit_name=subreddit,
            limit=args.limit,
            sort=args.sort
        )
    
    print(f"\n{'='*60}")
    print("RESULTS:")
    print(json.dumps(stats, indent=2))
    print(f"{'='*60}\n")
    
    return stats


def run_classifier(args):
    """Run classifier locally"""
    print(f"\n{'='*60}")
    print("SIGNAL CLASSIFIER - LOCAL EXECUTION")
    print(f"{'='*60}\n")
    
    if args.signal_id:
        print(f"Scoring signal: {args.signal_id}")
        result = score_signal_local(args.signal_id)
        print(f"\n{'='*60}")
        print("RESULT:")
        print(json.dumps(result, indent=2))
        print(f"{'='*60}\n")
    else:
        print(f"Scoring batch of {args.batch_size} signals...")
        stats = score_batch_local(
            batch_size=args.batch_size,
            source_type=args.source_type
        )
        print(f"\n{'='*60}")
        print("RESULTS:")
        print(json.dumps(stats, indent=2))
        print(f"{'='*60}\n")
    
    return result if args.signal_id else stats


def run_alerts(args):
    """Run alert system locally"""
    print(f"\n{'='*60}")
    print("DAILY DIGEST - LOCAL EXECUTION")
    print(f"{'='*60}\n")
    
    result = send_daily_digest_local(
        score_threshold=args.threshold,
        limit=args.limit
    )
    
    print(f"\n{'='*60}")
    print("RESULT:")
    print(json.dumps(result, indent=2))
    print(f"{'='*60}\n")
    
    return result


def run_full_pipeline(args):
    """Run complete pipeline: scrape → classify → alert"""
    print(f"\n{'='*60}")
    print("FULL PIPELINE - LOCAL EXECUTION")
    print(f"{'='*60}\n")
    
    results = {
        "started_at": datetime.now().isoformat(),
        "steps": {}
    }
    
    # Step 1: Scrape
    print("\n📡 STEP 1: SCRAPING...")
    scrape_stats = run_reddit_scraper(args)
    results["steps"]["scraping"] = scrape_stats
    
    # Step 2: Classify
    print("\n🤖 STEP 2: CLASSIFYING...")
    classify_stats = score_batch_local(batch_size=100)
    results["steps"]["classification"] = classify_stats
    
    # Step 3: Alert
    print("\n📧 STEP 3: SENDING ALERTS...")
    alert_result = send_daily_digest_local(score_threshold=70, limit=20)
    results["steps"]["alerts"] = alert_result
    
    results["completed_at"] = datetime.now().isoformat()
    
    print(f"\n{'='*60}")
    print("PIPELINE COMPLETE")
    print(f"{'='*60}")
    print(json.dumps(results, indent=2))
    print(f"{'='*60}\n")
    
    return results


def main():
    parser = argparse.ArgumentParser(
        description="Local batch runner for Demand Engine (no Modal required)"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Scraper command
    scraper_parser = subparsers.add_parser("scrape", help="Run Reddit scraper")
    scraper_parser.add_argument("--subreddit", type=str, help="Single subreddit to scrape")
    scraper_parser.add_argument("--batch", action="store_true", help="Scrape all target subreddits")
    scraper_parser.add_argument("--subreddits", nargs="+", help="List of subreddits for batch mode")
    scraper_parser.add_argument("--limit", type=int, default=50, help="Posts per subreddit")
    scraper_parser.add_argument("--sort", type=str, default="hot", choices=["hot", "new", "top", "rising"])
    
    # Classifier command
    classifier_parser = subparsers.add_parser("classify", help="Run signal classifier")
    classifier_parser.add_argument("--signal-id", type=str, help="Single signal ID to score")
    classifier_parser.add_argument("--batch-size", type=int, default=50, help="Batch size")
    classifier_parser.add_argument("--source-type", type=str, help="Filter by source type")
    
    # Alerts command
    alerts_parser = subparsers.add_parser("alerts", help="Send daily digest")
    alerts_parser.add_argument("--threshold", type=int, default=70, help="Minimum score")
    alerts_parser.add_argument("--limit", type=int, default=20, help="Max signals to include")
    
    # Full pipeline command
    pipeline_parser = subparsers.add_parser("pipeline", help="Run full pipeline")
    pipeline_parser.add_argument("--subreddit", type=str, default="HVAC")
    pipeline_parser.add_argument("--batch", action="store_true")
    pipeline_parser.add_argument("--subreddits", nargs="+")
    pipeline_parser.add_argument("--limit", type=int, default=50)
    pipeline_parser.add_argument("--sort", type=str, default="hot")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Validate environment
    if not validate_environment():
        sys.exit(1)
    
    # Run command
    try:
        if args.command == "scrape":
            run_reddit_scraper(args)
        elif args.command == "classify":
            run_classifier(args)
        elif args.command == "alerts":
            run_alerts(args)
        elif args.command == "pipeline":
            run_full_pipeline(args)
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
