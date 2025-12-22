"""
Keyword definitions for signal classification
Fast pre-filtering before AI classification
"""

# Pain signals - business struggles and challenges
PAIN_KEYWORDS = {
    "high_priority": [
        "overwhelmed", "drowning", "can't keep up", "losing customers",
        "missing calls", "voicemail full", "calls going unanswered",
        "need help desperately", "struggling to manage", "too busy",
    ],
    "medium_priority": [
        "busy season", "hiring", "need staff", "growing fast",
        "scaling issues", "capacity problems", "backlog",
        "scheduling nightmare", "double booked", "overbooked",
    ],
    "low_priority": [
        "considering", "thinking about", "looking into",
        "might need", "eventually", "future",
    ]
}

# Urgency signals - time sensitivity
URGENCY_KEYWORDS = {
    "immediate": [
        "urgent", "asap", "immediately", "right now", "today",
        "emergency", "critical", "desperate", "help needed now",
    ],
    "short_term": [
        "this week", "next week", "soon", "quickly", "fast",
        "before season", "ahead of", "preparing for",
    ],
    "long_term": [
        "next month", "next quarter", "next year", "planning",
        "eventually", "down the road",
    ]
}

# Budget signals - financial capacity
BUDGET_KEYWORDS = {
    "high_budget": [
        "investment", "roi", "revenue growth", "profit increase",
        "worth it", "pay for itself", "cost effective", "value",
        "enterprise", "premium", "best solution",
    ],
    "budget_conscious": [
        "affordable", "reasonable", "budget", "cost",
        "price", "cheap", "inexpensive", "deal",
    ],
    "budget_constrained": [
        "can't afford", "too expensive", "out of budget",
        "free", "trial", "demo", "no cost",
    ]
}

# Authority signals - decision-making power
AUTHORITY_KEYWORDS = {
    "decision_maker": [
        "owner", "ceo", "founder", "partner", "president",
        "my business", "my company", "i own", "we run",
        "i decide", "my decision",
    ],
    "influencer": [
        "manager", "director", "supervisor", "lead",
        "operations", "office manager", "gm",
    ],
    "researcher": [
        "looking for", "researching", "comparing", "evaluating",
        "recommendations", "suggestions", "advice",
    ]
}

# Business type indicators
BUSINESS_TYPE_KEYWORDS = {
    "hvac": [
        "hvac", "heating", "cooling", "air conditioning", "ac repair",
        "furnace", "heat pump", "ductwork", "hvac tech",
    ],
    "plumbing": [
        "plumbing", "plumber", "drain", "pipe", "water heater",
        "sewer", "leak", "faucet", "toilet",
    ],
    "electrical": [
        "electrical", "electrician", "wiring", "circuit", "panel",
        "outlet", "breaker", "voltage",
    ],
    "general_contractor": [
        "contractor", "construction", "remodel", "renovation",
        "building", "gc", "general contractor",
    ]
}

# Negative signals - disqualifiers
DISQUALIFIER_KEYWORDS = [
    "diy", "do it myself", "homeowner", "residential only",
    "hobby", "side project", "just starting", "no business yet",
    "student", "learning", "practice",
]

# Service-specific pain points
SERVICE_PAIN_POINTS = {
    "call_handling": [
        "missing calls", "can't answer", "voicemail full",
        "after hours calls", "weekend calls", "emergency calls",
        "call volume", "phone ringing", "too many calls",
    ],
    "scheduling": [
        "scheduling", "appointments", "booking", "calendar",
        "double booked", "no shows", "cancellations",
    ],
    "customer_service": [
        "customer complaints", "bad reviews", "unhappy customers",
        "response time", "follow up", "communication",
    ],
    "growth": [
        "scaling", "expansion", "new territory", "more trucks",
        "hiring", "team growth", "capacity",
    ]
}


def calculate_keyword_score(text: str) -> dict:
    """
    Calculate comprehensive keyword-based score
    
    Returns dict with:
        - total_score: 0-100
        - pain_score: 0-25
        - urgency_score: 0-25
        - budget_score: 0-25
        - authority_score: 0-25
        - matched_keywords: dict of matched keywords
        - business_type: detected business type
        - has_disqualifiers: bool
    """
    text_lower = text.lower()
    
    matched = {
        "pain": [],
        "urgency": [],
        "budget": [],
        "authority": [],
        "business_type": [],
        "service_pain": [],
        "disqualifiers": []
    }
    
    # Pain signals
    pain_score = 0
    for priority, keywords in PAIN_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                matched["pain"].append(kw)
                if priority == "high_priority":
                    pain_score += 8
                elif priority == "medium_priority":
                    pain_score += 5
                else:
                    pain_score += 2
    
    # Service-specific pain points (bonus)
    for category, keywords in SERVICE_PAIN_POINTS.items():
        for kw in keywords:
            if kw in text_lower:
                matched["service_pain"].append(kw)
                pain_score += 3
    
    pain_score = min(25, pain_score)
    
    # Urgency signals
    urgency_score = 0
    for priority, keywords in URGENCY_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                matched["urgency"].append(kw)
                if priority == "immediate":
                    urgency_score += 10
                elif priority == "short_term":
                    urgency_score += 6
                else:
                    urgency_score += 2
    
    urgency_score = min(25, urgency_score)
    
    # Budget signals
    budget_score = 0
    for category, keywords in BUDGET_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                matched["budget"].append(kw)
                if category == "high_budget":
                    budget_score += 8
                elif category == "budget_conscious":
                    budget_score += 5
                else:
                    budget_score += 2
    
    budget_score = min(25, budget_score)
    
    # Authority signals
    authority_score = 0
    for category, keywords in AUTHORITY_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                matched["authority"].append(kw)
                if category == "decision_maker":
                    authority_score += 12
                elif category == "influencer":
                    authority_score += 7
                else:
                    authority_score += 3
    
    authority_score = min(25, authority_score)
    
    # Business type detection
    detected_types = []
    for biz_type, keywords in BUSINESS_TYPE_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                matched["business_type"].append(kw)
                if biz_type not in detected_types:
                    detected_types.append(biz_type)
    
    # Disqualifiers
    has_disqualifiers = False
    for kw in DISQUALIFIER_KEYWORDS:
        if kw in text_lower:
            matched["disqualifiers"].append(kw)
            has_disqualifiers = True
    
    # Total score
    total_score = pain_score + urgency_score + budget_score + authority_score
    
    # Penalty for disqualifiers
    if has_disqualifiers:
        total_score = int(total_score * 0.5)
    
    return {
        "total_score": min(100, total_score),
        "pain_score": pain_score,
        "urgency_score": urgency_score,
        "budget_score": budget_score,
        "authority_score": authority_score,
        "matched_keywords": matched,
        "business_type": detected_types[0] if detected_types else None,
        "has_disqualifiers": has_disqualifiers,
    }


def should_use_ai_classification(keyword_score: dict) -> bool:
    """
    Determine if AI classification is needed
    
    Use AI only if:
    - Keyword score is 40-80 (ambiguous range)
    - Has some signals but unclear
    
    Skip AI if:
    - Score < 40 (clearly low quality)
    - Score > 80 (clearly high quality, keyword sufficient)
    """
    score = keyword_score["total_score"]
    
    # Clear low quality - skip AI
    if score < 40:
        return False
    
    # Clear high quality - skip AI (keyword score sufficient)
    if score > 80:
        return False
    
    # Ambiguous range - use AI for refinement
    return True
