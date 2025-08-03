#!/usr/bin/env python3
"""
Direct test of LLM functionality
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage

def test_llm_direct():
    """Test LLM directly"""
    
    print("🧪 Testing LLM Directly")
    print("=" * 40)
    
    # Check if API key is set
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        print(" OPENAI_API_KEY not set or is placeholder")
        return False
    
    print(f" OPENAI_API_KEY found: {api_key[:20]}...")
    
    try:
        # Initialize LLM
        llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7,
            api_key=api_key
        )
        
        # Test simple message
        messages = [
            SystemMessage(content="You are a helpful assistant."),
            HumanMessage(content="Say 'Hello, LLM is working!'")
        ]
        
        print(" Testing LLM response...")
        response = llm.invoke(messages)
        
        print(f" LLM Response: {response.content}")
        return True
        
    except Exception as e:
        print(f" LLM Error: {e}")
        return False

if __name__ == "__main__":
    success = test_llm_direct()
    if success:
        print("\n🎉 LLM is working correctly!")
    else:
        print("\n LLM test failed!") 