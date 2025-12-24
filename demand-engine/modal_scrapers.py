"""
Modal Deployment for Pain Signal Scrapers
Runs Reddit monitor with AI scoring on scheduled intervals
"""

import modal
import os
from datetime import datetime

# Create Modal app
app = modal.App("kestrel-pain-signal-scrapers")

# Create image with all dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "praw>=7.7.0",
        "openai>=1.12.0",
        "supabase>=2.3.4",
        "python-dotenv>=1.0.0",
    )
)

# Define secrets needed
@app.function(
    image=image,
    secrets=[
        modal.Secret.from_name("hvac-agent-secrets"),  # Consolidated secrets
    ],
    schedule=modal.Cron("0 */6 * * *"),  # Every 6 hours
    timeout=900,  # 15 minutes max
)
def run_reddit_monitor():
    """
    Run Reddit pain signal monitor with AI scoring
    Scheduled to run every 6 hours
    """
    import sys
    sys.path.insert(0, '/root')
    
    from scrapers.reddit_monitor_ai import RedditMonitorAI
    import logging
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("🚀 Starting Reddit monitor on Modal")
        
        monitor = RedditMonitorAI()
        stats = monitor.run()
        
        logger.info("=" * 60)
        logger.info("✅ Reddit Monitor Complete")
        logger.info("=" * 60)
        logger.info(f"Posts fetched: {stats['total_posts']}")
        logger.info(f"Duplicates skipped: {stats['total_duplicates']}")
        logger.info(f"AI scored: {stats['total_ai_scored']}")
        logger.info(f"High-value saved: {stats['total_saved']}")
        logger.info("=" * 60)
        
        return {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"❌ Reddit monitor failed: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@app.function(
    image=image,
    secrets=[
        modal.Secret.from_name("hvac-agent-secrets"),  # Consolidated secrets
    ],
    schedule=modal.Cron("0 9 * * *"),  # Daily at 9 AM UTC
    timeout=600,  # 10 minutes max
)
def run_daily_digest():
    """
    Send daily digest of high-value pain signals
    Scheduled to run daily at 9 AM UTC
    """
    import sys
    sys.path.insert(0, '/root')
    
    from alerts.daily_digest_signals import send_daily_digest
    import logging
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("📧 Starting daily digest on Modal")
        
        result = send_daily_digest()
        
        logger.info("=" * 60)
        logger.info("✅ Daily Digest Complete")
        logger.info("=" * 60)
        logger.info(f"Signals sent: {result.get('signals_count', 0)}")
        logger.info(f"Email sent: {result.get('email_sent', False)}")
        logger.info("=" * 60)
        
        return {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "result": result
        }
        
    except Exception as e:
        logger.error(f"❌ Daily digest failed: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@app.local_entrypoint()
def main():
    """
    Local testing entrypoint
    Run with: modal run modal_scrapers.py
    """
    print("🧪 Testing Reddit monitor...")
    result = run_reddit_monitor.remote()
    print(f"Result: {result}")
    
    print("\n🧪 Testing daily digest...")
    result = run_daily_digest.remote()
    print(f"Result: {result}")


# Manual trigger functions for on-demand execution
@app.function(
    image=image,
    secrets=[
        modal.Secret.from_name("hvac-agent-secrets"),  # Consolidated secrets
    ],
    timeout=900,
)
def trigger_reddit_monitor():
    """
    Manually trigger Reddit monitor
    Usage: modal run modal_scrapers.py::trigger_reddit_monitor
    """
    return run_reddit_monitor.local()


@app.function(
    image=image,
    secrets=[
        modal.Secret.from_name("hvac-agent-secrets"),  # Consolidated secrets
    ],
    timeout=600,
)
def trigger_daily_digest():
    """
    Manually trigger daily digest
    Usage: modal run modal_scrapers.py::trigger_daily_digest
    """
    return run_daily_digest.local()
