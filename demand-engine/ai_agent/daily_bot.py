"""
Daily.co Bot Integration for AI Demo Agent
Handles joining Daily rooms, audio streaming, and OpenAI integration
"""

import asyncio
import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime
import httpx
from services.openai_service import get_openai_service
from ai_agent.sales_flow import PhaseManager, Phase, PHASE_CONFIGS, qualify_icp, CTA_OPTIONS

logger = logging.getLogger(__name__)

class DailyAIBot:
    """
    AI bot that joins Daily.co rooms and conducts sales demos
    Uses OpenAI for STT, LLM, and TTS
    """
    
    def __init__(self, meeting_id: str, room_name: str, ai_token: str):
        self.meeting_id = meeting_id
        self.room_name = room_name
        self.ai_token = ai_token
        
        self.openai_service = get_openai_service()
        self.phase_manager = PhaseManager()
        
        self.daily_api_key = os.getenv("DAILY_API_KEY")
        self.daily_api_url = "https://api.daily.co/v1"
        
        self.is_active = False
        self.is_listening = True
        self.total_cost = 0.0
        self.conversation_history = []
        self.discovery_answers = {}
        
    async def join_room(self):
        """
        Join Daily.co room as AI bot
        Uses Daily's bot API to join programmatically
        """
        try:
            logger.info(f"AI bot joining room: {self.room_name}")
            
            headers = {
                "Authorization": f"Bearer {self.daily_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "properties": {
                    "room_name": self.room_name,
                    "token": self.ai_token,
                    "user_name": "AI Sales Advisor",
                    "start_audio_only": True,  # No video
                    "start_audio_off": False   # Mic on
                }
            }
            
            # In production, use Daily's bot SDK or WebRTC connection
            # For now, this is a placeholder for the bot join logic
            
            self.is_active = True
            logger.info(f"AI bot successfully joined room: {self.room_name}")
            
            # Start the conversation
            await self.start_conversation()
            
        except Exception as e:
            logger.error(f"Error joining room: {e}")
            raise
    
    async def start_conversation(self):
        """
        Start the AI-led conversation
        Follows the 5-phase sales flow
        """
        try:
            # Phase 1: Framing
            await self.run_framing_phase()
            
            # Phase 2: Discovery
            await self.run_discovery_phase()
            
            # Qualify ICP
            icp_result = qualify_icp(self.discovery_answers)
            logger.info(f"ICP qualification: {icp_result}")
            
            # Phase 3: Pitch
            await self.run_pitch_phase()
            
            # Phase 4: Close
            cta_taken = await self.run_close_phase()
            
            # Phase 5: Exit
            await self.run_exit_phase(cta_taken)
            
            # End call
            await self.leave_room()
            
        except Exception as e:
            logger.error(f"Error in conversation: {e}")
            await self.leave_room()
    
    async def run_framing_phase(self):
        """Phase 1: Framing (0-2 min)"""
        logger.info("Starting Framing phase")
        self.phase_manager.current_phase = Phase.FRAMING
        
        config = PHASE_CONFIGS[Phase.FRAMING]
        
        # Get customer name from meeting data (placeholder)
        customer_name = "there"  # TODO: Get from database
        
        # Speak opening script
        for script in config.scripts:
            message = script.format(customer_name=customer_name)
            await self.speak(message)
            await asyncio.sleep(2)  # Pause between messages
        
        # Listen for customer response
        customer_response = await self.listen()
        
        if customer_response:
            self.conversation_history.append({
                "role": "user",
                "content": customer_response
            })
    
    async def run_discovery_phase(self):
        """Phase 2: Discovery (2-6 min)"""
        logger.info("Starting Discovery phase")
        self.phase_manager.current_phase = Phase.DISCOVERY
        
        questions = [
            "How many calls does your team handle per day?",
            "What's your biggest challenge with after-hours calls?",
            "Are you currently using any automation for calls or scheduling?"
        ]
        
        for question in questions:
            # Ask question
            await self.speak(question)
            
            # Listen for answer
            answer = await self.listen()
            
            if answer:
                self.conversation_history.append({
                    "role": "user",
                    "content": answer
                })
                
                # Store discovery answer
                if "calls" in question.lower():
                    # Extract call volume
                    try:
                        import re
                        numbers = re.findall(r'\d+', answer)
                        if numbers:
                            self.discovery_answers["daily_call_volume"] = int(numbers[0])
                    except:
                        pass
                
                elif "challenge" in question.lower():
                    self.discovery_answers["pain_points"] = [answer]
                
                elif "automation" in question.lower():
                    self.discovery_answers["current_automation"] = answer
                
                # Generate follow-up using LLM
                follow_up = await self.generate_follow_up(question, answer)
                if follow_up:
                    await self.speak(follow_up)
                    follow_up_answer = await self.listen()
                    if follow_up_answer:
                        self.conversation_history.append({
                            "role": "user",
                            "content": follow_up_answer
                        })
    
    async def run_pitch_phase(self):
        """Phase 3: Pitch (6-11 min) - Pre-written scripts only"""
        logger.info("Starting Pitch phase")
        self.phase_manager.current_phase = Phase.PITCH
        
        config = PHASE_CONFIGS[Phase.PITCH]
        
        # Use hard-coded scripts (no LLM for cost savings)
        industry = "HVAC"  # TODO: Get from customer data
        
        for script in config.scripts:
            message = script.format(industry=industry)
            await self.speak(message, use_llm=False)
            await asyncio.sleep(3)  # Pause between pitch blocks
    
    async def run_close_phase(self) -> str:
        """Phase 4: Close (11-14 min)"""
        logger.info("Starting Close phase")
        self.phase_manager.current_phase = Phase.CLOSE
        
        config = PHASE_CONFIGS[Phase.CLOSE]
        
        # Present CTA options
        customer_name = "there"  # TODO: Get from database
        
        for script in config.scripts:
            message = script.format(customer_name=customer_name)
            await self.speak(message)
        
        # Listen for CTA choice
        cta_response = await self.listen()
        
        # Detect which CTA was chosen
        cta_taken = "none"
        if cta_response:
            response_lower = cta_response.lower()
            if "call" in response_lower or "team" in response_lower or "1" in response_lower:
                cta_taken = "book_human_call"
            elif "trial" in response_lower or "2" in response_lower:
                cta_taken = "start_trial"
            elif "deck" in response_lower or "pricing" in response_lower or "3" in response_lower:
                cta_taken = "get_deck"
        
        return cta_taken
    
    async def run_exit_phase(self, cta_taken: str):
        """Phase 5: Exit (14-15 min)"""
        logger.info("Starting Exit phase")
        self.phase_manager.current_phase = Phase.EXIT
        
        config = PHASE_CONFIGS[Phase.EXIT]
        
        # Get action description
        action_taken = CTA_OPTIONS.get(cta_taken, {}).get("script", "noted your interest")
        
        customer_name = "there"  # TODO: Get from database
        company_name = "your company"  # TODO: Get from database
        
        for script in config.scripts:
            message = script.format(
                action_taken=action_taken,
                customer_name=customer_name,
                company_name=company_name
            )
            await self.speak(message)
            await asyncio.sleep(1)
    
    async def speak(self, text: str, use_llm: bool = True):
        """
        Convert text to speech and play in Daily room
        
        Args:
            text: Text to speak
            use_llm: Whether to use LLM for dynamic responses
        """
        try:
            logger.info(f"AI speaking: {text[:50]}...")
            
            # Generate TTS audio
            tts_result = await self.openai_service.synthesize_speech(text)
            
            # Track cost
            self.total_cost += tts_result["cost"]
            self.phase_manager.total_cost = self.total_cost
            
            # In production: Send audio to Daily.co room via WebRTC
            # For now, just log
            logger.info(f"TTS cost: ${tts_result['cost']:.4f}, Total: ${self.total_cost:.4f}")
            
            # Add to conversation history
            self.conversation_history.append({
                "role": "assistant",
                "content": text
            })
            
        except Exception as e:
            logger.error(f"Error speaking: {e}")
    
    async def listen(self, timeout: int = 10) -> Optional[str]:
        """
        Listen for customer response
        Uses STT to transcribe audio
        
        Args:
            timeout: Max seconds to wait for response
            
        Returns:
            Transcribed text or None
        """
        try:
            if not self.is_listening:
                return None
            
            logger.info("AI listening for customer response...")
            
            # In production: Capture audio from Daily.co room via WebRTC
            # For now, simulate with placeholder
            await asyncio.sleep(timeout)
            
            # Placeholder: In production, this would be real audio
            # audio_data = await self.capture_audio_from_daily()
            # stt_result = await self.openai_service.transcribe_audio(audio_data)
            
            # For testing, return None (no audio captured)
            return None
            
        except Exception as e:
            logger.error(f"Error listening: {e}")
            return None
    
    async def generate_follow_up(self, question: str, answer: str) -> Optional[str]:
        """
        Generate intelligent follow-up question using LLM
        """
        try:
            system_prompt = """You are an AI sales advisor conducting discovery.
Generate ONE short follow-up question (max 15 words) based on the customer's answer.
Be conversational and natural. Focus on uncovering pain points and urgency."""
            
            messages = [
                {"role": "user", "content": f"Question: {question}\nAnswer: {answer}\n\nGenerate follow-up:"}
            ]
            
            response = await self.openai_service.generate_response(
                messages=messages,
                system_prompt=system_prompt,
                use_premium=False,  # Use fast model
                max_tokens=50,
                temperature=0.7
            )
            
            # Track cost
            self.total_cost += response["cost"]
            self.phase_manager.total_cost = self.total_cost
            
            return response["text"]
            
        except Exception as e:
            logger.error(f"Error generating follow-up: {e}")
            return None
    
    async def leave_room(self):
        """Leave Daily.co room and cleanup"""
        try:
            logger.info(f"AI bot leaving room: {self.room_name}")
            
            self.is_active = False
            
            # In production: Disconnect from Daily.co room
            
            # Log final stats
            logger.info(f"Call completed. Total cost: ${self.total_cost:.4f}")
            
            # TODO: Save call log to database
            
        except Exception as e:
            logger.error(f"Error leaving room: {e}")


async def start_ai_bot(meeting_id: str, room_name: str, ai_token: str):
    """
    Start AI bot for a meeting
    This should be called 30 seconds before scheduled time
    """
    try:
        bot = DailyAIBot(meeting_id, room_name, ai_token)
        await bot.join_room()
    except Exception as e:
        logger.error(f"Error starting AI bot: {e}")
        raise
