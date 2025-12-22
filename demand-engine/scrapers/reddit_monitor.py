"""
Reddit Pain Signal Monitor
Fetches and scores HVAC-related posts from Reddit for lead generation
"""

import praw
import os
import hashlib
import re
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional
import logging

from config.supabase_config import get_supabase

logger = logging.getLogger(__name__)

# Configuration
SUBREDDITS = ['HVAC', 'homeowners', 'Plumbing', 'HomeImprovement', 'hvacadvice']
LOOKBACK_HOURS = 24
MIN_SCORE_THRESHOLD = 70

# Scoring weights (must sum to 100)
SCORE_WEIGHTS = {
    'urgency': 25,
    'budget': 25,
    'authority': 25,
    'pain': 25
}

# Signal keywords for quick pre-filtering
SIGNAL_KEYWORDS = {
    'urgency': [
        'urgent', 'emergency', 'asap', 'immediately', 'right now',
        'broken', 'not working', 'stopped working', 'died', 'failed',
        'need help', 'desperate', 'today', 'tonight', 'weekend'
    ],
    'budget': [
        'quote', 'estimate', 'price', 'cost', 'budget', 'afford',
        'expensive', 'cheap', 'reasonable', 'fair price', 'how much',
        'willing to pay', 'investment', 'financing', 'payment plan'
    ],
    'authority': [
        'owner', 'business', 'company', 'contractor', 'professional',
        'licensed', 'certified', 'my company', 'we have', 'our business',
        'hiring', 'looking for', 'need someone', 'recommendations'
    ],
    'pain': [
        'frustrated', 'angry', 'terrible', 'horrible', 'worst',
        'never again', 'disappointed', 'fed up', 'sick of', 'tired of',
        'no answer', 'no response', 'ignored', 'ghosted', 'unreliable',
        'missed calls', 'voicemail', 'can\'t reach', 'not answering'
    ]
}


class RedditMonitor:
    """Monitor Reddit for HVAC business pain signals"""
    
    def __init__(self):
        """Initialize Reddit API client"""
        self.reddit = praw.Reddit(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            user_agent=os.getenv('REDDIT_USER_AGENT', 'PainSignalBot/1.0')
        )
        self.supabase = get_supabase()
    
    def fetch_recent_posts(self, subreddit_name: str, hours: int = 24) -> List[Dict]:
        """
        Fetch posts from last N hours
        
        Args:
            subreddit_name: Name of subreddit to monitor
            hours: How many hours back to look
            
        Returns:
            List of post dictionaries
        """
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
            
            posts = []
            
            # Fetch from new posts (most recent)
            for submission in subreddit.new(limit=100):
                post_time = datetime.fromtimestamp(submission.created_utc, tz=timezone.utc)
                
                if post_time > cutoff_time:
                    posts.append({
                        'id': submission.id,
                        'subreddit': subreddit_name,
                        'author': str(submission.author) if submission.author else '[deleted]',
                        'title': submission.title,
                        'body': submission.selftext or '',
                        'created_utc': post_time,
                        'url': f"https://reddit.com{submission.permalink}",
                        'score': submission.score,
                        'num_comments': submission.num_comments
                    })
            
            logger.info(f"Fetched {len(posts)} posts from r/{subreddit_name}")
            return posts
            
        except Exception as e:
            logger.error(f"Error fetching from r/{subreddit_name}: {str(e)}")
            return []
    
    def generate_content_hash(self, text: str) -> str:
        """
        Create hash of post content for deduplication
        
        Args:
            text: Post content to hash
            
        Returns:
            MD5 hash string
        """
        # Normalize text
        normalized = text.lower().strip()
        normalized = re.sub(r'\s+', ' ', normalized)  # Collapse whitespace
        normalized = re.sub(r'[^\w\s]', '', normalized)  # Remove punctuation
        
        return hashlib.md5(normalized.encode()).hexdigest()
    
    def is_duplicate(self, content_hash: str, lookback_days: int = 7) -> bool:
        """
        Check if similar content seen recently
        
        Args:
            content_hash: MD5 hash of normalized content
            lookback_days: How far back to check
            
        Returns:
            True if duplicate found
        """
        try:
            cutoff = datetime.now(timezone.utc) - timedelta(days=lookback_days)
            
            response = self.supabase.table("reddit_signals")\
                .select("id")\
                .eq("content_hash", content_hash)\
                .gte("created_at", cutoff.isoformat())\
                .limit(1)\
                .execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            logger.error(f"Error checking duplicate: {str(e)}")
            return False
    
    def quick_keyword_score(self, text: str, category: str) -> int:
        """
        Fast keyword-based pre-scoring (0-10)
        
        Args:
            text: Text to score
            category: Score category (urgency, budget, authority, pain)
            
        Returns:
            Score from 0-10
        """
        if category not in SIGNAL_KEYWORDS:
            return 0
        
        text_lower = text.lower()
        matches = sum(1 for keyword in SIGNAL_KEYWORDS[category] if keyword in text_lower)
        
        # Convert matches to 0-10 scale
        if matches == 0:
            return 0
        elif matches <= 2:
            return 3
        elif matches <= 4:
            return 6
        else:
            return 10
    
    def should_use_ai_scoring(self, quick_scores: Dict[str, int]) -> bool:
        """
        Determine if post needs AI analysis
        
        Logic:
        - If total quick score < 15, skip (too low quality)
        - If total quick score > 25, definitely analyze
        - If 15-25, analyze if any category > 5
        
        Args:
            quick_scores: Dictionary of category scores
            
        Returns:
            True if AI analysis warranted
        """
        total = sum(quick_scores.values())
        
        if total < 15:
            return False
        elif total > 25:
            return True
        
        # Check if any individual category is promising
        return any(score > 5 for score in quick_scores.values())
    
    def calculate_total_score(self, scores: Dict[str, int]) -> int:
        """
        Calculate weighted total score (0-100)
        
        Args:
            scores: Dictionary with urgency, budget, authority, pain scores
            
        Returns:
            Total score 0-100
        """
        total = 0
        for category, weight in SCORE_WEIGHTS.items():
            total += scores.get(category, 0) * weight / 10
        
        return int(total)
    
    def extract_entities(self, text: str) -> Dict:
        """
        Extract structured data from unstructured text
        
        Extracts:
        - Location (city, state, zip)
        - Company names mentioned
        - Problem type
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary of extracted entities
        """
        entities = {
            'location': None,
            'company_mentioned': None,
            'problem_type': None
        }
        
        # Location extraction (US-focused)
        location_pattern = r'\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\b|\b\d{5}\b'
        location_match = re.search(location_pattern, text)
        
        if location_match:
            if location_match.group(1):  # City, ST format
                entities['location'] = f"{location_match.group(1)}, {location_match.group(2)}"
            else:  # ZIP code
                entities['location'] = location_match.group(0)
        
        # Company name extraction
        company_pattern = r'\b([A-Z][a-zA-Z&\s]+(?:HVAC|Plumbing|Heating|Cooling|Services?))\b'
        company_match = re.search(company_pattern, text)
        
        if company_match:
            entities['company_mentioned'] = company_match.group(1).strip()
        
        # Problem type classification
        problem_keywords = {
            'no_answer': ['no answer', 'never picks up', 'voicemail', 'can\'t reach'],
            'slow_response': ['slow', 'takes forever', 'waiting', 'days to respond'],
            'poor_quality': ['terrible', 'bad work', 'incompetent', 'unprofessional'],
            'pricing': ['expensive', 'overcharged', 'price', 'quote'],
            'no_show': ['didn\'t show', 'no show', 'cancelled', 'stood up']
        }
        
        text_lower = text.lower()
        for problem_type, keywords in problem_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                entities['problem_type'] = problem_type
                break
        
        return entities
    
    def score_post(self, post: Dict) -> Dict:
        """
        Score a single post using keyword matching
        
        Args:
            post: Post dictionary
            
        Returns:
            Dictionary with scores and metadata
        """
        # Combine title and body for analysis
        full_text = f"{post['title']} {post['body']}"
        
        # Quick keyword scan
        quick_scores = {
            'urgency': self.quick_keyword_score(full_text, 'urgency'),
            'budget': self.quick_keyword_score(full_text, 'budget'),
            'authority': self.quick_keyword_score(full_text, 'authority'),
            'pain': self.quick_keyword_score(full_text, 'pain')
        }
        
        # For now, use keyword scores (AI scoring can be added later)
        final_scores = quick_scores
        total_score = self.calculate_total_score(final_scores)
        
        # Extract entities
        entities = self.extract_entities(full_text)
        
        # Generate content hash
        content_hash = self.generate_content_hash(full_text)
        
        return {
            'post_id': post['id'],
            'subreddit': post['subreddit'],
            'author': post['author'],
            'title': post['title'],
            'body': post['body'],
            'created_utc': post['created_utc'],
            'url': post['url'],
            'score': post['score'],
            'num_comments': post['num_comments'],
            'urgency_score': final_scores['urgency'],
            'budget_score': final_scores['budget'],
            'authority_score': final_scores['authority'],
            'pain_score': final_scores['pain'],
            'total_score': total_score,
            'scoring_method': 'keywords',
            'location': entities['location'],
            'company_mentioned': entities['company_mentioned'],
            'problem_type': entities['problem_type'],
            'content_hash': content_hash,
            'processed': True,
            'alerted': False
        }
    
    def save_signal(self, signal: Dict) -> Optional[str]:
        """
        Save signal to database
        
        Args:
            signal: Signal dictionary
            
        Returns:
            Signal ID if saved, None if duplicate or error
        """
        try:
            # Check for duplicate
            if self.is_duplicate(signal['content_hash']):
                logger.info(f"Skipping duplicate post: {signal['post_id']}")
                return None
            
            # Insert into database
            response = self.supabase.table("reddit_signals").insert(signal).execute()
            
            if response.data:
                signal_id = response.data[0]['id']
                logger.info(f"Saved signal {signal_id} with score {signal['total_score']}")
                return signal_id
            
            return None
            
        except Exception as e:
            logger.error(f"Error saving signal: {str(e)}")
            return None
    
    def process_subreddit(self, subreddit_name: str, hours: int = 24) -> Dict:
        """
        Process all recent posts from a subreddit
        
        Args:
            subreddit_name: Subreddit to process
            hours: Lookback period
            
        Returns:
            Processing statistics
        """
        stats = {
            'fetched': 0,
            'processed': 0,
            'skipped': 0,
            'high_score': 0,
            'saved': 0
        }
        
        # Fetch posts
        posts = self.fetch_recent_posts(subreddit_name, hours)
        stats['fetched'] = len(posts)
        
        # Process each post
        for post in posts:
            try:
                # Score the post
                signal = self.score_post(post)
                stats['processed'] += 1
                
                # Only save if score meets threshold
                if signal['total_score'] >= MIN_SCORE_THRESHOLD:
                    stats['high_score'] += 1
                    signal_id = self.save_signal(signal)
                    if signal_id:
                        stats['saved'] += 1
                else:
                    stats['skipped'] += 1
                    
            except Exception as e:
                logger.error(f"Error processing post {post['id']}: {str(e)}")
                continue
        
        logger.info(f"r/{subreddit_name} stats: {stats}")
        return stats
    
    def run_batch(self) -> Dict:
        """
        Run batch processing for all configured subreddits
        
        Returns:
            Combined statistics
        """
        logger.info("Starting Reddit batch processing")
        start_time = datetime.now()
        
        combined_stats = {
            'fetched': 0,
            'processed': 0,
            'skipped': 0,
            'high_score': 0,
            'saved': 0
        }
        
        for subreddit in SUBREDDITS:
            stats = self.process_subreddit(subreddit, LOOKBACK_HOURS)
            for key in combined_stats:
                combined_stats[key] += stats[key]
        
        processing_time = (datetime.now() - start_time).total_seconds()
        combined_stats['processing_time_seconds'] = int(processing_time)
        
        logger.info(f"Batch complete: {combined_stats}")
        return combined_stats


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run monitor
    monitor = RedditMonitor()
    stats = monitor.run_batch()
    
    print(f"\n✅ Reddit monitoring complete!")
    print(f"   Fetched: {stats['fetched']} posts")
    print(f"   Processed: {stats['processed']} posts")
    print(f"   High-score signals: {stats['high_score']}")
    print(f"   Saved: {stats['saved']} new signals")
    print(f"   Processing time: {stats['processing_time_seconds']}s")
