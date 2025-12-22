"""
Lead Converter Service
Automatically converts high-value pain signals into calculator leads
"""

import os
from datetime import datetime, timezone
from typing import Dict, Optional, List
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class LeadConverter:
    """Convert pain signals to calculator leads"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing Supabase credentials")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    def extract_lead_data(self, signal: Dict) -> Dict:
        """
        Extract lead information from signal data
        
        Args:
            signal: Signal record from database
            
        Returns:
            Dictionary with lead fields
        """
        # Extract location information
        location = signal.get("location", "")
        city = ""
        state = ""
        
        if location:
            # Try to parse "City, State" format
            parts = location.split(",")
            if len(parts) >= 2:
                city = parts[0].strip()
                state = parts[1].strip()
            elif len(parts) == 1:
                city = parts[0].strip()
        
        # Extract company name
        company_name = signal.get("company_mentioned") or "Unknown Company"
        
        # Determine lead source
        source_map = {
            "reddit": "Reddit Pain Signal",
            "job_board": "Job Board Signal",
            "licensing": "Licensing Board Signal",
            "facebook": "Facebook Signal"
        }
        source = source_map.get(signal.get("source", ""), "Pain Signal")
        
        # Calculate lead quality score
        combined_score = signal.get("combined_score") or signal.get("keyword_total", 0)
        
        # Map to lead quality
        if combined_score >= 85:
            lead_quality = "hot"
        elif combined_score >= 70:
            lead_quality = "warm"
        elif combined_score >= 50:
            lead_quality = "qualified"
        else:
            lead_quality = "cold"
        
        # Extract problem type
        problem_type = signal.get("problem_type") or signal.get("intent", "general_inquiry")
        
        # Build notes from signal content
        notes = self._build_lead_notes(signal)
        
        return {
            "company_name": company_name,
            "city": city,
            "state": state,
            "source": source,
            "lead_quality": lead_quality,
            "problem_type": problem_type,
            "notes": notes,
            "signal_id": signal.get("id"),
            "signal_source": signal.get("source"),
            "signal_url": signal.get("url"),
            "combined_score": combined_score
        }
    
    def _build_lead_notes(self, signal: Dict) -> str:
        """Build comprehensive notes from signal data"""
        notes_parts = []
        
        # Add signal content preview
        content = signal.get("content", "")
        if content:
            preview = content[:500] + "..." if len(content) > 500 else content
            notes_parts.append(f"Signal Content:\n{preview}\n")
        
        # Add AI analysis if available
        if signal.get("ai_reasoning"):
            notes_parts.append(f"AI Analysis:\n{signal['ai_reasoning']}\n")
        
        # Add key indicators
        if signal.get("key_indicators"):
            indicators = ", ".join(signal["key_indicators"])
            notes_parts.append(f"Key Indicators: {indicators}\n")
        
        # Add sentiment and intent
        if signal.get("sentiment"):
            notes_parts.append(f"Sentiment: {signal['sentiment']}")
        
        if signal.get("intent"):
            notes_parts.append(f"Intent: {signal['intent'].replace('_', ' ')}")
        
        # Add recommended action
        if signal.get("recommended_action"):
            action = signal["recommended_action"].replace("_", " ")
            notes_parts.append(f"Recommended Action: {action}")
        
        # Add scores
        keyword_score = signal.get("keyword_total", 0)
        ai_score = signal.get("ai_total")
        if ai_score:
            notes_parts.append(f"\nScores: Keyword={keyword_score}, AI={round(ai_score)}")
        else:
            notes_parts.append(f"\nScore: {keyword_score} (keyword only)")
        
        return "\n".join(notes_parts)
    
    def convert_signal_to_lead(self, signal_id: str) -> Optional[Dict]:
        """
        Convert a single signal to a lead
        
        Args:
            signal_id: UUID of the signal
            
        Returns:
            Created lead record or None if failed
        """
        try:
            # Fetch signal from unified view
            signal_response = self.supabase.rpc(
                "get_signal_detail",
                {"signal_id": signal_id}
            ).execute()
            
            if not signal_response.data:
                print(f"❌ Signal not found: {signal_id}")
                return None
            
            signal = signal_response.data[0] if isinstance(signal_response.data, list) else signal_response.data
            
            # Check if already converted
            if signal.get("converted_to_lead"):
                print(f"⚠️ Signal already converted: {signal_id}")
                return None
            
            # Extract lead data
            lead_data = self.extract_lead_data(signal)
            
            # Create lead record
            lead_record = {
                "session_id": f"signal_{signal_id[:8]}_{int(datetime.now(timezone.utc).timestamp())}",
                "company_name": lead_data["company_name"],
                "city": lead_data["city"],
                "state": lead_data["state"],
                "source": lead_data["source"],
                "lead_quality": lead_data["lead_quality"],
                "notes": lead_data["notes"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Insert lead
            lead_response = self.supabase.table("calculator_submissions").insert(lead_record).execute()
            
            if not lead_response.data:
                print(f"❌ Failed to create lead for signal: {signal_id}")
                return None
            
            created_lead = lead_response.data[0]
            
            # Mark signal as converted
            source_table = f"{signal['source']}_signals"
            self.supabase.table(source_table).update({
                "converted_to_lead": True,
                "lead_id": created_lead["id"]
            }).eq("id", signal_id).execute()
            
            print(f"✅ Converted signal {signal_id} to lead {created_lead['id']}")
            return created_lead
            
        except Exception as e:
            print(f"❌ Error converting signal {signal_id}: {str(e)}")
            return None
    
    def auto_convert_high_value_signals(
        self,
        min_score: int = 70,
        limit: int = 50
    ) -> List[Dict]:
        """
        Automatically convert high-value unalerted signals to leads
        
        Args:
            min_score: Minimum combined score threshold
            limit: Maximum number of signals to convert
            
        Returns:
            List of created lead records
        """
        try:
            print(f"🔍 Finding high-value signals (score >= {min_score})...")
            
            # Get high-value pending signals
            signals_response = self.supabase.rpc(
                "get_high_value_pending_signals",
                {"min_score": min_score, "max_results": limit}
            ).execute()
            
            if not signals_response.data:
                print("ℹ️ No high-value signals found")
                return []
            
            signals = signals_response.data
            print(f"📊 Found {len(signals)} high-value signals")
            
            converted_leads = []
            
            for signal in signals:
                # Skip if already converted
                if signal.get("converted_to_lead"):
                    continue
                
                # Convert to lead
                lead = self.convert_signal_to_lead(signal["id"])
                if lead:
                    converted_leads.append(lead)
            
            print(f"✅ Converted {len(converted_leads)} signals to leads")
            return converted_leads
            
        except Exception as e:
            print(f"❌ Error in auto-conversion: {str(e)}")
            return []
    
    def get_conversion_stats(self, days: int = 7) -> Dict:
        """
        Get signal-to-lead conversion statistics
        
        Args:
            days: Number of days to look back
            
        Returns:
            Dictionary with conversion stats
        """
        try:
            stats_response = self.supabase.rpc(
                "get_signal_conversion_stats",
                {"days_back": days}
            ).execute()
            
            if stats_response.data:
                return stats_response.data[0] if isinstance(stats_response.data, list) else stats_response.data
            
            return {
                "total_signals": 0,
                "converted_signals": 0,
                "conversion_rate": 0.0,
                "avg_score_converted": 0.0,
                "avg_score_not_converted": 0.0
            }
            
        except Exception as e:
            print(f"❌ Error fetching conversion stats: {str(e)}")
            return {}


# Helper function for database
def create_conversion_functions_sql():
    """SQL to add conversion tracking to signals tables"""
    return """
    -- Add conversion tracking columns to signal tables
    ALTER TABLE reddit_signals ADD COLUMN IF NOT EXISTS converted_to_lead BOOLEAN DEFAULT FALSE;
    ALTER TABLE reddit_signals ADD COLUMN IF NOT EXISTS lead_id UUID;
    
    ALTER TABLE job_board_signals ADD COLUMN IF NOT EXISTS converted_to_lead BOOLEAN DEFAULT FALSE;
    ALTER TABLE job_board_signals ADD COLUMN IF NOT EXISTS lead_id UUID;
    
    ALTER TABLE licensing_signals ADD COLUMN IF NOT EXISTS converted_to_lead BOOLEAN DEFAULT FALSE;
    ALTER TABLE licensing_signals ADD COLUMN IF NOT EXISTS lead_id UUID;
    
    ALTER TABLE facebook_signals ADD COLUMN IF NOT EXISTS converted_to_lead BOOLEAN DEFAULT FALSE;
    ALTER TABLE facebook_signals ADD COLUMN IF NOT EXISTS lead_id UUID;
    
    -- Function to get signal detail (used by converter)
    CREATE OR REPLACE FUNCTION get_signal_detail(signal_id UUID)
    RETURNS TABLE (
        id UUID,
        source TEXT,
        signal_id TEXT,
        title TEXT,
        content TEXT,
        url TEXT,
        location TEXT,
        company_mentioned TEXT,
        problem_type TEXT,
        keyword_total INTEGER,
        ai_total NUMERIC,
        combined_score NUMERIC,
        sentiment TEXT,
        intent TEXT,
        ai_reasoning TEXT,
        key_indicators TEXT[],
        recommended_action TEXT,
        converted_to_lead BOOLEAN,
        lead_id UUID
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            s.id,
            s.source,
            s.signal_id,
            s.title,
            s.content,
            s.url,
            s.location,
            s.company_mentioned,
            s.problem_type,
            s.keyword_total,
            s.ai_total,
            s.combined_score,
            s.sentiment,
            s.intent,
            s.ai_reasoning,
            s.key_indicators,
            s.recommended_action,
            s.converted_to_lead,
            s.lead_id
        FROM unified_signals_with_ai s
        WHERE s.id = signal_id;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Function to get high-value pending signals
    CREATE OR REPLACE FUNCTION get_high_value_pending_signals(
        min_score INTEGER DEFAULT 70,
        max_results INTEGER DEFAULT 50
    )
    RETURNS TABLE (
        id UUID,
        source TEXT,
        signal_id TEXT,
        title TEXT,
        combined_score NUMERIC,
        sentiment TEXT,
        intent TEXT,
        location TEXT,
        company_mentioned TEXT,
        converted_to_lead BOOLEAN,
        alerted BOOLEAN,
        created_at TIMESTAMPTZ
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            s.id,
            s.source,
            s.signal_id,
            s.title,
            s.combined_score,
            s.sentiment,
            s.intent,
            s.location,
            s.company_mentioned,
            s.converted_to_lead,
            s.alerted,
            s.created_at
        FROM unified_signals_with_ai s
        WHERE s.combined_score >= min_score
            AND s.converted_to_lead = FALSE
            AND s.processed = TRUE
        ORDER BY s.combined_score DESC, s.created_at DESC
        LIMIT max_results;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Function to get conversion statistics
    CREATE OR REPLACE FUNCTION get_signal_conversion_stats(days_back INTEGER DEFAULT 7)
    RETURNS TABLE (
        total_signals BIGINT,
        converted_signals BIGINT,
        conversion_rate NUMERIC,
        avg_score_converted NUMERIC,
        avg_score_not_converted NUMERIC,
        by_source JSONB
    ) AS $$
    BEGIN
        RETURN QUERY
        WITH stats AS (
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE converted_to_lead = TRUE) as converted,
                AVG(combined_score) FILTER (WHERE converted_to_lead = TRUE) as avg_converted,
                AVG(combined_score) FILTER (WHERE converted_to_lead = FALSE) as avg_not_converted,
                jsonb_object_agg(
                    source,
                    jsonb_build_object(
                        'total', COUNT(*),
                        'converted', COUNT(*) FILTER (WHERE converted_to_lead = TRUE)
                    )
                ) as by_source
            FROM unified_signals_with_ai
            WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
        )
        SELECT 
            total,
            converted,
            CASE WHEN total > 0 THEN (converted::NUMERIC / total::NUMERIC * 100) ELSE 0 END,
            COALESCE(avg_converted, 0),
            COALESCE(avg_not_converted, 0),
            by_source
        FROM stats;
    END;
    $$ LANGUAGE plpgsql;
    """


if __name__ == "__main__":
    # Test the converter
    converter = LeadConverter()
    
    # Get conversion stats
    print("\n📊 Conversion Statistics:")
    stats = converter.get_conversion_stats(days=7)
    print(f"Total Signals: {stats.get('total_signals', 0)}")
    print(f"Converted: {stats.get('converted_signals', 0)}")
    print(f"Conversion Rate: {stats.get('conversion_rate', 0):.1f}%")
    
    # Auto-convert high-value signals
    print("\n🔄 Auto-converting high-value signals...")
    leads = converter.auto_convert_high_value_signals(min_score=70, limit=10)
    print(f"✅ Created {len(leads)} leads from signals")
