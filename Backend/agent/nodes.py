from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
import os
import json
import logging
from concurrent.futures import ThreadPoolExecutor
import re # Added for structured card extraction

# Configure logging
logger = logging.getLogger(__name__)

class State:
    # initiating the state for the conversation and initializing the required fields/parameters
    def __init__(self):
        self.user_profile = {
            'primary_goal': None,
            'top_spend_category': None,
            'brand_preferences': None,
            'travel_frequency': None,
            'monthly_spending': None,
            'payment_behavior': None,
            'income': None,
            'credit_score': None,
            'credit_situation': None
        }
        self.conversation_history = []
        self.current_question = None
        self.analysis_result = None
        self.questions_completed = False

class QuestionAskerNode:
    
    
    def __init__(self):
        # LLM Configuration
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",  # Changed from gpt-4 to reduce token usage
            temperature=0.7,  # ⚠️ EDIT HERE for creativity
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
       
        self.questions = [
            {
                'field': 'primary_goal',
                'question': "What's your main goal for a credit card? (Travel rewards, Cash back, Building credit, etc.)",
                'follow_up': "Great! Focusing on {answer}."
            },
            {
                'field': 'top_spend_category',
                'question': "Which category do you spend the most on each month? (Dining, Travel, Shopping, Gas, etc.)",
                'follow_up': "Perfect! {answer} is a great category to optimize rewards on."
            },
            {
                'field': 'brand_preferences',
                'question': "Do you regularly shop with any of these brands? (Amazon, Apple, Costco, Walmart, airlines/hotels)",
                'follow_up': "Thanks! Those brand preferences will help us find better rewards."
            },
            {
                'field': 'travel_frequency',
                'question': "How often do you travel by air each year?",
                'follow_up': "That travel frequency will help determine if travel rewards make sense."
            },
            {
                'field': 'monthly_spending',
                'question': "Approximately how much do you charge on credit cards per month?",
                'follow_up': "That spending level will help calculate the value of different rewards."
            },
            {
                'field': 'payment_behavior',
                'question': "Do you typically pay your balance in full each month, or carry a balance?",
                'follow_up': "That payment behavior is important for choosing the right card type."
            },
            {
                'field': 'income',
                'question': "What is your gross annual income (before taxes)?",
                'follow_up': "That income level will help identify cards you're eligible for."
            },
            {
                'field': 'credit_score',
                'question': "What is your credit score range?",
                'follow_up': "Your credit score will help find cards that match your profile."
            },
            {
                'field': 'credit_situation',
                'question': "Which describes your credit situation: Student with little history, Building/rebuilding credit, or Established credit?",
                'follow_up': "That credit situation will help find the right type of card."
            }
        ]
    
    
    def ask_question(self, state: State, user_response: str = None) -> Dict[str, Any]:
        
        
        # If we have a user response, update the profile
        if user_response and state.current_question:
            field = state.current_question['field']
            state.user_profile[field] = user_response
            state.conversation_history.append({
                'role': 'user',
                'content': user_response
            })
        
        # Get the next question
        next_question = self.get_next_question(state)
        
        if next_question:
            # Generate contextual question
            contextual_question = self._generate_contextual_question(next_question, state)
            
            state.current_question = next_question
            state.conversation_history.append({
                'role': 'assistant',
                'content': contextual_question
            })
            
            return {
                "response": contextual_question,
                "is_complete": False,
                "current_question": next_question['field']
            }
        else:
            # All questions completed
            state.questions_completed = True
            return {
                "response": "Perfect! I have all the information I need. Let me analyze your profile and find the best credit cards for you.",
                "is_complete": True,
                "current_question": None
            }
    
    
    def submit_complete_profile(self, state: State, complete_profile: Dict[str, Any]) -> Dict[str, Any]:
       # Submit a complete user profile in one call
        try:
            # Validate that all required fields are present
            required_fields = [
                'primary_goal', 'top_spend_category', 'brand_preferences',
                'travel_frequency', 'monthly_spending', 'payment_behavior',
                'income', 'credit_score', 'credit_situation'
            ]
            
            missing_fields = []
            for field in required_fields:
                if field not in complete_profile or not complete_profile[field]:
                    missing_fields.append(field)
            
            if missing_fields:
                return {
                    "response": f"Missing required fields: {', '.join(missing_fields)}. Please provide all required information.",
                    "is_complete": False,
                    "error": f"Missing fields: {missing_fields}"
                }
            
            # Update the state with complete profile
            state.user_profile.update(complete_profile)
            state.questions_completed = True
            
            # Add to conversation history
            state.conversation_history.append({
                'role': 'user',
                'content': f"Complete profile submitted: {complete_profile}"
            })
            
            return {
                "response": "Profile received! Analyzing your information to find the best credit cards for you.",
                "is_complete": True,
                "profile_complete": True
            }
            
        except Exception as e:
            return {
                "response": f"Error processing profile: {str(e)}",
                "is_complete": False,
                "error": str(e)
            }
    
    def get_next_question(self, state: State) -> Dict[str, Any]:
        # Get the next unanswered question
        for question_data in self.questions:
            if state.user_profile[question_data['field']] is None:
                return question_data
        return None
    
    def _generate_contextual_question(self, question_data: Dict[str, Any], state: State) -> str:
        # Generate a contextual question based on previous answers
        
       
        return question_data['question']

class FinalAnalysisNode:
    # Node responsible for final analysis and recommendations
    
    def __init__(self, tools: Dict[str, Any]):
        # LLM Configuration
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",  # Changed from gpt-4 to reduce token usage
            temperature=0.3,  
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.tools = tools
    
   
    def analyze_and_recommend(self, state: State) -> Dict[str, Any]:
        """Perform final analysis using parallel sub-agents and final decision maker"""
        
        try:
            logger.info("Starting Analysis...")
            print("Starting Analysis")
            
            # Get sub-agents
            sub_agent_0 = self.tools.get("sub_agent_0")
            sub_agent_1 = self.tools.get("sub_agent_1")
            sub_agent_2 = self.tools.get("sub_agent_2")
            final_agent = self.tools.get("final_agent")
            
            logger.info("🔧 Retrieved tools from toolset")
            
            if not all([sub_agent_0, sub_agent_1, sub_agent_2, final_agent]):
                logger.error(" Required tools not available")
                raise Exception("Required tools not available")
            
            # Run sub-agents in parallel with LLM analysis
            logger.info("🔄 Running sub-agents in parallel with LLM analysis...")
            print(f"Running sub-agents in parallel with LLM analysis...")
            
            # Use ThreadPoolExecutor for parallel execution & Using Logging to see on our Backend Server when Hosted
            with ThreadPoolExecutor(max_workers=3) as executor:
                logger.info(" Submitting sub-agents to thread pool...")
                # Submit all three sub-agents to run in parallel
                future_0 = executor.submit(self._run_sub_agent_llm, sub_agent_0, state.user_profile)
                future_1 = executor.submit(self._run_sub_agent_llm, sub_agent_1, state.user_profile)
                future_2 = executor.submit(self._run_sub_agent_llm, sub_agent_2, state.user_profile)
                
                logger.info("⏳ Waiting for sub-agent results...")
                # Get results from all three sub-agents
                result_0 = future_0.result()
                result_1 = future_1.result()
                result_2 = future_2.result()
            
            logger.info(f" Sub-agent 0 selected {len(result_0.get('selected_cards', []))} cards")
            logger.info(f"Sub-agent 1 selected {len(result_1.get('selected_cards', []))} cards")
            logger.info(f" Sub-agent 2 selected {len(result_2.get('selected_cards', []))} cards")
           
            
            # Combine selected cards from all three sub-agents
            combined_cards = []
            combined_cards.extend(result_0.get("selected_cards", []))
            combined_cards.extend(result_1.get("selected_cards", []))
            combined_cards.extend(result_2.get("selected_cards", []))
            
            logger.info(f" Combining selected cards from all three sub-agents")
           
            
            # Use final agent to select best 3 cards from the combined selection
            logger.info(" Starting final agent analysis")
            
            # Use the combined cards from sub-agents instead of loading all cards again
            final_cards = combined_cards
            user_profile = state.user_profile
            selection_instructions = "Select the BEST 3 cards from the pre-filtered selection."
            
            logger.info(" Final agent analyzing pre-filtered cards from sub-agents")
            
            # Generate final recommendation using LLM analysis
            logger.info("Starting final recommendation generation")
            recommendation = self._generate_llm_recommendation(
                user_profile, 
                final_cards,
                selection_instructions
            )
            
            state.analysis_result = {
                "recommendation": recommendation,
                "all_cards_analyzed": len(final_cards),
                "user_profile": user_profile,
                "sub_agent_results": {
                    "agent_0": result_0.get("cards_analyzed", 0),
                    "agent_1": result_1.get("cards_analyzed", 0),
                    "agent_2": result_2.get("cards_analyzed", 0)
                }
            }
            
            logger.info(" Analysis completed successfully")
            
            state.conversation_history.append({
                'role': 'assistant',
                'content': recommendation
            })
            
            return {
                "response": recommendation,
                "is_complete": True,
                "analysis_result": state.analysis_result
            }
            
        except Exception as e:
            logger.error(f" Error in analyze_and_recommend: {e}")
            error_response = f"I apologize, but I encountered an error while analyzing your profile: {str(e)}. Please try again."
            state.conversation_history.append({
                'role': 'assistant',
                'content': error_response
            })
            
            return {
                "response": error_response,
                "is_complete": True,
                "analysis_result": None
            }
    
    def _run_sub_agent_llm(self, sub_agent, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Run LLM analysis for a sub-agent to reduce card selection by 50%"""
        try:
            logger.info(f" Starting sub-agent LLM analysis")
          
            # Get sub-agent data
            sub_agent_data = sub_agent._run(user_profile)
            cards_to_analyze = sub_agent_data.get("cards", [])
            analysis_prompt = sub_agent_data.get("analysis_prompt", "")
            agent_id = sub_agent_data.get("agent_id", "unknown")
            
         
           
            for i, card in enumerate(cards_to_analyze[:3]):
                print(f"  {i+1}. {card.get('name', 'Unknown')}")
            
            
            # Check if user is a student
            is_student = user_profile.get('credit_situation', '').lower().find('student') != -1
            
            # Create student-specific instructions for sub-agents
            student_instruction = ""
            if is_student:
                student_instruction = """
IMPORTANT: The user is a STUDENT. Prioritize student-specific credit cards and cards designed for people with limited credit history. Look for:
- Student-focused cards
- Lower credit requirements
- No annual fees (preferred)
- Credit building features
- Educational benefits
"""
            
            # Create LLM prompt for sub-agent
            prompt = f"""You are a specialized credit card analyst. Your task is to analyze the provided cards and select the TOP 50% most relevant ones.

{analysis_prompt}

{student_instruction}

IMPORTANT: Return your response as a JSON array of objects with "name" and "reasoning" fields.
Example format:
[
  {{"name": "Card Name", "reasoning": "Brief explanation"}},
  {{"name": "Another Card", "reasoning": "Brief explanation"}}
]"""

          

            # Call LLM for sub-agent analysis
            messages = [
                SystemMessage(content=f"You are a specialized credit card analyst ({agent_id.upper()}). Your job is to analyze cards and select the top 50% most relevant ones."),
                HumanMessage(content=prompt)
            ]
            
         
            response = self.llm.invoke(messages)
            logger.info(f" response received ({len(response.content)} characters)")
            print(f"  LLM response received ({len(response.content)} characters)")
            print(f" response preview: {response.content[:200]}...")
            
            # Parse the response to extract selected cards
            try:
                import json
                selected_cards_data = json.loads(response.content)
                selected_cards = []
                
                logger.info(f"🔍 {agent_id.upper()} parsing LLM response...")
                print(f" DEBUG: {agent_id.upper()} - Parsing LLM response...")
                print(f" DEBUG: {agent_id.upper()} - LLM returned {len(selected_cards_data)} card selections")
                
                for i, card_data in enumerate(selected_cards_data):
                    card_name = card_data.get("name", "")
                    print(f" DEBUG: {agent_id.upper()} - LLM selected card {i+1}: '{card_name}'")
                    
                    # Find the full card data by name
                    found_card = None
                    for card in cards_to_analyze:
                        if card.get("name") == card_name:
                            found_card = card
                            print(f" DEBUG: {agent_id.upper()} - Found matching card: '{card_name}'")
                            break
                    
                    if found_card:
                        selected_cards.append(found_card)
                    else:
                        print(f" DEBUG: {agent_id.upper()} - No match found for LLM card: '{card_name}'")
                
  
                for i, card in enumerate(selected_cards):
                    print(f"  {i+1}. {card.get('name', 'Unknown')}")
                
                return {
                    "agent_id": agent_id,
                    "selected_cards": selected_cards,
                    "total_analyzed": len(cards_to_analyze),
                    "llm_response": response.content
                }
                
            except json.JSONDecodeError:
            
                # Fallback: return first 50% of cards
                fallback_cards = cards_to_analyze[:len(cards_to_analyze)//2]
                return {
                    "agent_id": agent_id,
                    "selected_cards": fallback_cards,
                    "total_analyzed": len(cards_to_analyze),
                    "llm_response": "Fallback selection"
                }
                
        except Exception as e:
            logger.error(f"❌ {agent_id.upper()} LLM analysis failed: {e}")
            print(f" {agent_id.upper()} LLM analysis failed: {e}")
            # Fallback: return first 50% of cards
            fallback_cards = cards_to_analyze[:len(cards_to_analyze)//2] if 'cards_to_analyze' in locals() else []
            return {
                "agent_id": agent_id,
                "selected_cards": fallback_cards,
                "total_analyzed": len(cards_to_analyze) if 'cards_to_analyze' in locals() else 0,
                "llm_response": f"Error: {str(e)}"
            }
    
    # ⚠️ EDIT HERE: LLM-based recommendation generation
    def _generate_llm_recommendation(self, user_profile: Dict[str, Any], all_cards: List[Dict[str, Any]], selection_instructions: str) -> Dict[str, Any]:
        """Generate a comprehensive recommendation using LLM analysis of all available cards"""
        
        logger.info("🤖 Starting final LLM recommendation generation...")
        print(f" DEBUG: Starting final LLM recommendation generation...")
        print(f" DEBUG: Received {len(all_cards)} cards for final analysis")
        
        # Create hybrid profile summary
        hybrid_profile = self._create_hybrid_profile(user_profile)
        logger.info(" Created hybrid profile summary")
       
        
        # Prepare comprehensive card data for LLM analysis
        card_data_summary = []
      
        for i, card in enumerate(all_cards):
            # FIX: Use the correct field names that match the database
            card_summary = {
                'name': card.get('name', card.get('Card name', 'Unknown')),  # Try both field names
                'issuer': card.get('issuer', card.get('Issuer', 'Unknown')),  # Try both field names
                'category': card.get('category', card.get('Category', '')),
                'annual_fee': card.get('annual_fee', card.get('Annual fee', 'N/A')),
                'intro_apr': card.get('intro_apr', card.get('Intro APR', 'N/A')),
                'regular_apr': card.get('regular_apr', card.get('Regular APR', 'Variable')),
                'credit_score': card.get('credit_score_required', card.get('Credit score', 'Good')),
                'rewards': card.get('rewards', card.get('Rewards', '')),
                'signup_bonus': card.get('signup_bonus', card.get('Sign-up bonus', '')),
                'foreign_fee': card.get('foreign_fee', card.get('Foreign fee', '')),
                'target_audience': card.get('target_audience', card.get('Target audience', ''))
            }
            card_data_summary.append(card_summary)
            if i < 3:  # Show first 3 cards
                print(f" DEBUG: Card {i+1}: {card_summary['name']} by {card_summary['issuer']}")
        
        logger.info(f"📋 Prepared {len(card_data_summary)} cards for final analysis")
        print(f" DEBUG: Prepared {len(card_data_summary)} cards for final LLM analysis")
        
        # Check if user is a student
        is_student = user_profile.get('credit_situation', '').lower().find('student') != -1
        print(f" DEBUG: User is student: {is_student}")
        
        # Create student-specific instructions
        student_instruction = ""
        if is_student:
            student_instruction = """
IMPORTANT: The user is a STUDENT. You MUST prioritize student-specific credit cards and cards designed for people with limited credit history. 

STUDENT CARD CRITERIA:
- Prioritize cards specifically designed for students
- Look for cards with lower credit requirements
- Prefer cards with no annual fees
- Focus on cards with credit building features
- Consider cards with educational benefits or student-specific rewards
- Avoid cards requiring excellent credit scores
- If student cards are available, they should be your top recommendations

If student-specific cards are available in the database, they should be your primary recommendations.
"""
        
        # Generate comprehensive LLM prompt for card selection
        prompt = f"""You are a credit card expert. Select the BEST 3 cards for this user and return them in a structured format.

IMPORTANT: You MUST use the EXACT card names from the database. Do not make up or modify card names.

USER: {user_profile.get('primary_goal', '')} | {user_profile.get('credit_score', '')} | {user_profile.get('monthly_spending', '')} | Credit Situation: {user_profile.get('credit_situation', '')}

{student_instruction}

CARDS ({len(all_cards)} total): {json.dumps(card_data_summary, indent=1)}

TASK: Select exactly 3 cards ranked by suitability. For each card, return:
1. The exact card name
2. All the card details (Issuer, Annual Fee, Credit Score, Regular APR, Rewards, etc.)
3. Detailed reasoning for why this card was selected

Return the response in this exact format:
1. **Card Name**
   - **Issuer:** [Issuer]
   - **Annual Fee:** [Annual Fee]
   - **Credit Score:** [Credit Score]
   - **Regular APR:** [Regular APR]
   - **Rewards:** [Rewards]
   - **Sign-up Bonus:** [Sign-up Bonus]
   - **Target Audience:** [Target Audience]

   **Reasoning:** [Detailed explanation of why this card was selected]

2. **Card Name**
   [Same format as above]

3. **Card Name**
   [Same format as above]"""


        try:
            logger.info(f"🤖 Attempting LLM analysis with {len(all_cards)} cards...")
            print(f" Attempting LLM analysis with {len(all_cards)} cards...")
            messages = [
                SystemMessage(content="You are an expert credit card advisor with deep knowledge of all available cards. Your job is to analyze the complete card database and select the best 3 cards for each user based on their specific profile. Always return the exact card details from the database."),
                HumanMessage(content=prompt)
            ]
            
           
            response = self.llm.invoke(messages)
          
            
            # Return structured response
            structured_cards = self._extract_structured_cards(response.content, all_cards)
       
            
            return {
                "text_response": response.content,
                "structured_cards": structured_cards
            }
        except Exception as e:
    
            # Fallback recommendation
            fallback_text = self._generate_fallback_recommendation(user_profile, all_cards[:3] if all_cards else [])
            return {
                "text_response": fallback_text,
                "structured_cards": self._extract_structured_cards(fallback_text, all_cards[:3] if all_cards else [])
            }

    def _extract_structured_cards(self, response_text: str, all_cards: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract structured card data from LLM response"""
        structured_cards = []
        
    
        # Debug: Log all available card names
        available_card_names = []
        for card in all_cards:
            # Try both field name formats
            card_name = card.get('name', card.get('Card name', 'Unknown'))
            available_card_names.append(card_name)
        
        print(f" DEBUG: Available card names in database:")
        for i, name in enumerate(available_card_names[:10]):  
            print(f"  {i+1}. {name}")
        
        # Split by numbered items
        card_blocks = re.split(r'(?=\d+\.\s+\*\*)\s*', response_text)
        card_blocks = [block.strip() for block in card_blocks if block.strip()]
        
        print(f" DEBUG: Found {len(card_blocks)} card blocks in LLM response")
        
        for i, block in enumerate(card_blocks):
            print(f" DEBUG: Processing card block {i+1}...")
            
            # Extract card name
            name_match = re.search(r'\*\*([^*]+)\*\*', block)
            if not name_match:
                print(f" DEBUG: No card name found in block {i+1}")
                continue
                
            card_name = name_match.group(1).strip()
            print(f" DEBUG: LLM returned card name: '{card_name}'")
            
            # Find the actual card data from database
            card_data = None
            for card in all_cards:
                # Try both field name formats
                db_card_name = card.get('name', card.get('Card name', ''))
                if db_card_name.lower() == card_name.lower():
                    card_data = card
                    print(f" DEBUG:  Found exact match: '{db_card_name}'")
                    break
        
            if not card_data:
                print(f" DEBUG:  No exact match found for: '{card_name}'")
                # Try fuzzy matching
                for card in all_cards:
                    db_card_name = card.get('name', card.get('Card name', ''))
                    if any(word in db_card_name.lower() for word in card_name.lower().split()):
                        card_data = card
                        print(f" DEBUG:  Fuzzy match found: '{db_card_name}' for '{card_name}'")
                        break
            
            if card_data:
                structured_card = {
                    'name': card_data.get('name', card_data.get('Card name', card_name)),
                    'issuer': card_data.get('issuer', card_data.get('Issuer', 'Unknown')),
                    'category': card_data.get('category', card_data.get('Category', '')),
                    'annual_fee': card_data.get('annual_fee', card_data.get('Annual fee', 'N/A')),
                    'intro_apr': card_data.get('intro_apr', card_data.get('Intro APR', 'N/A')),
                    'regular_apr': card_data.get('regular_apr', card_data.get('Regular APR', 'Variable')),
                    'credit_score': card_data.get('credit_score_required', card_data.get('Credit score', 'Good')),
                    'rewards': card_data.get('rewards', card_data.get('Rewards', '')),
                    'signup_bonus': card_data.get('signup_bonus', card_data.get('Sign-up bonus', '')),
                    'foreign_fee': card_data.get('foreign_fee', card_data.get('Foreign fee', '')),
                    'target_audience': card_data.get('target_audience', card_data.get('Target audience', '')),
                    'reasoning': self._extract_reasoning(block)
                }
                structured_cards.append(structured_card)
                print(f" DEBUG:  Added structured card: {structured_card['name']}")
            else:
                print(f"�� DEBUG:  Could not find card data for: '{card_name}'")
        
        print(f" DEBUG: Final structured cards count: {len(structured_cards)}")
        for i, card in enumerate(structured_cards):
            print(f" DEBUG: Structured card {i+1}: {card['name']} by {card['issuer']}")
        
        return structured_cards

    def _extract_reasoning(self, card_block: str) -> str:
        """Extract reasoning from card block"""
        reasoning_match = re.search(r'\*\*Reasoning:\*\*\s*(.+?)(?=\n\n|\n\d+\.|$)', card_block, re.DOTALL)
        if reasoning_match:
            return reasoning_match.group(1).strip()
        return ""
    
    #  Profile summary creation
    def _create_hybrid_profile(self, user_profile: Dict[str, Any]) -> str:
        """Create a hybrid profile summary with detailed questionnaire responses"""
        parts = []
        
        # Primary goal and motivation
        if user_profile.get('primary_goal'):
            parts.append(f"Primary goal: {user_profile['primary_goal']}")
        
        # Spending patterns
        if user_profile.get('top_spend_category'):
            parts.append(f"Top spending category: {user_profile['top_spend_category']}")
        
        if user_profile.get('brand_preferences'):
            brand_prefs = user_profile['brand_preferences']
            if isinstance(brand_prefs, list):
                brand_prefs = ', '.join(brand_prefs)
            parts.append(f"Brand preferences: {brand_prefs}")
        
        # Travel behavior
        if user_profile.get('travel_frequency'):
            parts.append(f"Travel frequency: {user_profile['travel_frequency']}")
        
        # Financial behavior
        if user_profile.get('monthly_spending'):
            parts.append(f"Monthly spending: {user_profile['monthly_spending']}")
        
        if user_profile.get('payment_behavior'):
            parts.append(f"Payment behavior: {user_profile['payment_behavior']}")
        
        # Credit profile
        if user_profile.get('income'):
            parts.append(f"Income: {user_profile['income']}")
        
        if user_profile.get('credit_score'):
            parts.append(f"Credit score: {user_profile['credit_score']}")
        
        if user_profile.get('credit_situation'):
            parts.append(f"Credit situation: {user_profile['credit_situation']}")
        
        return " | ".join(parts)
    

    
    # Fallback recommendation
    def _generate_fallback_recommendation(self, user_profile: Dict[str, Any], top_cards: List[Dict[str, Any]]) -> str:
        """Generate a fallback recommendation if LLM fails"""
        if not top_cards:
            return "I apologize, but I couldn't find any credit cards that match your profile. Please try adjusting your criteria or contact a financial advisor for personalized advice."
        
        recommendation = f"Based on your profile, here are my top recommendations:\n\n"
        
        for i, card in enumerate(top_cards[:2], 1):
            recommendation += f"{i}. {card.get('name', 'Unknown Card')} by {card.get('issuer', 'Unknown')}\n"
            recommendation += f"   - Annual Fee: ${card.get('annual_fee', 0)}\n"
            recommendation += f"   - Category: {card.get('category', 'General')}\n"
            recommendation += f"   - Target: {card.get('target_audience', 'General users')}\n\n"
        
        recommendation += "These cards are selected based on your credit profile, spending habits, and goals. Please review the terms and conditions before applying."
        
        return recommendation 
