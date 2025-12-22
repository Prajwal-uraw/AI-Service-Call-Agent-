"""
Slack Notification Service
Send alerts for high-value pain signals to Slack
"""

import os
import httpx
from typing import Dict, List, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class SlackNotifier:
    """Send pain signal alerts to Slack"""
    
    def __init__(self):
        self.webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        self.enabled = bool(self.webhook_url)
        
        if not self.enabled:
            print("⚠️ Slack notifications disabled (no webhook URL configured)")
    
    async def send_signal_alert(self, signal: Dict) -> bool:
        """
        Send a single signal alert to Slack
        
        Args:
            signal: Signal data dictionary
            
        Returns:
            True if sent successfully
        """
        if not self.enabled:
            return False
        
        try:
            # Build Slack message
            message = self._build_signal_message(signal)
            
            # Send to Slack
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.webhook_url,
                    json=message,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    print(f"✅ Slack alert sent for signal {signal['id']}")
                    return True
                else:
                    print(f"❌ Slack alert failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Error sending Slack alert: {str(e)}")
            return False
    
    async def send_batch_alert(self, signals: List[Dict]) -> bool:
        """
        Send batch alert for multiple signals
        
        Args:
            signals: List of signal dictionaries
            
        Returns:
            True if sent successfully
        """
        if not self.enabled or not signals:
            return False
        
        try:
            # Build batch message
            message = self._build_batch_message(signals)
            
            # Send to Slack
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.webhook_url,
                    json=message,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    print(f"✅ Slack batch alert sent ({len(signals)} signals)")
                    return True
                else:
                    print(f"❌ Slack batch alert failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Error sending Slack batch alert: {str(e)}")
            return False
    
    def _build_signal_message(self, signal: Dict) -> Dict:
        """Build Slack message for a single signal"""
        
        # Determine urgency color
        score = signal.get("combined_score") or signal.get("keyword_total", 0)
        if score >= 85:
            color = "#dc2626"  # Red
            urgency = "🔥 CRITICAL"
        elif score >= 70:
            color = "#ea580c"  # Orange
            urgency = "⚡ HIGH PRIORITY"
        else:
            color = "#eab308"  # Yellow
            urgency = "⚠️ MEDIUM"
        
        # Build title
        title = signal.get("title") or "Untitled Signal"
        source = signal.get("source", "unknown").upper()
        
        # Build content preview
        content = signal.get("content", "")
        preview = content[:200] + "..." if len(content) > 200 else content
        
        # Build fields
        fields = [
            {
                "title": "Score",
                "value": f"{int(score)}/100",
                "short": True
            },
            {
                "title": "Source",
                "value": source,
                "short": True
            }
        ]
        
        # Add location if available
        if signal.get("location"):
            fields.append({
                "title": "Location",
                "value": signal["location"],
                "short": True
            })
        
        # Add intent if available
        if signal.get("intent"):
            fields.append({
                "title": "Intent",
                "value": signal["intent"].replace("_", " ").title(),
                "short": True
            })
        
        # Add sentiment if available
        if signal.get("sentiment"):
            sentiment_emoji = {
                "desperate": "😠",
                "frustrated": "😤",
                "negative": "😐",
                "neutral": "😶",
                "positive": "😊"
            }
            emoji = sentiment_emoji.get(signal["sentiment"], "")
            fields.append({
                "title": "Sentiment",
                "value": f"{emoji} {signal['sentiment'].title()}",
                "short": True
            })
        
        # Add recommended action if available
        if signal.get("recommended_action"):
            action = signal["recommended_action"].replace("_", " ").title()
            fields.append({
                "title": "Recommended Action",
                "value": action,
                "short": False
            })
        
        # Build attachment
        attachment = {
            "color": color,
            "title": f"{urgency}: {title}",
            "text": preview,
            "fields": fields,
            "footer": f"Signal ID: {signal['id'][:8]}",
            "ts": int(datetime.now().timestamp())
        }
        
        # Add URL if available
        if signal.get("url"):
            attachment["title_link"] = signal["url"]
        
        return {
            "text": f"New High-Value Pain Signal Detected",
            "attachments": [attachment]
        }
    
    def _build_batch_message(self, signals: List[Dict]) -> Dict:
        """Build Slack message for multiple signals"""
        
        # Count by tier
        hot_count = sum(1 for s in signals if (s.get("combined_score") or s.get("keyword_total", 0)) >= 85)
        high_count = sum(1 for s in signals if 70 <= (s.get("combined_score") or s.get("keyword_total", 0)) < 85)
        
        # Build summary text
        summary = f"*{len(signals)} New High-Value Signals Detected*\n"
        if hot_count > 0:
            summary += f"🔥 {hot_count} Critical (85+)\n"
        if high_count > 0:
            summary += f"⚡ {high_count} High Priority (70-84)\n"
        
        # Build attachments for top 5 signals
        attachments = []
        for signal in sorted(signals, key=lambda s: s.get("combined_score") or s.get("keyword_total", 0), reverse=True)[:5]:
            score = signal.get("combined_score") or signal.get("keyword_total", 0)
            color = "#dc2626" if score >= 85 else "#ea580c"
            
            title = signal.get("title") or "Untitled Signal"
            source = signal.get("source", "unknown").upper()
            
            attachment = {
                "color": color,
                "title": f"{title} ({int(score)}/100)",
                "text": f"Source: {source}",
                "footer": f"ID: {signal['id'][:8]}",
                "ts": int(datetime.now().timestamp())
            }
            
            if signal.get("url"):
                attachment["title_link"] = signal["url"]
            
            attachments.append(attachment)
        
        # Add "view more" message if there are more than 5
        if len(signals) > 5:
            attachments.append({
                "color": "#6b7280",
                "text": f"_+ {len(signals) - 5} more signals. View full list in dashboard._"
            })
        
        return {
            "text": summary,
            "attachments": attachments
        }
    
    async def send_daily_summary(self, stats: Dict) -> bool:
        """
        Send daily summary statistics
        
        Args:
            stats: Statistics dictionary
            
        Returns:
            True if sent successfully
        """
        if not self.enabled:
            return False
        
        try:
            message = {
                "text": "*Daily Pain Signal Summary*",
                "attachments": [{
                    "color": "#3b82f6",
                    "fields": [
                        {
                            "title": "Total Signals",
                            "value": str(stats.get("total_signals", 0)),
                            "short": True
                        },
                        {
                            "title": "High Value (70+)",
                            "value": str(stats.get("high_value_count", 0)),
                            "short": True
                        },
                        {
                            "title": "Converted to Leads",
                            "value": str(stats.get("converted_count", 0)),
                            "short": True
                        },
                        {
                            "title": "Conversion Rate",
                            "value": f"{stats.get('conversion_rate', 0):.1f}%",
                            "short": True
                        },
                        {
                            "title": "Avg Score",
                            "value": f"{stats.get('avg_score', 0):.1f}",
                            "short": True
                        },
                        {
                            "title": "Top Source",
                            "value": stats.get("top_source", "N/A").upper(),
                            "short": True
                        }
                    ],
                    "footer": "Kestrel Pain Signal Aggregator",
                    "ts": int(datetime.now().timestamp())
                }]
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.webhook_url,
                    json=message,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    print("✅ Slack daily summary sent")
                    return True
                else:
                    print(f"❌ Slack daily summary failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Error sending Slack daily summary: {str(e)}")
            return False


# Sync wrapper for use in non-async contexts
def send_slack_alert_sync(signal: Dict) -> bool:
    """Synchronous wrapper for sending Slack alerts"""
    import asyncio
    notifier = SlackNotifier()
    return asyncio.run(notifier.send_signal_alert(signal))


if __name__ == "__main__":
    # Test the notifier
    import asyncio
    
    test_signal = {
        "id": "test-123-456",
        "title": "HVAC System Completely Down - Emergency!",
        "content": "Our entire HVAC system failed this morning. Office temperature is 85°F and rising. Need immediate help!",
        "source": "reddit",
        "combined_score": 92,
        "keyword_total": 85,
        "location": "Austin, TX",
        "intent": "emergency",
        "sentiment": "desperate",
        "recommended_action": "immediate_contact",
        "url": "https://reddit.com/r/hvac/test"
    }
    
    async def test():
        notifier = SlackNotifier()
        if notifier.enabled:
            await notifier.send_signal_alert(test_signal)
        else:
            print("Set SLACK_WEBHOOK_URL environment variable to test")
    
    asyncio.run(test())
