import json
import os
import logging
from typing import List, Dict, Any, Optional

# Configure logging
logger = logging.getLogger(__name__)
from datetime import datetime

class JSONDatabaseManager:
    """Database manager for credit card data stored in JSON format"""
    
    def __init__(self, json_file_path: str = "database.json"):
        self.json_file_path = json_file_path
        logger.info(f"🔧 Initializing JSONDatabaseManager with file: {json_file_path}")
        self.cards_data = self._load_cards_data()
    
    def _load_cards_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load credit card data from JSON file"""
        try:
            if os.path.exists(self.json_file_path):
                logger.info(f"📂 Loading credit card data from {self.json_file_path}")
                with open(self.json_file_path, 'r') as f:
                    data = json.load(f)
                logger.info(f"✅ Successfully loaded {len(data)} issuers from database")
                return data
            else:
                logger.warning(f"⚠️ {self.json_file_path} not found. Using empty database.")
                print(f"Warning: {self.json_file_path} not found. Using empty database.")
                return {}
        except Exception as e:
            logger.error(f"❌ Error loading database: {e}")
            print(f"Error loading database: {e}")
            return {}
    
    def get_all_cards(self) -> List[Dict[str, Any]]:
        """Get all credit cards from the database in a clean format for LLM analysis"""
        logger.info("📊 Getting all cards from database...")
        all_cards = []
        for issuer, cards in self.cards_data.items():
            for card in cards:
                # Standardize card format
                standardized_card = self._standardize_card_format(card, issuer)
                all_cards.append(standardized_card)
        logger.info(f"✅ Retrieved {len(all_cards)} total cards from database")
        return all_cards
    
    def _standardize_card_format(self, card: Dict[str, Any], issuer: str) -> Dict[str, Any]:
        """Convert card data to standardized format for LLM analysis"""
        # Extract annual fee
        annual_fee = 0.0
        if card.get("Annual fee"):
            fee_str = card["Annual fee"]
            if "$" in fee_str:
                try:
                    # Extract number from fee string
                    import re
                    fee_match = re.search(r'\$(\d+)', fee_str)
                    if fee_match:
                        annual_fee = float(fee_match.group(1))
                except:
                    annual_fee = 0.0
        
        # Determine card type
        category = card.get("Category", "").lower()
        card_type = "general"
        if "travel" in category or "airline" in category or "hotel" in category:
            card_type = "travel"
        elif "cash back" in category or "cashback" in category:
            card_type = "cashback"
        elif "student" in category:
            card_type = "student"
        elif "business" in category:
            card_type = "business"
        elif "secured" in category:
            card_type = "secured"
        
        # Determine credit score requirement
        credit_score = card.get("Credit score", "").lower()
        credit_score_required = "good"
        if "excellent" in credit_score:
            credit_score_required = "excellent"
        elif "fair" in credit_score:
            credit_score_required = "fair"
        elif "poor" in credit_score:
            credit_score_required = "poor"
        
        # Create rewards structure
        rewards_text = card.get("Rewards", "")
        rewards_structure = {"general": "1% rewards"}
        if "cash back" in rewards_text.lower():
            rewards_structure = {"cashback": "1.5% cash back"}
        elif "miles" in rewards_text.lower() or "points" in rewards_text.lower():
            rewards_structure = {"travel": "2x miles/points"}
        
        # Create benefits
        benefits = {
            "signup_bonus": card.get("Sign-up bonus", "Varies by card"),
            "foreign_fee": card.get("Foreign fee", "3%")
        }
        
        # Create eligibility criteria
        eligibility_criteria = {
            "credit_score": credit_score_required,
            "income": "no_minimum",
            "student": "student" in card_type
        }
        
        return {
            "name": card.get("Card name", "Unknown Card"),
            "issuer": issuer,
            "card_type": card_type,
            "annual_fee": annual_fee,
            "intro_apr": card.get("Intro APR", "N/A"),
            "regular_apr": card.get("Regular APR", "Variable APR"),
            "credit_score_required": credit_score_required,
            "income_required": "No minimum",
            "rewards_structure": json.dumps(rewards_structure),
            "benefits": json.dumps(benefits),
            "eligibility_criteria": json.dumps(eligibility_criteria),
            "url": "https://example.com",
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "target_audience": card.get("Target audience", ""),
            "category": card.get("Category", ""),
            "rewards": card.get("Rewards", ""),
            "signup_bonus": card.get("Sign-up bonus", ""),
            "foreign_fee": card.get("Foreign fee", ""),
            "credit_score": card.get("Credit score", "")
        }
    
    def get_all_cards_for_llm(self) -> List[Dict[str, Any]]:
        """Get all cards in a format optimized for LLM analysis"""
        all_cards = self.get_all_cards()
        print(f"📊 DEBUG: Total cards loaded from database: {len(all_cards)}")
        print(f"🔍 DEBUG: First 3 card names: {[card.get('Card name', 'Unknown') for card in all_cards[:3]]}")
        print(f"📊 DEBUG: Last 3 card names: {[card.get('Card name', 'Unknown') for card in all_cards[-3:]]}")
        logger.info(f"📊 Total cards available for LLM analysis: {len(all_cards)}")
        return all_cards
    
    def close(self):
        """Close database connection (no-op for JSON)"""
        pass 