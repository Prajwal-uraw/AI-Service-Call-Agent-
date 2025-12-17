"""
Context management utilities for HVAC Voice Agent.

Provides:
- Conversation summarization for long calls
- Smart context window management
- Memory optimization for token efficiency
"""

import os
from typing import List, Optional
from openai import OpenAI
import httpx

from app.agents.state import ConversationTurn
from app.utils.logging import get_logger

logger = get_logger("context_manager")

# Initialize OpenAI client for summarization
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
_http_client = httpx.Client(timeout=httpx.Timeout(3.0, connect=2.0))
client = OpenAI(api_key=OPENAI_API_KEY, http_client=_http_client)


def summarize_conversation(
    history: List[ConversationTurn],
    max_turns_to_summarize: int = 10
) -> Optional[str]:
    """
    Compress old conversation history into a concise summary.

    This allows us to maintain context from the entire conversation
    without sending all turns to the AI model (saves tokens and latency).

    Args:
        history: Full conversation history
        max_turns_to_summarize: How many old turns to summarize (default: 10)

    Returns:
        Concise summary string, or None if history is too short to need summary
    """
    # Don't summarize if history is short enough to send in full
    if len(history) <= 15:
        return None

    # Summarize everything except the last 15 turns (those go in full)
    turns_to_summarize = history[:-15]

    # Only summarize if we have at least a few turns
    if len(turns_to_summarize) < 3:
        return None

    # Limit how many we actually summarize (for performance)
    if len(turns_to_summarize) > max_turns_to_summarize:
        turns_to_summarize = turns_to_summarize[-max_turns_to_summarize:]

    # Format conversation for summarization
    conversation_text = "\n".join([
        f"{turn.role.upper()}: {turn.content}"
        for turn in turns_to_summarize
    ])

    try:
        # Use fast model for summarization
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Fast and cheap for summarization
            messages=[
                {
                    "role": "system",
                    "content": "Summarize this HVAC service call conversation into 2-4 bullet points. Focus on: customer issue, location, any appointments made, and caller sentiment. Be concise."
                },
                {
                    "role": "user",
                    "content": conversation_text
                }
            ],
            max_tokens=150,
            temperature=0.3,  # Deterministic summarization
        )

        summary = response.choices[0].message.content.strip()
        logger.info(
            "Summarized %d conversation turns into %d chars",
            len(turns_to_summarize), len(summary)
        )
        return summary

    except Exception as e:
        logger.error("Failed to summarize conversation: %s", str(e))
        # Fallback: create a simple summary
        return f"Earlier in call: Customer mentioned {turns_to_summarize[0].content[:100]}..."


def get_context_efficient_history(
    history: List[ConversationTurn],
    include_summary: bool = True,
    max_recent_turns: int = 15
) -> tuple[Optional[str], List[ConversationTurn]]:
    """
    Get conversation history in a context-efficient format.

    Returns:
        Tuple of (summary_text, recent_turns)
        - summary_text: Compressed summary of old conversation (or None)
        - recent_turns: Last N turns in full detail
    """
    summary = None
    if include_summary and len(history) > max_recent_turns:
        summary = summarize_conversation(history)

    # Always return the most recent turns in full
    recent_turns = history[-max_recent_turns:] if len(history) > max_recent_turns else history

    return summary, recent_turns


def estimate_token_count(text: str) -> int:
    """
    Rough estimate of token count for text.

    Uses simple heuristic: ~4 characters per token on average.
    Good enough for context management decisions.

    Args:
        text: Text to estimate

    Returns:
        Estimated token count
    """
    return len(text) // 4


def should_summarize(history: List[ConversationTurn], token_limit: int = 3000) -> bool:
    """
    Decide if conversation history should be summarized based on token count.

    Args:
        history: Conversation history
        token_limit: Token limit for context (default: 3000)

    Returns:
        True if summarization would help stay under limit
    """
    total_chars = sum(len(turn.content) for turn in history)
    estimated_tokens = estimate_token_count(total_chars)

    return estimated_tokens > token_limit
