"""
AI Email Generator
Uses OpenAI to generate personalized follow-up emails
"""

import os
from typing import Dict, Optional
import openai

class AIEmailGenerator:
    """
    Generates personalized emails using AI
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key
    
    def generate_email(
        self,
        lead: Dict,
        trigger: Dict,
        template_type: str = "follow_up"
    ) -> Dict:
        """
        Generate personalized email for a lead
        
        Args:
            lead: Lead information
            trigger: Trigger that prompted the email
            template_type: Type of email template
            
        Returns:
            Generated email with subject and body
        """
        if not self.api_key:
            return self._get_template_email(lead, trigger, template_type)
        
        prompt = self._build_prompt(lead, trigger, template_type)
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert email copywriter for HVAC/Plumbing service companies. Write professional, personalized emails that drive engagement."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            email_content = response.choices[0].message.content
            
            # Parse subject and body
            lines = email_content.split('\n')
            subject = lines[0].replace('Subject:', '').strip()
            body = '\n'.join(lines[2:]).strip()
            
            return {
                "subject": subject,
                "body": body,
                "generated_by": "ai",
                "model": "gpt-4o-mini"
            }
        
        except Exception as e:
            print(f"AI generation failed: {e}")
            return self._get_template_email(lead, trigger, template_type)
    
    def _build_prompt(self, lead: Dict, trigger: Dict, template_type: str) -> str:
        """Build prompt for AI email generation"""
        
        business_name = lead.get('business_name', 'there')
        trigger_message = trigger.get('message', 'follow up')
        
        prompt = f"""
Write a professional follow-up email for an HVAC/Plumbing service company.

Lead Information:
- Business Name: {business_name}
- Tier: {lead.get('tier', 'unknown')}
- Last Contact: {lead.get('last_contact_at', 'unknown')}

Trigger: {trigger_message}

Requirements:
- Professional but friendly tone
- Personalized to the business
- Clear call-to-action
- Keep it concise (under 200 words)
- Include subject line

Format:
Subject: [subject line]

[email body]
"""
        
        return prompt
    
    def _get_template_email(self, lead: Dict, trigger: Dict, template_type: str) -> Dict:
        """
        Fallback template-based email when AI is not available
        """
        business_name = lead.get('business_name', 'there')
        trigger_message = trigger.get('message', 'checking in')
        
        templates = {
            "follow_up": {
                "subject": f"Quick follow-up for {business_name}",
                "body": f"""Hi {business_name} team,

I wanted to reach out regarding {trigger_message}.

We specialize in helping HVAC and plumbing businesses streamline their operations and improve customer service. I'd love to discuss how we can help your business grow.

Would you be available for a quick 15-minute call this week?

Best regards,
Your Service Team"""
            },
            "seasonal": {
                "subject": f"{trigger_message} - Special Offer",
                "body": f"""Hi {business_name},

{trigger_message}

We're offering a special promotion this season to help businesses like yours prepare. Our services include:

• System maintenance and optimization
• Emergency support
• Customer service improvements

Let's schedule a time to discuss how we can help.

Best,
Your Service Team"""
            }
        }
        
        template = templates.get(template_type, templates["follow_up"])
        
        return {
            "subject": template["subject"],
            "body": template["body"],
            "generated_by": "template",
            "model": "template"
        }


def main():
    """Test AI email generator"""
    generator = AIEmailGenerator()
    
    print("=" * 60)
    print("AI Email Generator - Test")
    print("=" * 60)
    print()
    
    # Mock lead and trigger
    mock_lead = {
        "id": "1",
        "business_name": "ABC HVAC Services",
        "email": "contact@abchvac.com",
        "tier": "warm",
        "last_contact_at": "2025-11-15"
    }
    
    mock_trigger = {
        "trigger_name": "winter_prep",
        "message": "Winter is coming - time for heating system maintenance",
        "urgency": "high"
    }
    
    print("Generating email...")
    email = generator.generate_email(mock_lead, mock_trigger, "seasonal")
    
    print(f"\nSubject: {email['subject']}")
    print(f"\n{email['body']}")
    print(f"\nGenerated by: {email['generated_by']}")


if __name__ == "__main__":
    main()
