from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import os
import json
from dotenv import load_dotenv

# Import our agent components
from agent.nodes import State, QuestionAskerNode, FinalAnalysisNode
from agent.edges import ConversationManager
from agent.tools import create_tools

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Credit Card Recommendation API",
    description="A conversational AI system for personalized credit card recommendations",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent components
tools = create_tools()
question_asker = QuestionAskerNode()
final_analyzer = FinalAnalysisNode(tools)
conversation_manager = ConversationManager(question_asker, final_analyzer, tools)

# Store conversation states (in production, use a proper database)
conversation_states = {}

# Pydantic models for API requests/responses
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class CompleteProfileRequest(BaseModel):
    session_id: Optional[str] = None
    primary_goal: str
    top_spend_category: str
    brand_preferences: str
    travel_frequency: str
    monthly_spending: str
    payment_behavior: str
    income: str
    credit_score: str
    credit_situation: str

class ChatResponse(BaseModel):
    response: str
    session_id: str
    is_complete: bool
    conversation_summary: Optional[Dict[str, Any]] = None
    structured_cards: Optional[List[Dict[str, Any]]] = None  # Add this field

class StartConversationResponse(BaseModel):
    session_id: str
    initial_question: str
    message: str

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Credit Card Recommendation API",
        "version": "1.0.0",
        "endpoints": {
            "/start": "Start a new conversation (sequential questions)",
            "/chat": "Send a message to the agent (sequential questions)",
            "/submit-profile": "Submit complete profile and get recommendations in one call",
            "/status/{session_id}": "Get conversation status"
        }
    }

@app.post("/start", response_model=StartConversationResponse)
async def start_conversation():
    """Start a new conversation"""
    try:
        print("\n🚀 START CONVERSATION ENDPOINT CALLED")
        
        # Create new conversation state
        from agent.nodes import State
        state = State()
        
        # Generate session ID
        import uuid
        session_id = str(uuid.uuid4())
        conversation_states[session_id] = state
        
        print(f"🆕 Created new conversation session: {session_id}")
        
        # Get initial question
        print("🔄 Getting initial question...")
        result = conversation_manager.process_message(state, None)
        
        print(f"📋 START RESPONSE:")
        print(f"Session ID: {session_id}")
        print(f"Initial Question: '{result['response'][:100]}...' (truncated)")
        
        return StartConversationResponse(
            session_id=session_id,
            initial_question=result["response"],
            message=result["response"]
        )
    
    except Exception as e:
        print(f"❌ ERROR in start_conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting conversation: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message to the agent"""
    try:
        print(f"\n💬 CHAT ENDPOINT CALLED")
        print(f"📝 Received message: '{request.message}'")
        print(f"🆔 Session ID: {request.session_id}")
        
        if request.session_id not in conversation_states:
            print(f"❌ Session {request.session_id} not found")
            raise HTTPException(status_code=404, detail="Session not found")
        
        state = conversation_states[request.session_id]
        print(f"✅ Found existing session")
        
        # Process the message
        print("🔄 Processing message with conversation manager...")
        result = conversation_manager.process_message(state, request.message)
        
        print(f"📋 CHAT RESPONSE:")
        print(f"Session ID: {request.session_id}")
        print(f"Response: '{result['response'][:100]}...' (truncated)")
        print(f"Is Complete: {result['is_complete']}")
        
        return ChatResponse(
            response=result["response"],
            session_id=request.session_id,
            is_complete=result["is_complete"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.post("/submit-profile", response_model=ChatResponse)
async def submit_complete_profile(request: CompleteProfileRequest):
    """Submit a complete user profile and get recommendations in one call"""
    try:
        print(f"\n📊 SUBMIT PROFILE ENDPOINT CALLED")
        print(f"🆔 Session ID: {request.session_id}")
        
        # Get or create session
        if request.session_id and request.session_id in conversation_states:
            state = conversation_states[request.session_id]
            print(f"✅ Using existing session")
        else:
            # Create new session if none exists
            from agent.nodes import State
            state = State()
            import uuid
            session_id = str(uuid.uuid4())
            conversation_states[session_id] = state
            request.session_id = session_id
            print(f"🆕 Created new session: {session_id}")
        
        # Convert request to profile dictionary
        complete_profile = {
            'primary_goal': request.primary_goal,
            'top_spend_category': request.top_spend_category,
            'brand_preferences': request.brand_preferences,
            'travel_frequency': request.travel_frequency,
            'monthly_spending': request.monthly_spending,
            'payment_behavior': request.payment_behavior,
            'income': request.income,
            'credit_score': request.credit_score,
            'credit_situation': request.credit_situation
        }
        
        # Log the incoming profile
        print(f"\n🔍 RECEIVED PROFILE:")
        print(f"Session ID: {request.session_id}")
        print(f"Primary Goal: {request.primary_goal}")
        print(f"Spend Category: {request.top_spend_category}")
        print(f"Brand Preferences: {request.brand_preferences}")
        print(f"Travel Frequency: {request.travel_frequency}")
        print(f"Monthly Spending: {request.monthly_spending}")
        print(f"Payment Behavior: {request.payment_behavior}")
        print(f"Income: {request.income}")
        print(f"Credit Score: {request.credit_score}")
        print(f"Credit Situation: {request.credit_situation}")
        
        # Submit complete profile and get recommendations
        print("🔄 Submitting complete profile to conversation manager...")
        result = conversation_manager.submit_complete_profile(state, complete_profile)
        
        # Get conversation summary
        summary = conversation_manager.get_conversation_summary(state)
        
        # Handle structured response
        response_text = result["response"]
        structured_cards = []
        
        # Check if result contains structured data
        if isinstance(result["response"], dict):
            response_text = result["response"].get("text_response", str(result["response"]))
            structured_cards = result["response"].get("structured_cards", [])
            print(f"🔍 DEBUG: Found structured response with {len(structured_cards)} cards")
        else:
            print(f"🔍 DEBUG: Response is string, no structured cards")
        
        # Log the response
        print(f"\n📋 RESPONSE:")
        print(f"Session ID: {request.session_id}")
        print(f"Is Complete: {result['is_complete']}")
        print(f"Questions Completed: {summary.get('questions_completed', 0)}/{summary.get('total_questions', 0)}")
        print(f"Response Length: {len(response_text)} characters")
        print(f"Structured Cards: {len(structured_cards)}")
        print(f"\n🎯 FULL CREDIT CARD RECOMMENDATIONS:")
        print("=" * 80)
        print(response_text)
        print("=" * 80)
        
        return ChatResponse(
            response=response_text,
            session_id=request.session_id,
            is_complete=result["is_complete"],
            conversation_summary=summary,
            structured_cards=structured_cards
        )
    
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing complete profile: {str(e)}")

@app.get("/status/{session_id}")
async def get_conversation_status(session_id: str):
    """Get the status of a conversation"""
    try:
        if session_id not in conversation_states:
            raise HTTPException(status_code=404, detail="Session not found")
        
        state = conversation_states[session_id]
        summary = conversation_manager.get_conversation_summary(state)
        
        return {
            "session_id": session_id,
            "status": summary,
            "current_question": state.current_question["field"] if state.current_question else None,
            "conversation_history": state.conversation_history
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting status: {str(e)}")

@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a conversation session"""
    try:
        if session_id in conversation_states:
            del conversation_states[session_id]
            return {"message": "Session deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Session not found")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "components": {
            "database": "connected",
            "llm": "available",
            "tools": "loaded"
        }
    }

# Run the data pipeline on startup
@app.on_event("startup")
async def startup_event():
    """Initialize the system on startup"""
    try:
        # Initialize the JSON database manager
        from data_pipeline.database import JSONDatabaseManager
        
        print("Initializing credit card database from JSON...")
        
        # Initialize database manager
        db_manager = JSONDatabaseManager()
        
        # Get all cards from JSON
        all_cards = db_manager.get_all_cards()
        
        print(f"Database initialized with {len(all_cards)} credit cards from JSON")
        
    except Exception as e:
        print(f"Warning: Could not initialize database on startup: {e}")
        print("The system will still work, but with limited card data.")

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8001))  # Changed to port 8001
    
    print(f"Starting Credit Card Recommendation API on {host}:{port}")
    uvicorn.run(app, host=host, port=port) 