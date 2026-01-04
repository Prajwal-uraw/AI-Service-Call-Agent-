import openai
import json
import requests
from typing import Dict, List, Optional

class AlertStreamAssistant:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = openai.OpenAI(api_key=api_key)
        self.setup_steps = {
            "wordpress": self.setup_wordpress,
            "shopify": self.setup_shopify,
            "generic": self.setup_generic,
            "wix": self.setup_wix,
            "squarespace": self.setup_squarespace
        }
    
    def analyze_website(self, url: str) -> Dict:
        """Analyze website and generate setup instructions"""
        
        # Use GPT-4 to analyze website
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a website technical analyzer. Determine the CMS/platform and suggest integration methods."},
                {"role": "user", "content": f"Analyze this website for integration possibilities: {url}. What CMS/platform is it using? What forms or e-commerce features does it have?"}
            ]
        )
        
        analysis = response.choices[0].message.content
        
        # Determine platform
        platform = self.detect_platform_from_analysis(analysis)
        
        return {
            "url": url,
            "platform": platform,
            "analysis": analysis,
            "recommended_method": self.setup_steps.get(platform, self.setup_generic).__name__
        }
    
    def detect_platform_from_analysis(self, analysis: str) -> str:
        analysis_lower = analysis.lower()
        
        if "wordpress" in analysis_lower:
            return "wordpress"
        elif "shopify" in analysis_lower:
            return "shopify"
        elif "wix" in analysis_lower:
            return "wix"
        elif "squarespace" in analysis_lower:
            return "squarespace"
        else:
            return "generic"
    
    def setup_wordpress(self, website_info: Dict) -> str:
        """Generate WordPress setup instructions"""
        
        return f"""
# WordPress Setup for {website_info['url']}

## Method 1: Plugin Installation (Recommended)
1. Go to your WordPress Admin: {website_info['url']}/wp-admin
2. Navigate to Plugins → Add New
3. Search for "AlertStream"
4. Click "Install Now" then "Activate"

## Method 2: Manual Plugin Installation
1. Download plugin: https://alertstream.com/wordpress.zip
2. Upload to {website_info['url']}/wp-content/plugins/
3. Activate from WordPress admin

## Method 3: One-Click Install
[Click here for auto-install](https://alertstream.com/install/wordpress?domain={website_info['url']})

## Post-Installation:
- The plugin will auto-detect your contact forms
- Configure SMS phone number in Settings → AlertStream
- Test with a form submission
"""
    
    def setup_shopify(self, website_info: Dict) -> str:
        """Generate Shopify setup instructions"""
        return f"""
# Shopify Setup for {website_info['url']}

## Method 1: App Store Installation (Recommended)
1. Go to your Shopify Admin
2. Click "Apps" in the sidebar
3. Search for "AlertStream"
4. Click "Add app" and authorize

## Method 2: Manual Theme Integration
1. Go to Online Store → Themes → Edit Code
2. Add the AlertStream snippet before </head> in theme.liquid

## Post-Installation:
- Auto-configures: Order alerts, customer signups, abandoned carts
- Test by placing a test order
"""
    
    def setup_generic(self, website_info: Dict) -> str:
        """Generate generic JavaScript setup instructions"""
        return f"""
# JavaScript Setup for {website_info['url']}

## Add this code before </head>:
```html
<script>
  window.alertstreamConfig = {{
    apiKey: 'YOUR_API_KEY',
    siteId: 'YOUR_SITE_ID',
    endpoint: 'https://api.alertstream.com/v1/js-events'
  }};
</script>
<script src="https://cdn.alertstream.com/alertstream.min.js" async></script>
```

## Post-Installation:
- Auto-detects: Form submissions, button clicks, page views
- Custom events: Add data-alertstream-track="event_name" to any element
"""
    
    def setup_wix(self, website_info: Dict) -> str:
        """Generate Wix setup instructions"""
        return f"""
# Wix Setup for {website_info['url']}

1. Go to your Wix Dashboard
2. Click "Settings" → "Custom Code"
3. Add AlertStream snippet to Head Code
4. Save and publish

Note: Wix has limited JavaScript access. Some features may be restricted.
"""
    
    def setup_squarespace(self, website_info: Dict) -> str:
        """Generate Squarespace setup instructions"""
        return f"""
# Squarespace Setup for {website_info['url']}

1. Go to Settings → Advanced → Code Injection
2. Paste AlertStream snippet in Header section
3. Save changes

Note: Squarespace form integration requires Business plan or higher.
"""
    
    def generate_conversation_flow(self, user_query: str) -> List[Dict]:
        """Generate conversational setup flow"""
        
        flow = [
            {
                "step": 1,
                "question": "What's your website URL?",
                "handler": self.handle_website_url
            },
            {
                "step": 2,
                "question": "What platform is your website built with? (WordPress, Shopify, etc.)",
                "handler": self.handle_platform_selection
            },
            {
                "step": 3,
                "question": "What events do you want SMS alerts for? (Form submissions, orders, etc.)",
                "handler": self.handle_event_selection
            },
            {
                "step": 4,
                "question": "What's your phone number for receiving alerts?",
                "handler": self.handle_phone_number
            },
            {
                "step": 5,
                "action": "generate_installation_instructions",
                "handler": self.generate_instructions
            }
        ]
        
        return flow
    
    def handle_website_url(self, url: str) -> Dict:
        """Handle website URL input"""
        return {"url": url, "valid": url.startswith(("http://", "https://"))}
    
    def handle_platform_selection(self, platform: str) -> Dict:
        """Handle platform selection"""
        valid_platforms = ["wordpress", "shopify", "wix", "squarespace", "generic"]
        return {"platform": platform.lower(), "valid": platform.lower() in valid_platforms}
    
    def handle_event_selection(self, events: List[str]) -> Dict:
        """Handle event selection"""
        valid_events = ["form_submit", "order_created", "user_signup", "page_view", "custom"]
        return {"events": events, "valid": all(e in valid_events for e in events)}
    
    def handle_phone_number(self, phone: str) -> Dict:
        """Handle phone number input"""
        # Basic validation
        import re
        valid = bool(re.match(r'^\+?[1-9]\d{1,14}$', phone.replace(" ", "").replace("-", "")))
        return {"phone": phone, "valid": valid}
    
    def generate_instructions(self, collected_data: Dict) -> str:
        """Generate final installation instructions"""
        platform = collected_data.get("platform", "generic")
        setup_func = self.setup_steps.get(platform, self.setup_generic)
        return setup_func(collected_data)
    
    async def handle_conversation(self, messages: List[Dict]) -> Dict:
        """Handle conversational setup"""
        
        # Use GPT to understand user intent
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            functions=[
                {
                    "name": "generate_setup_instructions",
                    "description": "Generate setup instructions based on collected information",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "platform": {"type": "string"},
                            "events": {"type": "array", "items": {"type": "string"}},
                            "phone_number": {"type": "string"}
                        },
                        "required": ["platform", "events", "phone_number"]
                    }
                }
            ]
        )
        
        return response.choices[0].message
