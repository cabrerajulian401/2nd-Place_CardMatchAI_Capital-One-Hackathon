from typing import Dict, Any, List, Optional, Type
from langchain.tools import BaseTool
from pydantic import BaseModel, Field, PrivateAttr
import os
import json
import logging
from data_pipeline.database import JSONDatabaseManager
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('credit_card_analysis.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ParallelCardAnalysisInput(BaseModel):
    user_profile: Dict[str, Any] = Field(description="Complete user profile with all 9 questions answered")

class SubAgentCardAnalysisTool(BaseTool):
    name: str = "sub_agent_card_analysis"
    description: str = "Analyze half of the credit card database and return top 50% most relevant cards"
    args_schema: Type[BaseModel] = ParallelCardAnalysisInput
    _db_manager: Optional[JSONDatabaseManager] = PrivateAttr()
    _agent_id: str = PrivateAttr()

    def __init__(self, db_manager: JSONDatabaseManager, agent_id: str):
        super().__init__()
        self._db_manager = db_manager
        self._agent_id = agent_id
        logger.info(f"🔧 Initialized {self._agent_id} with database manager")

    def _run(self, user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        try:
            
            
            # Get all cards from database
            all_cards = self._db_manager.get_all_cards_for_llm()
            logger.info(f"📊 {self._agent_id.upper()} loaded {len(all_cards)} total cards from database")
            print(f" DEBUG: {self._agent_id.upper()} - Loaded {len(all_cards)} cards from database")
            
            # Split cards based on agent ID (0, 1, or 2) - 33% each
            if self._agent_id == "agent_0":
                cards_to_analyze = all_cards[:len(all_cards)//3]  # First third
                logger.info(f"🔪 {self._agent_id.upper()} analyzing first third: {len(cards_to_analyze)} cards")
                print(f" DEBUG: {self._agent_id.upper()} - Analyzing first third: {len(cards_to_analyze)} cards")
            elif self._agent_id == "agent_1":
                cards_to_analyze = all_cards[len(all_cards)//3:2*len(all_cards)//3]  # Second third
                logger.info(f"🔪 {self._agent_id.upper()} analyzing second third: {len(cards_to_analyze)} cards")
                print(f" DEBUG: {self._agent_id.upper()} - Analyzing second third: {len(cards_to_analyze)} cards")
            else:  # agent_2
                cards_to_analyze = all_cards[2*len(all_cards)//3:]  # Third third
                logger.info(f"🔪 {self._agent_id.upper()} analyzing third third: {len(cards_to_analyze)} cards")
                print(f" DEBUG: {self._agent_id.upper()} - Analyzing third third: {len(cards_to_analyze)} cards")
            
            print(f" {self._agent_id.upper()} ANALYZING {len(cards_to_analyze)} cards...")
            print(f" DEBUG: {self._agent_id.upper()} - Card names in this batch:")
            for i, card in enumerate(cards_to_analyze[:5]):  # Show first 5
                print(f"  {i+1}. {card.get('Card name', 'Unknown')}")
            
            # Create card data for analysis (simplified to reduce token count)
            card_data_for_llm = []
            for card in cards_to_analyze:
                # Simplified card info to reduce token count
                card_info = {
                    "name": card.get("name", "Unknown"),
                    "issuer": card.get("issuer", "Unknown"),
                    "annual_fee": card.get("annual_fee", 0),
                    "credit_score_required": card.get("credit_score_required", "good"),
                    "rewards": card.get("rewards", ""),
                    "category": card.get("category", ""),
                    "target_audience": card.get("target_audience", "")
                }
                card_data_for_llm.append(card_info)
            
            logger.info(f"📋 {self._agent_id.upper()} prepared {len(card_data_for_llm)} cards for analysis")
            print(f" DEBUG: {self._agent_id.upper()} - Prepared {len(card_data_for_llm)} cards for LLM")
            
            # Check if user is a student
            is_student = user_profile.get('credit_situation', '').lower().find('student') != -1
            print(f" DEBUG: {self._agent_id.upper()} - User is student: {is_student}")
            
            # Create simplified sub-agent analysis prompt with student handling
            student_instruction = ""
            if is_student:
                student_instruction = """
IMPORTANT: The user is a STUDENT. Prioritize student-specific credit cards and cards designed for people with limited credit history. Look for cards with:
- Student-focused features
- Lower credit requirements
- Educational benefits
- No annual fees (preferred)
- Credit building features
"""
            
            sub_agent_prompt = f"""You are a credit card analyst ({self._agent_id.upper()}). 
Analyze {len(card_data_for_llm)} cards and select the TOP 50% most relevant ones.

USER: {user_profile.get('primary_goal', '')} | {user_profile.get('credit_score', '')} | {user_profile.get('monthly_spending', '')} | Credit Situation: {user_profile.get('credit_situation', '')}

{student_instruction}

CARDS: {json.dumps(card_data_for_llm, indent=1)}

TASK: Select ~{len(card_data_for_llm)//2} best cards. Return JSON array with "name" and "reasoning" fields."""

            
            # Return the cards for this agent to analyze
            result = {
                "agent_id": self._agent_id,
                "cards_analyzed": len(card_data_for_llm),
                "cards": card_data_for_llm,
                "user_profile": user_profile,
                "analysis_prompt": sub_agent_prompt
            }
            
            logger.info(f" {self._agent_id.upper()} completed data preparation")
            print(f" DEBUG: {self._agent_id.upper()} - Completed data preparation")
            return result
            
        except Exception as e:
            logger.error(f" Error in {self._agent_id} analysis: {e}")
            print(f" DEBUG: {self._agent_id.upper()} - ERROR: {e}")
            return {"agent_id": self._agent_id, "cards": [], "user_profile": user_profile}

class FinalCardSelectionTool(BaseTool):
    name: str = "final_card_selection"
    description: str = "Take results from both sub-agents and select the best 3 cards"
    args_schema: Type[BaseModel] = ParallelCardAnalysisInput
    _db_manager: Optional[JSONDatabaseManager] = PrivateAttr()

    def __init__(self, db_manager: JSONDatabaseManager):
        super().__init__()
        self._db_manager = db_manager
        logger.info(" Initialized Final Card Selection Tool")

    def _run(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        try:
            logger.info(" Final agent starting analysis...")
            
            # Get all cards from database
            all_cards = self._db_manager.get_all_cards_for_llm()
            logger.info(f" Final agent loaded {len(all_cards)} total cards")
            
        
            
            # Create comprehensive card data for final LLM analysis (simplified)
            card_data_for_llm = []
            for card in all_cards:
                # Simplified card info to reduce token count
                card_info = {
                    "name": card.get("name", "Unknown"),
                    "issuer": card.get("issuer", "Unknown"),
                    "annual_fee": card.get("annual_fee", 0),
                    "credit_score_required": card.get("credit_score_required", "good"),
                    "rewards": card.get("rewards", ""),
                    "category": card.get("category", ""),
                    "target_audience": card.get("target_audience", "")
                }
                card_data_for_llm.append(card_info)
            
            logger.info(f" Final agent prepared {len(card_data_for_llm)} cards for analysis")
            
            # Return all cards with user profile for final LLM analysis
            result = {
                "all_cards": card_data_for_llm,
                "user_profile": user_profile,
                "total_cards_available": len(card_data_for_llm),
                "selection_instructions": "Select the BEST 3 cards for this user based on their profile."
            }
            
            logger.info("Final agent completed data preparation")
            return result
            
        except Exception as e:
            logger.error(f" Error in final card selection: {e}")
            return {"error": str(e), "all_cards": [], "user_profile": user_profile}

def create_tools():
    """Create and return all tools"""
    logger.info(" Creating tools")
    
    # Initialize database manager
    db_manager = JSONDatabaseManager()
    logger.info(" Database manager initialized")
    
    # Initialize tools
    sub_agent_0 = SubAgentCardAnalysisTool(db_manager, "agent_0")
    sub_agent_1 = SubAgentCardAnalysisTool(db_manager, "agent_1")
    sub_agent_2 = SubAgentCardAnalysisTool(db_manager, "agent_2")
    final_agent = FinalCardSelectionTool(db_manager)
    
    logger.info(" All tools created ")
    
    return {
        "sub_agent_0": sub_agent_0,
        "sub_agent_1": sub_agent_1,
        "sub_agent_2": sub_agent_2,
        "final_agent": final_agent
    } 
