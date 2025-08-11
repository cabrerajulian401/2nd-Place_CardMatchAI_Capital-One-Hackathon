from typing import Dict, Any
from langchain_openai import ChatOpenAI
import os

class ShouldContinueQuestioningEdge:
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.1,
            api_key=os.getenv("OPENAI_API_KEY")
        )
    
    def should_continue(self, state) -> bool:
        # Check if all profile fields are filled
        for field, value in state.user_profile.items():
            if value is None:
                return True  # Continue asking questions
        
        # All questions answered, move to analysis
        return False

class ConversationRouter:
    
    def route_conversation(self, state, response: Dict[str, Any]) -> str:
        
        # If questions are completed, go to analysis
        if state.questions_completed:
            return "final_analysis"
        
        # If we have a response and it's complete, check if we should continue
        if response and response.get("is_complete"):
            return "final_analysis"
        
        # Otherwise, continue asking questions
        return "question_asking"

class StateValidator:
   
    # This edge will help us determine whether all the fields needed are missing or not 
    def validate_state(self, state) -> Dict[str, Any]:
        
        issues = []
        
        # Check if all required fields are filled
        required_fields = [
            'primary_goal', 'top_spend_category', 'brand_preferences',
            'travel_frequency', 'monthly_spending', 'payment_behavior',
            'income', 'credit_score', 'credit_situation'
        ]
        
        missing_fields = []
        for field in required_fields:
            if not state.user_profile.get(field):
                missing_fields.append(field)
        
        if missing_fields:
            issues.append(f"Missing required fields: {', '.join(missing_fields)}")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues
        }

class ConversationManager:
    
    
    def __init__(self, question_node, analysis_node, tools):
        self.question_node = question_node
        self.analysis_node = analysis_node
        self.tools = tools
        self.router = ConversationRouter()
        self.validator = StateValidator()
        self.edge = ShouldContinueQuestioningEdge()
    
    def submit_complete_profile(self, state, complete_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Submit a complete user profile and get recommendations in one call"""
        try:
            # Submit complete profile
            result = self.question_node.submit_complete_profile(state, complete_profile)
            
            if result.get("error"):
                return result
            
            # If profile is complete, immediately analyze and recommend
            if result.get("profile_complete"):
                analysis_result = self.analysis_node.analyze_and_recommend(state)
                return analysis_result
            
            return result
            
        except Exception as e:
            return {
                "response": f"Error processing complete profile: {str(e)}",
                "is_complete": False,
                "error": str(e)
            }
    
    def process_message(self, state, user_message: str = None) -> Dict[str, Any]:
        
        
        # If this is the first message, start with questions
        if not state.conversation_history:
            return self.question_node.ask_question(state, user_message)
        
        # If questions are completed, go to analysis
        if state.questions_completed:
            return self.analysis_node.analyze_and_recommend(state)
        
        # Check if we should continue asking questions
        if self.edge.should_continue(state):
            # Continue asking questions
            return self.question_node.ask_question(state, user_message)
        else:
            # All questions answered, move to analysis
            state.questions_completed = True
            return self.analysis_node.analyze_and_recommend(state)
    
    def get_conversation_summary(self, state) -> Dict[str, Any]:

        
        completed_questions = sum(1 for value in state.user_profile.values() if value is not None)
        total_questions = len(state.user_profile)
        
        return {
            "questions_completed": completed_questions,
            "total_questions": total_questions,
            "progress_percentage": (completed_questions / total_questions) * 100,
            "current_question": state.current_question.get('field') if state.current_question else None,
            "is_complete": state.questions_completed
        }
    
    def reset_conversation(self, state):
        
        state.user_profile = {field: None for field in state.user_profile.keys()}
        state.conversation_history = []
        state.current_question = None
        state.analysis_result = None
        state.questions_completed = False 
