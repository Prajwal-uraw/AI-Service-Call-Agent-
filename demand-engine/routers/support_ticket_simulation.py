"""
Week-1 Support Ticket Simulation API
Predicts and simulates support tickets for the first 7 days after launch.
Uses AI to generate realistic ticket scenarios based on product context.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import json
import logging
import os
import openai

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/support-simulation", tags=["Support Ticket Simulation"])

# =====================================================
# Enums and Constants
# =====================================================

class TicketSeverity(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TicketCategory(str, Enum):
    SIGNUP_ACCESS = "signup_access"
    WHAT_DO_I_DO = "what_do_i_do"
    WIZARD_CONFUSION = "wizard_confusion"
    REPORTING_EXPORT = "reporting_export"
    BILLING_PLAN = "billing_plan"
    FEELS_BROKEN = "feels_broken"

class TicketStatus(str, Enum):
    PREDICTED = "predicted"
    SHOULD_PREVENT = "should_prevent"
    MUST_ACCEPT = "must_accept"

# Autocycle pass definitions from the prompt
AUTOCYCLE_PASSES = {
    "signup_access": {
        "name": "Signup & Access Tickets",
        "description": "Issues with login, confirmation emails, redirects",
        "examples": [
            "I signed up but can't log in",
            "I didn't get a confirmation email",
            "Google login doesn't work",
            "Why am I being redirected here?"
        ],
        "focus": "Focus on auth, redirects, callbacks, email delivery"
    },
    "what_do_i_do": {
        "name": "What Do I Do Now? Tickets",
        "description": "User confusion after completing a step",
        "examples": [
            "I logged in — now what?",
            "How do I start a simulation check?",
            "Is something supposed to happen?"
        ],
        "focus": "Look for empty dashboards, missing CTAs, assume-next-steps"
    },
    "wizard_confusion": {
        "name": "Wizard & Results Confusion Tickets",
        "description": "Confusion about results or changes",
        "examples": [
            "Why does my result say X?",
            "I went back and changed an answer — nothing changed!",
            "Is this saying I'm compliant or not?"
        ],
        "focus": "Focus on interpretation gaps, not logic bugs"
    },
    "reporting_export": {
        "name": "Reporting & Export Tickets",
        "description": "Issues with reports and exports",
        "examples": [
            "Can I download this?",
            "Is this a report still?",
            "Can I share this with my lawyer/client?"
        ],
        "focus": "Focus on report meaning, scope, and limitations"
    },
    "billing_plan": {
        "name": "Billing & Plan Expectation Tickets",
        "description": "Billing and plan confusion",
        "examples": [
            "Why is this locked?",
            "What's included in free?",
            "I upgraded but nothing changed?",
            "How do I cancel?"
        ],
        "focus": "Even if billing is simple, expectations won't be"
    },
    "feels_broken": {
        "name": "This Feels Broken Tickets",
        "description": "Vague complaints about functionality",
        "examples": [
            "It's not working",
            "Nothing happens when I click",
            "Is this still beta?"
        ],
        "focus": "Identify silent failures, loading gaps, or missing feedback"
    }
}

# =====================================================
# Pydantic Models
# =====================================================

class ProductContext(BaseModel):
    """Context about the product being simulated"""
    product_name: str
    product_description: str
    target_users: str
    key_features: List[str]
    known_limitations: Optional[List[str]] = []
    onboarding_flow: Optional[str] = None
    pricing_tiers: Optional[List[str]] = []

class SimulatedTicket(BaseModel):
    """A simulated support ticket"""
    id: str
    title: str
    description: str
    category: TicketCategory
    severity: TicketSeverity
    status: TicketStatus
    triggering_action: str
    root_cause: str
    user_expectation_gap: Optional[str] = None
    recommended_response: str
    prevention_suggestion: Optional[str] = None
    estimated_frequency: str  # "high", "medium", "low"
    day_likely_to_occur: int  # 1-7
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SimulationRequest(BaseModel):
    """Request to run a support ticket simulation"""
    product_context: ProductContext
    simulation_depth: str = "standard"  # "quick", "standard", "deep"
    focus_categories: Optional[List[TicketCategory]] = None

class SimulationResult(BaseModel):
    """Result of a support ticket simulation"""
    simulation_id: str
    product_name: str
    total_tickets_predicted: int
    tickets_by_category: Dict[str, int]
    tickets_by_severity: Dict[str, int]
    tickets_to_prevent: List[SimulatedTicket]
    tickets_to_accept: List[SimulatedTicket]
    recommended_responses: List[Dict[str, str]]
    kill_test_tickets: List[SimulatedTicket]
    constraints_applied: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AutocyclePassResult(BaseModel):
    """Result of a single autocycle pass"""
    pass_name: str
    category: TicketCategory
    tickets_found: List[SimulatedTicket]
    insights: str

# =====================================================
# Simulation Engine
# =====================================================

class SupportTicketSimulator:
    """Engine for simulating Week-1 support tickets"""
    
    def __init__(self):
        self.openai_client = None
        self._init_openai()
    
    def _init_openai(self):
        """Initialize OpenAI client"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            self.openai_client = openai.OpenAI(api_key=api_key)
    
    async def run_simulation(self, request: SimulationRequest) -> SimulationResult:
        """Run a full Week-1 support ticket simulation"""
        import uuid
        
        simulation_id = str(uuid.uuid4())[:8]
        all_tickets = []
        
        # Determine which categories to simulate
        categories = request.focus_categories or list(TicketCategory)
        
        # Run autocycle passes for each category
        for category in categories:
            pass_config = AUTOCYCLE_PASSES.get(category.value, {})
            tickets = await self._run_autocycle_pass(
                category=category,
                pass_config=pass_config,
                product_context=request.product_context,
                depth=request.simulation_depth
            )
            all_tickets.extend(tickets)
        
        # Categorize tickets
        tickets_to_prevent = [t for t in all_tickets if t.status == TicketStatus.SHOULD_PREVENT]
        tickets_to_accept = [t for t in all_tickets if t.status == TicketStatus.MUST_ACCEPT]
        kill_test_tickets = self._identify_kill_test_tickets(all_tickets)
        
        # Generate recommended responses
        recommended_responses = self._generate_recommended_responses(tickets_to_accept)
        
        # Calculate statistics
        tickets_by_category = {}
        tickets_by_severity = {}
        for ticket in all_tickets:
            cat = ticket.category.value
            sev = ticket.severity.value
            tickets_by_category[cat] = tickets_by_category.get(cat, 0) + 1
            tickets_by_severity[sev] = tickets_by_severity.get(sev, 0) + 1
        
        return SimulationResult(
            simulation_id=simulation_id,
            product_name=request.product_context.product_name,
            total_tickets_predicted=len(all_tickets),
            tickets_by_category=tickets_by_category,
            tickets_by_severity=tickets_by_severity,
            tickets_to_prevent=tickets_to_prevent,
            tickets_to_accept=tickets_to_accept,
            recommended_responses=recommended_responses,
            kill_test_tickets=kill_test_tickets,
            constraints_applied=[
                "No feature building",
                "No big-picture roadmap fixes",
                "No 'educate the user' hand-waving",
                "Be brutally realistic"
            ]
        )
    
    async def _run_autocycle_pass(
        self,
        category: TicketCategory,
        pass_config: Dict,
        product_context: ProductContext,
        depth: str
    ) -> List[SimulatedTicket]:
        """Run a single autocycle pass for a category"""
        import uuid
        
        # Number of tickets to generate based on depth
        ticket_counts = {"quick": 2, "standard": 4, "deep": 6}
        num_tickets = ticket_counts.get(depth, 4)
        
        tickets = []
        
        if self.openai_client:
            # Use AI to generate realistic tickets
            tickets = await self._generate_ai_tickets(
                category=category,
                pass_config=pass_config,
                product_context=product_context,
                num_tickets=num_tickets
            )
        else:
            # Fallback to template-based generation
            tickets = self._generate_template_tickets(
                category=category,
                pass_config=pass_config,
                product_context=product_context,
                num_tickets=num_tickets
            )
        
        return tickets
    
    async def _generate_ai_tickets(
        self,
        category: TicketCategory,
        pass_config: Dict,
        product_context: ProductContext,
        num_tickets: int
    ) -> List[SimulatedTicket]:
        """Generate tickets using AI"""
        import uuid
        
        prompt = f"""You are simulating Week-1 support tickets for a new product launch.

PRODUCT CONTEXT:
- Name: {product_context.product_name}
- Description: {product_context.product_description}
- Target Users: {product_context.target_users}
- Key Features: {', '.join(product_context.key_features)}
- Known Limitations: {', '.join(product_context.known_limitations or ['None specified'])}
- Onboarding Flow: {product_context.onboarding_flow or 'Standard signup flow'}

TICKET CATEGORY: {pass_config.get('name', category.value)}
DESCRIPTION: {pass_config.get('description', '')}
EXAMPLE TICKETS: {', '.join(pass_config.get('examples', []))}
FOCUS AREA: {pass_config.get('focus', '')}

Generate {num_tickets} realistic support tickets that a frustrated first-week user would submit.

For each ticket, provide:
1. title: Short ticket title (user's words)
2. description: Full ticket description
3. severity: high/medium/low
4. status: should_prevent (can be fixed with cheap changes) or must_accept (not worth fixing pre-launch)
5. triggering_action: What the user did before submitting
6. root_cause: Technical or UX root cause
7. user_expectation_gap: What the user expected vs reality
8. recommended_response: One-paragraph safe response
9. prevention_suggestion: How to prevent this (if should_prevent)
10. estimated_frequency: high/medium/low
11. day_likely_to_occur: 1-7

CONSTRAINTS:
- No feature building suggestions
- No long-term roadmap fixes
- No "educate the user" hand-waving
- Be brutally realistic

Return as JSON array of tickets."""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a support ticket simulation expert. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            tickets_data = result.get("tickets", result.get("data", [result] if isinstance(result, dict) and "title" in result else []))
            
            if isinstance(tickets_data, dict):
                tickets_data = [tickets_data]
            
            tickets = []
            for i, t in enumerate(tickets_data[:num_tickets]):
                ticket = SimulatedTicket(
                    id=f"{category.value[:3]}-{str(uuid.uuid4())[:6]}",
                    title=t.get("title", f"Issue with {category.value}"),
                    description=t.get("description", "User reported an issue"),
                    category=category,
                    severity=TicketSeverity(t.get("severity", "medium").lower()),
                    status=TicketStatus.SHOULD_PREVENT if "prevent" in t.get("status", "").lower() else TicketStatus.MUST_ACCEPT,
                    triggering_action=t.get("triggering_action", "User action"),
                    root_cause=t.get("root_cause", "Unknown"),
                    user_expectation_gap=t.get("user_expectation_gap"),
                    recommended_response=t.get("recommended_response", "We're looking into this."),
                    prevention_suggestion=t.get("prevention_suggestion"),
                    estimated_frequency=t.get("estimated_frequency", "medium"),
                    day_likely_to_occur=t.get("day_likely_to_occur", 1)
                )
                tickets.append(ticket)
            
            return tickets
            
        except Exception as e:
            logger.error(f"AI ticket generation failed: {e}")
            return self._generate_template_tickets(category, pass_config, product_context, num_tickets)
    
    def _generate_template_tickets(
        self,
        category: TicketCategory,
        pass_config: Dict,
        product_context: ProductContext,
        num_tickets: int
    ) -> List[SimulatedTicket]:
        """Generate tickets using templates (fallback)"""
        import uuid
        
        templates = {
            TicketCategory.SIGNUP_ACCESS: [
                {
                    "title": "Can't log in after signup",
                    "description": f"I just signed up for {product_context.product_name} but when I try to log in, it says my credentials are invalid.",
                    "severity": TicketSeverity.HIGH,
                    "status": TicketStatus.SHOULD_PREVENT,
                    "triggering_action": "User completed signup, then tried to log in",
                    "root_cause": "Email confirmation required but not clearly communicated",
                    "recommended_response": "Please check your email for a confirmation link. If you don't see it, check your spam folder.",
                    "prevention_suggestion": "Add clear messaging after signup about email confirmation",
                    "estimated_frequency": "high",
                    "day_likely_to_occur": 1
                },
                {
                    "title": "Confirmation email never arrived",
                    "description": "I signed up 30 minutes ago and still haven't received my confirmation email. I've checked spam.",
                    "severity": TicketSeverity.HIGH,
                    "status": TicketStatus.SHOULD_PREVENT,
                    "triggering_action": "User signed up and waited for email",
                    "root_cause": "Email deliverability issues or delay",
                    "recommended_response": "I've manually verified your account. You should now be able to log in.",
                    "prevention_suggestion": "Add resend confirmation email button, improve email deliverability",
                    "estimated_frequency": "medium",
                    "day_likely_to_occur": 1
                }
            ],
            TicketCategory.WHAT_DO_I_DO: [
                {
                    "title": "Logged in but don't know what to do",
                    "description": f"I just logged into {product_context.product_name} and I'm staring at an empty dashboard. What am I supposed to do now?",
                    "severity": TicketSeverity.MEDIUM,
                    "status": TicketStatus.SHOULD_PREVENT,
                    "triggering_action": "User logged in for the first time",
                    "root_cause": "No onboarding flow or empty state guidance",
                    "recommended_response": "Welcome! To get started, click the 'New' button in the top right to create your first project.",
                    "prevention_suggestion": "Add first-time user onboarding wizard or empty state CTAs",
                    "estimated_frequency": "high",
                    "day_likely_to_occur": 1
                }
            ],
            TicketCategory.WIZARD_CONFUSION: [
                {
                    "title": "Changed my answer but results didn't update",
                    "description": "I went back and changed one of my answers in the wizard, but my results look exactly the same. Is this broken?",
                    "severity": TicketSeverity.MEDIUM,
                    "status": TicketStatus.MUST_ACCEPT,
                    "triggering_action": "User modified wizard answers",
                    "root_cause": "Results may not visibly change for minor input changes",
                    "recommended_response": "The results are recalculated, but some changes may not significantly impact the final output. The system is working correctly.",
                    "estimated_frequency": "medium",
                    "day_likely_to_occur": 2
                }
            ],
            TicketCategory.REPORTING_EXPORT: [
                {
                    "title": "Can I download this as a PDF?",
                    "description": "I need to share this report with my team. Is there a way to download it as a PDF?",
                    "severity": TicketSeverity.LOW,
                    "status": TicketStatus.MUST_ACCEPT,
                    "triggering_action": "User viewed a report",
                    "root_cause": "Export functionality may be limited",
                    "recommended_response": "You can use your browser's print function (Ctrl+P) and select 'Save as PDF'. We're working on native export.",
                    "estimated_frequency": "medium",
                    "day_likely_to_occur": 3
                }
            ],
            TicketCategory.BILLING_PLAN: [
                {
                    "title": "Why is this feature locked?",
                    "description": "I'm trying to use a feature but it says I need to upgrade. I thought this was included in my plan.",
                    "severity": TicketSeverity.MEDIUM,
                    "status": TicketStatus.MUST_ACCEPT,
                    "triggering_action": "User clicked on a premium feature",
                    "root_cause": "Plan limitations not clearly communicated",
                    "recommended_response": "That feature is available on our Pro plan. You can upgrade from Settings > Billing.",
                    "estimated_frequency": "medium",
                    "day_likely_to_occur": 2
                }
            ],
            TicketCategory.FEELS_BROKEN: [
                {
                    "title": "Nothing happens when I click the button",
                    "description": "I click the submit button and nothing happens. No error, no loading, nothing. Is this broken?",
                    "severity": TicketSeverity.HIGH,
                    "status": TicketStatus.SHOULD_PREVENT,
                    "triggering_action": "User clicked a button",
                    "root_cause": "Missing loading state or silent failure",
                    "recommended_response": "Can you try refreshing the page and trying again? If the issue persists, please let me know what browser you're using.",
                    "prevention_suggestion": "Add loading states and error feedback to all buttons",
                    "estimated_frequency": "high",
                    "day_likely_to_occur": 1
                }
            ]
        }
        
        category_templates = templates.get(category, templates[TicketCategory.FEELS_BROKEN])
        tickets = []
        
        for i, template in enumerate(category_templates[:num_tickets]):
            ticket = SimulatedTicket(
                id=f"{category.value[:3]}-{str(uuid.uuid4())[:6]}",
                category=category,
                user_expectation_gap=f"User expected immediate feedback, got none",
                **template
            )
            tickets.append(ticket)
        
        return tickets
    
    def _identify_kill_test_tickets(self, tickets: List[SimulatedTicket]) -> List[SimulatedTicket]:
        """Identify tickets that would be 'kill test' failures"""
        kill_tests = []
        
        for ticket in tickets:
            # Kill test criteria from the prompt
            is_kill_test = (
                ticket.severity == TicketSeverity.HIGH and
                ticket.estimated_frequency == "high"
            ) or (
                "can't log in" in ticket.title.lower() or
                "broken" in ticket.title.lower() or
                "doesn't work" in ticket.title.lower()
            )
            
            if is_kill_test:
                kill_tests.append(ticket)
        
        return kill_tests[:5]  # Top 5 kill test tickets
    
    def _generate_recommended_responses(self, tickets: List[SimulatedTicket]) -> List[Dict[str, str]]:
        """Generate recommended responses for tickets that must be accepted"""
        responses = []
        
        for ticket in tickets[:5]:  # Top 5 responses
            responses.append({
                "ticket_type": ticket.title,
                "response": ticket.recommended_response,
                "tone": "calm, precise, non-defensive",
                "avoid": "No promises, no feature building"
            })
        
        return responses


# Initialize simulator
simulator = SupportTicketSimulator()

# =====================================================
# API Endpoints
# =====================================================

@router.post("/run", response_model=SimulationResult)
async def run_simulation(request: SimulationRequest):
    """
    Run a Week-1 support ticket simulation.
    
    This simulates the support tickets you're likely to receive
    in the first 7 days after launching your product.
    """
    try:
        result = await simulator.run_simulation(request)
        return result
    except Exception as e:
        logger.error(f"Simulation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/autocycle-passes")
async def get_autocycle_passes():
    """Get all available autocycle pass definitions"""
    return {
        "passes": AUTOCYCLE_PASSES,
        "total_passes": len(AUTOCYCLE_PASSES)
    }


@router.post("/single-pass/{category}")
async def run_single_pass(
    category: TicketCategory,
    product_context: ProductContext,
    depth: str = "standard"
):
    """Run a single autocycle pass for a specific category"""
    pass_config = AUTOCYCLE_PASSES.get(category.value, {})
    
    tickets = await simulator._run_autocycle_pass(
        category=category,
        pass_config=pass_config,
        product_context=product_context,
        depth=depth
    )
    
    return AutocyclePassResult(
        pass_name=pass_config.get("name", category.value),
        category=category,
        tickets_found=tickets,
        insights=f"Found {len(tickets)} potential tickets in {category.value} category"
    )


@router.get("/categories")
async def get_ticket_categories():
    """Get all ticket categories with descriptions"""
    return {
        "categories": [
            {
                "value": cat.value,
                "name": AUTOCYCLE_PASSES.get(cat.value, {}).get("name", cat.value),
                "description": AUTOCYCLE_PASSES.get(cat.value, {}).get("description", ""),
                "examples": AUTOCYCLE_PASSES.get(cat.value, {}).get("examples", [])
            }
            for cat in TicketCategory
        ]
    }


@router.get("/constraints")
async def get_simulation_constraints():
    """Get the constraints applied to simulations"""
    return {
        "constraints": [
            {
                "rule": "No feature building",
                "description": "Don't suggest building new features to solve tickets"
            },
            {
                "rule": "No big-picture roadmap fixes",
                "description": "Focus on quick wins, not long-term solutions"
            },
            {
                "rule": "No 'educate the user' hand-waving",
                "description": "If users are confused, the product needs to change"
            },
            {
                "rule": "Be brutally realistic",
                "description": "Assume users are confused, not stupid"
            }
        ],
        "success_criteria": [
            "You are not surprised by week-1 emails",
            "Support load feels predictable",
            "Trust erosion is minimized early",
            "If unsure, assume users are confused"
        ]
    }
