"""
AI-Enhanced Pain Signal Scoring
Uses OpenAI GPT-4 for nuanced analysis of pain signals beyond keyword matching.
"""

import os
import json
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import openai
from openai import OpenAI


class AISignalScorer:
    """
    AI-powered scoring system for pain signals using GPT-4.
    Provides nuanced analysis beyond simple keyword matching.
    """
    
    def __init__(self):
        """Initialize OpenAI client"""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o-mini"  # Cost-effective for classification
    
    def score_signal(
        self,
        title: str,
        content: str,
        source: str = "reddit",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Score a pain signal using AI analysis.
        
        Args:
            title: Post/signal title
            content: Post/signal content
            source: Source platform (reddit, facebook, etc.)
            metadata: Additional context (subreddit, author, etc.)
        
        Returns:
            Dict with AI scores, analysis, and recommendations
        """
        try:
            # Prepare context
            context = self._prepare_context(title, content, source, metadata)
            
            # Get AI analysis
            analysis = self._analyze_with_gpt(context)
            
            # Parse and structure results
            result = self._parse_analysis(analysis)
            
            # Add metadata
            result["analyzed_at"] = datetime.now(timezone.utc).isoformat()
            result["model"] = self.model
            result["source"] = source
            
            return result
            
        except Exception as e:
            print(f"❌ AI scoring error: {str(e)}")
            return self._fallback_score()
    
    def _prepare_context(
        self,
        title: str,
        content: str,
        source: str,
        metadata: Optional[Dict[str, Any]]
    ) -> str:
        """Prepare context for GPT analysis"""
        context_parts = [
            f"Platform: {source}",
            f"Title: {title}",
            f"Content: {content[:1000]}"  # Limit content length
        ]
        
        if metadata:
            if "subreddit" in metadata:
                context_parts.append(f"Subreddit: r/{metadata['subreddit']}")
            if "author" in metadata:
                context_parts.append(f"Author: u/{metadata['author']}")
            if "upvotes" in metadata:
                context_parts.append(f"Upvotes: {metadata['upvotes']}")
        
        return "\n".join(context_parts)
    
    def _analyze_with_gpt(self, context: str) -> str:
        """Call GPT-4 for signal analysis"""
        
        system_prompt = """You are an expert HVAC business development analyst specializing in identifying high-value sales leads from online discussions.

Analyze the following post and provide a detailed scoring assessment for an HVAC service company.

Score each dimension from 0-10:

1. **Urgency** (0-10): How immediate is the need?
   - 10: Emergency/immediate need (broken system, no heat/AC)
   - 7-9: Urgent but not emergency (system failing, needs repair soon)
   - 4-6: Planning/considering (thinking about replacement)
   - 0-3: General inquiry or future planning

2. **Budget** (0-10): Financial capacity indicators
   - 10: Clear budget mentioned, willing to invest
   - 7-9: Discussing costs, comparing options
   - 4-6: Price-conscious but willing to pay for quality
   - 0-3: Looking for cheapest option, DIY mentions

3. **Authority** (0-10): Decision-making power
   - 10: Homeowner, business owner, clear decision maker
   - 7-9: Primary household decision maker
   - 4-6: Involved in decision but not sole authority
   - 0-3: Renter, asking for someone else, no authority

4. **Pain** (0-10): Problem severity and impact
   - 10: Major comfort/health/safety issue
   - 7-9: Significant discomfort or inefficiency
   - 4-6: Noticeable problem but manageable
   - 0-3: Minor inconvenience or curiosity

Additionally provide:
- **Sentiment**: positive, neutral, negative, frustrated, desperate
- **Intent**: seeking_help, comparing_options, emergency, planning, complaining
- **Lead_Quality**: hot, warm, qualified, cold
- **Key_Indicators**: List 3-5 specific phrases or signals that influenced your scoring
- **Recommended_Action**: immediate_contact, nurture, monitor, skip
- **Reasoning**: 2-3 sentence explanation of your assessment

Respond ONLY with valid JSON in this exact format:
{
  "urgency": 8,
  "budget": 7,
  "authority": 9,
  "pain": 8,
  "sentiment": "frustrated",
  "intent": "seeking_help",
  "lead_quality": "hot",
  "key_indicators": ["broken AC", "no cooling", "homeowner", "willing to pay"],
  "recommended_action": "immediate_contact",
  "reasoning": "Homeowner with broken AC showing urgency and willingness to invest in solution."
}"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": context}
                ],
                temperature=0.3,  # Lower temperature for consistent scoring
                max_tokens=500,
                response_format={"type": "json_object"}
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"❌ OpenAI API error: {str(e)}")
            raise
    
    def _parse_analysis(self, analysis: str) -> Dict[str, Any]:
        """Parse GPT response into structured format"""
        try:
            data = json.loads(analysis)
            
            # Calculate total score (0-100)
            urgency = data.get("urgency", 0)
            budget = data.get("budget", 0)
            authority = data.get("authority", 0)
            pain = data.get("pain", 0)
            
            total_score = (urgency * 0.25 + budget * 0.25 + 
                          authority * 0.25 + pain * 0.25) * 10
            
            # Determine tier
            if total_score >= 85:
                tier = "hot"
            elif total_score >= 70:
                tier = "warm"
            elif total_score >= 50:
                tier = "qualified"
            else:
                tier = "cold"
            
            return {
                "ai_urgency_score": urgency,
                "ai_budget_score": budget,
                "ai_authority_score": authority,
                "ai_pain_score": pain,
                "ai_total_score": round(total_score, 2),
                "ai_tier": tier,
                "sentiment": data.get("sentiment", "neutral"),
                "intent": data.get("intent", "unknown"),
                "lead_quality": data.get("lead_quality", "cold"),
                "key_indicators": data.get("key_indicators", []),
                "recommended_action": data.get("recommended_action", "monitor"),
                "reasoning": data.get("reasoning", ""),
                "confidence": "high"
            }
            
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse AI response: {str(e)}")
            print(f"Raw response: {analysis}")
            return self._fallback_score()
    
    def _fallback_score(self) -> Dict[str, Any]:
        """Fallback scores when AI fails"""
        return {
            "ai_urgency_score": 0,
            "ai_budget_score": 0,
            "ai_authority_score": 0,
            "ai_pain_score": 0,
            "ai_total_score": 0,
            "ai_tier": "cold",
            "sentiment": "unknown",
            "intent": "unknown",
            "lead_quality": "cold",
            "key_indicators": [],
            "recommended_action": "skip",
            "reasoning": "AI analysis failed",
            "confidence": "low"
        }
    
    def batch_score(
        self,
        signals: List[Dict[str, Any]],
        max_concurrent: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Score multiple signals in batch.
        
        Args:
            signals: List of signal dicts with title, content, source
            max_concurrent: Max concurrent API calls
        
        Returns:
            List of scored signals with AI analysis
        """
        results = []
        
        for signal in signals:
            try:
                score = self.score_signal(
                    title=signal.get("title", ""),
                    content=signal.get("content", ""),
                    source=signal.get("source", "reddit"),
                    metadata=signal.get("metadata", {})
                )
                
                results.append({
                    **signal,
                    **score
                })
                
            except Exception as e:
                print(f"❌ Batch scoring error for signal: {str(e)}")
                results.append({
                    **signal,
                    **self._fallback_score()
                })
        
        return results


def test_ai_scorer():
    """Test the AI scorer with sample data"""
    
    scorer = AISignalScorer()
    
    # Test case 1: High urgency emergency
    test_signal_1 = {
        "title": "AC completely dead in 95 degree heat - need help ASAP",
        "content": "My AC unit stopped working this morning and it's 95 degrees outside. I'm a homeowner and have a newborn baby. I need someone to come out today if possible. Money is not an issue, I just need my family to be comfortable. Any recommendations for emergency HVAC service?",
        "source": "reddit",
        "metadata": {
            "subreddit": "HVAC",
            "author": "desperate_homeowner",
            "upvotes": 15
        }
    }
    
    print("=" * 60)
    print("TEST 1: Emergency AC Failure")
    print("=" * 60)
    result_1 = scorer.score_signal(**test_signal_1)
    print(json.dumps(result_1, indent=2))
    
    # Test case 2: Planning/research phase
    test_signal_2 = {
        "title": "Thinking about replacing my 15 year old furnace",
        "content": "My furnace is 15 years old and still working fine, but I'm wondering if I should replace it proactively. What do you all think? Is it worth it or should I wait until it breaks?",
        "source": "reddit",
        "metadata": {
            "subreddit": "homeowners",
            "author": "planning_ahead",
            "upvotes": 3
        }
    }
    
    print("\n" + "=" * 60)
    print("TEST 2: Planning Phase")
    print("=" * 60)
    result_2 = scorer.score_signal(**test_signal_2)
    print(json.dumps(result_2, indent=2))
    
    # Test case 3: Budget-conscious DIY
    test_signal_3 = {
        "title": "Can I fix my AC myself?",
        "content": "My AC is making a weird noise. I'm pretty handy and want to save money. Can I fix this myself or do I really need to call someone? What's the cheapest way to handle this?",
        "source": "reddit",
        "metadata": {
            "subreddit": "HomeImprovement",
            "author": "diy_enthusiast",
            "upvotes": 2
        }
    }
    
    print("\n" + "=" * 60)
    print("TEST 3: DIY Budget-Conscious")
    print("=" * 60)
    result_3 = scorer.score_signal(**test_signal_3)
    print(json.dumps(result_3, indent=2))


if __name__ == "__main__":
    test_ai_scorer()
