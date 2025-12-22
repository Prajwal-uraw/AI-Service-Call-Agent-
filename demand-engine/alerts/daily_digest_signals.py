"""
Daily Digest for Pain Signals
Sends email alerts for high-value signals detected
"""

import os
from datetime import datetime, timedelta, timezone
from typing import List, Dict
import logging

from config.supabase_config import get_supabase
from email_service.resend_client import ResendEmailClient

logger = logging.getLogger(__name__)


class SignalDigest:
    """Generate and send daily digest of pain signals"""
    
    def __init__(self):
        self.supabase = get_supabase()
        self.email_client = ResendEmailClient()
        self.alert_email = os.getenv("ALERT_EMAIL_TO", "alerts@kestrel.ai")
    
    def get_unalerted_signals(self, min_score: int = 70) -> List[Dict]:
        """
        Get high-score signals that haven't been alerted yet
        
        Args:
            min_score: Minimum total score threshold
            
        Returns:
            List of signal dictionaries
        """
        try:
            # Query unified_signals view for unalerted high-score signals
            response = self.supabase.rpc(
                'get_unalerted_signals',
                {'min_score': min_score}
            ).execute()
            
            if response.data:
                return response.data
            
            # Fallback: query reddit_signals directly
            response = self.supabase.table("reddit_signals")\
                .select("*")\
                .eq("alerted", False)\
                .gte("total_score", min_score)\
                .order("total_score", desc=True)\
                .limit(50)\
                .execute()
            
            return response.data
            
        except Exception as e:
            logger.error(f"Error fetching unalerted signals: {str(e)}")
            return []
    
    def get_daily_stats(self) -> Dict:
        """
        Get statistics for today's signal processing
        
        Returns:
            Dictionary of stats
        """
        try:
            today = datetime.now(timezone.utc).date()
            
            response = self.supabase.table("processing_stats")\
                .select("*")\
                .eq("run_date", today.isoformat())\
                .execute()
            
            if not response.data:
                return {
                    'posts_fetched': 0,
                    'posts_processed': 0,
                    'high_score_signals': 0,
                    'alerts_sent': 0
                }
            
            # Aggregate stats across all sources
            stats = {
                'posts_fetched': sum(s['posts_fetched'] for s in response.data),
                'posts_processed': sum(s['posts_processed'] for s in response.data),
                'high_score_signals': sum(s['high_score_signals'] for s in response.data),
                'alerts_sent': sum(s['alerts_sent'] for s in response.data)
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Error fetching daily stats: {str(e)}")
            return {}
    
    def generate_digest_html(self, signals: List[Dict], stats: Dict) -> str:
        """
        Generate HTML email for daily digest
        
        Args:
            signals: List of high-score signals
            stats: Daily processing statistics
            
        Returns:
            HTML string
        """
        signal_rows = ""
        for signal in signals[:20]:  # Top 20 signals
            tier_color = "#dc2626" if signal['total_score'] >= 85 else "#ea580c" if signal['total_score'] >= 70 else "#2563eb"
            
            signal_rows += f"""
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; font-weight: 600; color: {tier_color};">
                    {signal['total_score']}
                </td>
                <td style="padding: 12px;">
                    <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">
                        {signal.get('signal_text', signal.get('title', 'No title'))[:100]}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">
                        {signal['source'].upper()} • {signal.get('source_detail', 'N/A')}
                        {f" • {signal['location']}" if signal.get('location') else ""}
                    </div>
                </td>
                <td style="padding: 12px;">
                    <a href="{signal.get('url', '#')}" style="color: #2563eb; text-decoration: none; font-size: 14px;">
                        View →
                    </a>
                </td>
            </tr>
            """
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kestrel Daily Signal Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Kestrel Pain Signal Digest</h1>
            <p style="color: #93c5fd; margin: 10px 0 0 0; font-size: 14px;">
                {datetime.now(timezone.utc).strftime('%B %d, %Y')}
            </p>
        </div>
        
        <!-- Stats -->
        <div style="padding: 30px 20px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center;">
                <div>
                    <div style="font-size: 28px; font-weight: bold; color: #1e3a8a;">
                        {stats.get('posts_fetched', 0)}
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Posts Fetched</div>
                </div>
                <div>
                    <div style="font-size: 28px; font-weight: bold; color: #2563eb;">
                        {stats.get('posts_processed', 0)}
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Processed</div>
                </div>
                <div>
                    <div style="font-size: 28px; font-weight: bold; color: #ea580c;">
                        {stats.get('high_score_signals', 0)}
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">High Score</div>
                </div>
                <div>
                    <div style="font-size: 28px; font-weight: bold; color: #16a34a;">
                        {len(signals)}
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">New Alerts</div>
                </div>
            </div>
        </div>
        
        <!-- Signals Table -->
        <div style="padding: 30px 20px;">
            <h2 style="font-size: 20px; color: #111827; margin: 0 0 20px 0;">
                🔥 High-Value Signals ({len(signals)})
            </h2>
            
            {f'''
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Score</th>
                        <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Signal</th>
                        <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {signal_rows}
                </tbody>
            </table>
            ''' if signals else '<p style="text-align: center; color: #6b7280; padding: 40px;">No new high-value signals today.</p>'}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
                Kestrel Pain Signal Aggregator<br>
                Automated HVAC Lead Detection System
            </p>
        </div>
        
    </div>
</body>
</html>
        """
        
        return html
    
    def mark_as_alerted(self, signal_ids: List[str], source: str = 'reddit'):
        """
        Mark signals as alerted in database
        
        Args:
            signal_ids: List of signal IDs
            source: Signal source (reddit, facebook, etc.)
        """
        try:
            table_name = f"{source}_signals"
            
            for signal_id in signal_ids:
                self.supabase.table(table_name)\
                    .update({"alerted": True})\
                    .eq("id", signal_id)\
                    .execute()
            
            logger.info(f"Marked {len(signal_ids)} signals as alerted")
            
        except Exception as e:
            logger.error(f"Error marking signals as alerted: {str(e)}")
    
    async def send_digest(self) -> Dict:
        """
        Generate and send daily digest email
        
        Returns:
            Dictionary with send status and stats
        """
        try:
            # Get unalerted signals
            signals = self.get_unalerted_signals()
            
            # Get daily stats
            stats = self.get_daily_stats()
            
            if not signals:
                logger.info("No new signals to alert")
                return {
                    "sent": False,
                    "reason": "no_signals",
                    "signal_count": 0
                }
            
            # Generate HTML
            html_content = self.generate_digest_html(signals, stats)
            
            # Send email
            subject = f"🔥 Kestrel Daily Digest: {len(signals)} New High-Value Signals"
            
            await self.email_client.send_email(
                to_email=self.alert_email,
                subject=subject,
                html_content=html_content
            )
            
            # Mark signals as alerted
            signal_ids = [s['id'] for s in signals]
            self.mark_as_alerted(signal_ids, source='reddit')
            
            # Log to alert_history
            for signal in signals:
                self.supabase.table("alert_history").insert({
                    "signal_source": signal.get('source', 'reddit'),
                    "signal_id": signal['id'],
                    "alert_type": "email",
                    "recipient": self.alert_email,
                    "subject": subject,
                    "status": "sent"
                }).execute()
            
            logger.info(f"Sent digest with {len(signals)} signals to {self.alert_email}")
            
            return {
                "sent": True,
                "signal_count": len(signals),
                "recipient": self.alert_email
            }
            
        except Exception as e:
            logger.error(f"Error sending digest: {str(e)}")
            return {
                "sent": False,
                "reason": "error",
                "error": str(e)
            }


if __name__ == "__main__":
    import asyncio
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Send digest
    digest = SignalDigest()
    result = asyncio.run(digest.send_digest())
    
    if result['sent']:
        print(f"\n✅ Digest sent successfully!")
        print(f"   Signals: {result['signal_count']}")
        print(f"   Recipient: {result['recipient']}")
    else:
        print(f"\n⚠️  Digest not sent: {result.get('reason', 'unknown')}")
