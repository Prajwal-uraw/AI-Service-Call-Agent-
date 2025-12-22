"""
Reddit Pain Signal Monitor with AI Enhancement
Fetches HVAC-related posts and uses both keyword + AI scoring
"""

import praw
import os
import hashlib
import re
import json
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional
import logging

from config.supabase_config import get_supabase
from classifiers.ai_scorer import AISignalScorer

logger = logging.getLogger(__name__)

# Configuration
SUBREDDITS = ['HVAC', 'homeowners', 'Plumbing', 'HomeImprovement', 'hvacadvice']
LOOKBACK_HOURS = 24
MIN_SCORE_THRESHOLD = 70
USE_AI_SCORING = os.getenv("USE_AI_SCORING", "true").lower() == "true"

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
        'uncomfortable', 'unbearable', 'suffering', 'miserable'
    ]
}

# Location patterns
LOCATION_PATTERNS = [
    r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\b',  # City, ST
    r'\b([A-Z]{2})\b(?:\s+area)?',  # ST or ST area
    r'\b(zip|zipcode|postal)\s*:?\s*(\d{5})\b'  # Zip code
]


class RedditMonitorAI:
    """Reddit monitor with AI-enhanced scoring"""
    
    def __init__(self):
        """Initialize Reddit client and AI scorer"""
        self.reddit = self._init_reddit()
        self.supabase = get_supabase()
        
        # Initialize AI scorer if enabled
        self.ai_scorer = None
        if USE_AI_SCORING:
            try:
                self.ai_scorer = AISignalScorer()
                logger.info("✅ AI scoring enabled")
            except Exception as e:
                logger.warning(f"⚠️ AI scoring disabled: {str(e)}")
                self.ai_scorer = None
    
    def _init_reddit(self) -> praw.Reddit:
        """Initialize Reddit API client"""
        client_id = os.getenv("REDDIT_CLIENT_ID")
        client_secret = os.getenv("REDDIT_CLIENT_SECRET")
        user_agent = os.getenv("REDDIT_USER_AGENT", "PainSignalBot/1.0")
        
        if not client_id or not client_secret:
            raise ValueError("Reddit API credentials not configured")
        
        return praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
    
    def fetch_recent_posts(
        self,
        subreddit_name: str,
        hours_back: int = LOOKBACK_HOURS
    ) -> List[Dict]:
        """Fetch recent posts from a subreddit"""
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours_back)
            posts = []
            
            for submission in subreddit.new(limit=100):
                post_time = datetime.fromtimestamp(submission.created_utc, tz=timezone.utc)
                
                if post_time < cutoff_time:
                    break
                
                # Quick pre-filter: must contain HVAC-related terms
                text = f"{submission.title} {submission.selftext}".lower()
                if not self._is_hvac_related(text):
                    continue
                
                posts.append({
                    'post_id': submission.id,
                    'subreddit': subreddit_name,
                    'author': str(submission.author) if submission.author else '[deleted]',
                    'title': submission.title,
                    'body': submission.selftext,
                    'created_utc': post_time,
                    'url': f"https://reddit.com{submission.permalink}",
                    'score': submission.score,
                    'num_comments': submission.num_comments
                })
            
            logger.info(f"📥 Fetched {len(posts)} posts from r/{subreddit_name}")
            return posts
            
        except Exception as e:
            logger.error(f"❌ Error fetching from r/{subreddit_name}: {str(e)}")
            return []
    
    def _is_hvac_related(self, text: str) -> bool:
        """Quick check if text is HVAC-related"""
        hvac_terms = [
            'hvac', 'ac', 'air condition', 'furnace', 'heat pump',
            'heating', 'cooling', 'thermostat', 'duct', 'ventilation',
            'refrigerant', 'compressor', 'condenser', 'evaporator'
        ]
        return any(term in text for term in hvac_terms)
    
    def score_post_keywords(self, title: str, body: str) -> Dict[str, int]:
        """Score post using keyword matching (baseline)"""
        text = f"{title} {body}".lower()
        
        scores = {}
        for category, keywords in SIGNAL_KEYWORDS.items():
            score = 0
            for keyword in keywords:
                if keyword in text:
                    score += 1
            
            # Normalize to 0-10 scale
            max_possible = len(keywords)
            normalized = min(10, int((score / max_possible) * 20))
            scores[category] = normalized
        
        return scores
    
    def score_post_ai(
        self,
        title: str,
        body: str,
        metadata: Dict
    ) -> Optional[Dict]:
        """Score post using AI (GPT-4)"""
        if not self.ai_scorer:
            return None
        
        try:
            return self.ai_scorer.score_signal(
                title=title,
                content=body,
                source="reddit",
                metadata=metadata
            )
        except Exception as e:
            logger.error(f"❌ AI scoring failed: {str(e)}")
            return None
    
    def extract_location(self, text: str) -> Optional[str]:
        """Extract location from text"""
        for pattern in LOCATION_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        return None
    
    def extract_company(self, text: str) -> Optional[str]:
        """Extract company mentions"""
        company_patterns = [
            r'(?:called|hired|used)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:HVAC|Heating|Cooling|Plumbing))',
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:came out|quoted|installed)'
        ]
        
        for pattern in company_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        return None
    
    def extract_problem_type(self, text: str) -> Optional[str]:
        """Extract problem type"""
        text_lower = text.lower()
        
        problem_types = {
            'no_cooling': ['no cooling', 'not cooling', 'no cold air', 'ac not working'],
            'no_heating': ['no heat', 'not heating', 'no warm air', 'furnace not working'],
            'noise': ['loud', 'noisy', 'grinding', 'squealing', 'banging'],
            'leak': ['leak', 'leaking', 'water damage', 'dripping'],
            'efficiency': ['high bill', 'expensive', 'inefficient', 'running constantly'],
            'installation': ['install', 'replace', 'new system', 'upgrade']
        }
        
        for problem, keywords in problem_types.items():
            if any(kw in text_lower for kw in keywords):
                return problem
        
        return 'other'
    
    def generate_content_hash(self, title: str, body: str) -> str:
        """Generate MD5 hash for deduplication"""
        content = f"{title}{body}".encode('utf-8')
        return hashlib.md5(content).hexdigest()
    
    def check_duplicate(self, content_hash: str) -> bool:
        """Check if signal already exists"""
        try:
            result = self.supabase.table("reddit_signals")\
                .select("id")\
                .eq("content_hash", content_hash)\
                .execute()
            
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"❌ Duplicate check failed: {str(e)}")
            return False
    
    def save_signal(self, post: Dict, keyword_scores: Dict, ai_scores: Optional[Dict]) -> bool:
        """Save signal to database"""
        try:
            # Calculate keyword total score
            keyword_total = sum(
                keyword_scores.get(cat, 0) * (SCORE_WEIGHTS[cat] / 10)
                for cat in SCORE_WEIGHTS.keys()
            )
            
            # Prepare base data
            signal_data = {
                'post_id': post['post_id'],
                'subreddit': post['subreddit'],
                'author': post['author'],
                'title': post['title'],
                'body': post['body'],
                'created_utc': post['created_utc'].isoformat(),
                'url': post['url'],
                'score': post['score'],
                'num_comments': post['num_comments'],
                
                # Keyword scores
                'urgency_score': keyword_scores.get('urgency', 0),
                'budget_score': keyword_scores.get('budget', 0),
                'authority_score': keyword_scores.get('authority', 0),
                'pain_score': keyword_scores.get('pain', 0),
                'total_score': int(keyword_total),
                
                # Extracted entities
                'location': self.extract_location(f"{post['title']} {post['body']}"),
                'company_mentioned': self.extract_company(f"{post['title']} {post['body']}"),
                'problem_type': self.extract_problem_type(f"{post['title']} {post['body']}"),
                
                # Deduplication
                'content_hash': self.generate_content_hash(post['title'], post['body']),
                
                # Processing metadata
                'processed': True,
                'scoring_method': 'ai' if ai_scores else 'keywords'
            }
            
            # Add AI scores if available
            if ai_scores:
                signal_data.update({
                    'ai_urgency_score': ai_scores.get('ai_urgency_score', 0),
                    'ai_budget_score': ai_scores.get('ai_budget_score', 0),
                    'ai_authority_score': ai_scores.get('ai_authority_score', 0),
                    'ai_pain_score': ai_scores.get('ai_pain_score', 0),
                    'ai_total_score': ai_scores.get('ai_total_score', 0),
                    'ai_tier': ai_scores.get('ai_tier', 'cold'),
                    'sentiment': ai_scores.get('sentiment'),
                    'intent': ai_scores.get('intent'),
                    'lead_quality': ai_scores.get('lead_quality'),
                    'key_indicators': json.dumps(ai_scores.get('key_indicators', [])),
                    'recommended_action': ai_scores.get('recommended_action'),
                    'ai_reasoning': ai_scores.get('reasoning'),
                    'ai_confidence': ai_scores.get('confidence'),
                    'ai_analyzed_at': ai_scores.get('analyzed_at'),
                    'ai_model': ai_scores.get('model')
                })
            
            # Insert into database
            self.supabase.table("reddit_signals").insert(signal_data).execute()
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to save signal: {str(e)}")
            return False
    
    def process_posts(self, posts: List[Dict]) -> Dict[str, int]:
        """Process and score posts"""
        stats = {
            'total': len(posts),
            'duplicates': 0,
            'low_score': 0,
            'saved': 0,
            'ai_scored': 0
        }
        
        for post in posts:
            # Check for duplicates
            content_hash = self.generate_content_hash(post['title'], post['body'])
            if self.check_duplicate(content_hash):
                stats['duplicates'] += 1
                continue
            
            # Keyword scoring (always done)
            keyword_scores = self.score_post_keywords(post['title'], post['body'])
            keyword_total = sum(
                keyword_scores.get(cat, 0) * (SCORE_WEIGHTS[cat] / 10)
                for cat in SCORE_WEIGHTS.keys()
            )
            
            # AI scoring (if enabled and keyword score is promising)
            ai_scores = None
            if self.ai_scorer and keyword_total >= 40:  # Only AI score promising signals
                ai_scores = self.score_post_ai(
                    title=post['title'],
                    body=post['body'],
                    metadata={
                        'subreddit': post['subreddit'],
                        'author': post['author'],
                        'upvotes': post['score']
                    }
                )
                if ai_scores:
                    stats['ai_scored'] += 1
            
            # Determine if signal is worth saving
            final_score = ai_scores.get('ai_total_score', keyword_total) if ai_scores else keyword_total
            
            if final_score >= MIN_SCORE_THRESHOLD:
                if self.save_signal(post, keyword_scores, ai_scores):
                    stats['saved'] += 1
                    logger.info(f"✅ Saved signal: {post['title'][:50]}... (Score: {final_score})")
            else:
                stats['low_score'] += 1
        
        return stats
    
    def run(self) -> Dict[str, any]:
        """Main execution"""
        logger.info("🚀 Starting Reddit pain signal monitor with AI enhancement")
        
        all_stats = {
            'total_posts': 0,
            'total_duplicates': 0,
            'total_low_score': 0,
            'total_saved': 0,
            'total_ai_scored': 0,
            'by_subreddit': {}
        }
        
        for subreddit in SUBREDDITS:
            posts = self.fetch_recent_posts(subreddit)
            stats = self.process_posts(posts)
            
            all_stats['total_posts'] += stats['total']
            all_stats['total_duplicates'] += stats['duplicates']
            all_stats['total_low_score'] += stats['low_score']
            all_stats['total_saved'] += stats['saved']
            all_stats['total_ai_scored'] += stats['ai_scored']
            all_stats['by_subreddit'][subreddit] = stats
        
        logger.info("=" * 60)
        logger.info("📊 Reddit Monitor Summary")
        logger.info("=" * 60)
        logger.info(f"Total posts fetched: {all_stats['total_posts']}")
        logger.info(f"Duplicates skipped: {all_stats['total_duplicates']}")
        logger.info(f"Low score filtered: {all_stats['total_low_score']}")
        logger.info(f"AI scored: {all_stats['total_ai_scored']}")
        logger.info(f"High-value saved: {all_stats['total_saved']}")
        logger.info("=" * 60)
        
        return all_stats


def main():
    """CLI entry point"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    monitor = RedditMonitorAI()
    stats = monitor.run()
    
    print("\n" + "=" * 60)
    print("✅ Reddit Monitor Complete")
    print("=" * 60)
    print(f"Saved {stats['total_saved']} high-value signals")
    print(f"AI scored {stats['total_ai_scored']} signals")
    print("=" * 60)


if __name__ == "__main__":
    main()
