#!/usr/bin/env python3
"""
Setup script for the Credit Card Recommendation System
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f" {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f" {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print(" Python 3.8 or higher is required")
        return False
    print(f" Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def install_dependencies():
    """Install required dependencies"""
    return run_command(
        "pip install -r requirements.txt",
        "Installing Python dependencies"
    )

def create_directories():
    """Create necessary directories"""
    directories = [
        "data_pipeline",
        "agent", 
        "frontend",
        "chroma_db"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    
    print(" Directories created")

def create_env_file():
    """Create .env file from template"""
    env_template = """# OpenAI API Key for LLM functionality
OPENAI_API_KEY=your_openai_api_key_here

# Tavily API Key for web search
TAVILY_API_KEY=your_tavily_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///credit_cards.db

# Vector Database Configuration
CHROMA_PERSIST_DIRECTORY=./chroma_db

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Scraping Configuration
SCRAPING_DELAY=2
MAX_RETRIES=3
"""
    
    env_path = Path(".env")
    if not env_path.exists():
        with open(env_path, "w") as f:
            f.write(env_template)
        print(" Created .env file from template")
        print("⚠️  Please edit .env file with your API keys")
    else:
        print(" .env file already exists")

def test_imports():
    """Test that all imports work correctly"""
    print("\n Testing imports...")
    
    try:
        # Test core imports
        import langchain
        import langgraph
        import fastapi
        import uvicorn
        import chromadb
        import tavily
        print(" Core dependencies imported successfully")
        
        # Test our modules
        from data_pipeline.database import DatabaseManager
        from agent.nodes import State, QuestionAskerNode
        from agent.tools import create_tools
        print(" Custom modules imported successfully")
        
        return True
    except ImportError as e:
        print(f" Import test failed: {e}")
        return False

def run_data_pipeline():
    """Run the data pipeline to populate the database"""
    return run_command(
        "python data_pipeline/scraper.py",
        "Running data pipeline"
    )

def main():
    """Main setup function"""
    print(" Setting up Credit Card Recommendation System")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Install dependencies
    if not install_dependencies():
        print(" Failed to install dependencies")
        sys.exit(1)
    
    # Test imports
    if not test_imports():
        print(" Import test failed")
        sys.exit(1)
    
    # Create environment file
    create_env_file()
    
    # Run data pipeline
    if not run_data_pipeline():
        print(" Data pipeline failed, but system can still run with sample data")
    
    print("\n" + "=" * 50)
    print(" Setup completed successfully!")
    print("\n Next steps:")
    print("1. Edit .env file with your API keys")
    print("2. Run: python api_server.py")
    print("3. Open frontend/index.html in your browser")
    print("4. Start chatting with the credit card advisor!")
    
    print("\n🔧 API Keys needed:")
    print("- OpenAI API Key: https://platform.openai.com/api-keys")
    print("- Tavily API Key: https://tavily.com/")
    
    print("\n The system will be available at:")
    print("- API: http://localhost:8000")
    print("- Frontend: Open frontend/index.html in browser")

if __name__ == "__main__":
    main() 
