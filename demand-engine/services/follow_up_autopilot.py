"""
Follow-Up Autopilot - Auto-generate high-quality follow-ups after calls
Context-specific emails based on call transcript and objections
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from services.openai_service import get_openai_service

logger = logging.getLogger(__name__)

class FollowUpAutopilot:
    """
    Automatically generates ready-to-send follow-up emails after calls
    
    Email structure:
    1. Acknowledge discussion
    2. Reframe value tied to their pain
    3. Address top objection (if any)
    4. Clear next step + deadline
    
    Max 120 words, no generic sales language
    """
    
    def __init__(self):
        self.openai_service = get_openai_service()
    
    async def generate_follow_up(
        self,
        customer_name: str,
        company_name: str,
        call_summary: str,
        pain_points: List[str],
        objections: List[str],
        deal_stage: str,
        cta_agreed: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate follow-up email and optional LinkedIn message
        
        Returns:
            {
                "email": {
                    "subject": "...",
                    "body": "...",
                    "word_count": 95
                },
                "linkedin": {
                    "message": "..."
                }
            }
        """
        try:
            # Generate email
            email = await self.generate_email(
                customer_name,
                company_name,
                call_summary,
                pain_points,
                objections,
                deal_stage,
                cta_agreed
            )
            
            # Generate LinkedIn variant (optional)
            linkedin = await self.generate_linkedin_message(
                customer_name,
                pain_points,
                cta_agreed
            )
            
            return {
                "email": email,
                "linkedin": linkedin,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating follow-up: {e}")
            raise
    
    async def generate_email(
        self,
        customer_name: str,
        company_name: str,
        call_summary: str,
        pain_points: List[str],
        objections: List[str],
        deal_stage: str,
        cta_agreed: Optional[str]
    ) -> Dict[str, str]:
        """Generate follow-up email"""
        try:
            # Build context
            pain_points_str = ", ".join(pain_points) if pain_points else "operational challenges"
            top_objection = objections[0] if objections else None
            
            system_prompt = """You are a sales follow-up specialist.
Generate a high-quality follow-up email after a sales call.

Structure (MUST follow):
1. Acknowledge discussion (1 sentence)
2. Reframe value tied to their pain (1-2 sentences)
3. Address top objection if any (1 sentence)
4. Clear next step + deadline (1 sentence)

Rules:
- Max 120 words
- No generic sales language
- Conversational and natural
- Specific to their situation
- Editable but NOT a blank draft

Output format:
Subject: [subject line]

[email body]
"""
            
            messages = [
                {
                    "role": "user",
                    "content": f"""Customer: {customer_name} from {company_name}
Call summary: {call_summary}
Pain points: {pain_points_str}
Top objection: {top_objection or "None"}
CTA agreed: {cta_agreed or "None"}
Deal stage: {deal_stage}

Generate follow-up email:"""
                }
            ]
            
            response = await self.openai_service.generate_response(
                messages=messages,
                system_prompt=system_prompt,
                use_premium=True,  # Use GPT-4o for quality
                max_tokens=300,
                temperature=0.7
            )
            
            # Parse subject and body
            email_text = response["text"]
            lines = email_text.split("\n")
            
            subject = ""
            body = []
            
            for line in lines:
                if line.startswith("Subject:"):
                    subject = line.replace("Subject:", "").strip()
                elif line.strip():
                    body.append(line)
            
            body_text = "\n".join(body).strip()
            word_count = len(body_text.split())
            
            return {
                "subject": subject or "Next steps from today's discussion",
                "body": body_text,
                "word_count": word_count
            }
            
        except Exception as e:
            logger.error(f"Error generating email: {e}")
            raise
    
    async def generate_linkedin_message(
        self,
        customer_name: str,
        pain_points: List[str],
        cta_agreed: Optional[str]
    ) -> Dict[str, str]:
        """Generate LinkedIn message variant (shorter)"""
        try:
            pain_points_str = ", ".join(pain_points) if pain_points else "your challenges"
            
            system_prompt = """Generate a short LinkedIn follow-up message.

Rules:
- Max 60 words
- Conversational
- Reference the call briefly
- Clear next step

No "Dear" or formal salutations."""
            
            messages = [
                {
                    "role": "user",
                    "content": f"""Customer: {customer_name}
Pain points: {pain_points_str}
CTA: {cta_agreed or "None"}

Generate LinkedIn message:"""
                }
            ]
            
            response = await self.openai_service.generate_response(
                messages=messages,
                system_prompt=system_prompt,
                use_premium=False,  # Use fast model
                max_tokens=150,
                temperature=0.7
            )
            
            return {
                "message": response["text"].strip()
            }
            
        except Exception as e:
            logger.error(f"Error generating LinkedIn message: {e}")
            return {"message": ""}
    
    async def generate_follow_up_from_call_log(
        self,
        call_log_id: str
    ) -> Dict[str, Any]:
        """
        Generate follow-up from call log in database
        
        This is the main entry point for automated follow-ups
        """
        try:
            # TODO: Fetch call log from database
            # For now, use placeholder data
            
            call_log = {
                "customer_name": "John Smith",
                "company_name": "Acme HVAC",
                "call_summary": "Discussed AI voice agent for after-hours calls",
                "pain_points": ["missed calls", "after-hours coverage", "hiring challenges"],
                "objections": ["setup time concerns"],
                "deal_stage": "discovery",
                "cta_agreed": "technical walkthrough"
            }
            
            follow_up = await self.generate_follow_up(
                customer_name=call_log["customer_name"],
                company_name=call_log["company_name"],
                call_summary=call_log["call_summary"],
                pain_points=call_log["pain_points"],
                objections=call_log["objections"],
                deal_stage=call_log["deal_stage"],
                cta_agreed=call_log["cta_agreed"]
            )
            
            # TODO: Save to database
            
            return follow_up
            
        except Exception as e:
            logger.error(f"Error generating follow-up from call log: {e}")
            raise


# Singleton instance
_autopilot_instance: Optional[FollowUpAutopilot] = None

def get_follow_up_autopilot() -> FollowUpAutopilot:
    """Get or create Follow-Up Autopilot instance"""
    global _autopilot_instance
    if _autopilot_instance is None:
        _autopilot_instance = FollowUpAutopilot()
    return _autopilot_instance
