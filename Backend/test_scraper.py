#!/usr/bin/env python3
"""
Test script for the LLM-powered credit card scraper
"""

import os
import json
from data_pipeline.scraper import LLMCreditCardScraper

def test_single_url():
    """Test scraping from a single URL"""
    print("Testing single URL scraping...")
    
    # Initialize scraper
    scraper = LLMCreditCardScraper()
    
    # Test URL
    test_url = "https://www.capitalone.com/credit-cards/compare/"
    
    try:
        # Scrape cards
        cards = scraper.scrape_url(test_url, max_cards=5)
        
        print(f"Found {len(cards)} cards:")
        for i, card in enumerate(cards, 1):
            print(f"\n{i}. {card.get('name', 'Unknown')}")
            print(f"   Issuer: {card.get('issuer', 'Unknown')}")
            print(f"   Type: {card.get('card_type', 'Unknown')}")
            print(f"   Annual Fee: ${card.get('annual_fee', 0)}")
            print(f"   APR: {card.get('regular_apr', 'Unknown')}")
        
        # Save results
        with open("test_single_url_results.json", "w") as f:
            json.dump(cards, f, indent=2)
        
        print(f"\nResults saved to test_single_url_results.json")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        scraper.close()

def test_multiple_urls():
    """Test scraping from multiple URLs"""
    print("\nTesting multiple URL scraping...")
    
    # Initialize scraper
    scraper = LLMCreditCardScraper()
    
    # Test URLs
    test_urls = [
        "https://www.capitalone.com/credit-cards/compare/",
        "https://creditcards.chase.com/",
        "https://www.americanexpress.com/en-us/credit-cards/"
    ]
    
    try:
        # Scrape from multiple URLs
        all_cards = scraper.scrape_multiple_urls(test_urls, max_cards_per_url=3)
        
        print(f"Found {len(all_cards)} total cards:")
        
        # Group by issuer
        by_issuer = {}
        for card in all_cards:
            issuer = card.get('issuer', 'Unknown')
            if issuer not in by_issuer:
                by_issuer[issuer] = []
            by_issuer[issuer].append(card)
        
        for issuer, cards in by_issuer.items():
            print(f"\n{issuer} ({len(cards)} cards):")
            for card in cards:
                print(f"  - {card.get('name', 'Unknown')}")
        
        # Save results
        with open("test_multiple_urls_results.json", "w") as f:
            json.dump(all_cards, f, indent=2)
        
        print(f"\nResults saved to test_multiple_urls_results.json")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        scraper.close()

def test_custom_url():
    """Test scraping from a custom URL"""
    print("\nTesting custom URL scraping...")
    
    # Get URL from user
    url = input("Enter URL to scrape (or press Enter for default): ").strip()
    if not url:
        url = "https://www.capitalone.com/credit-cards/compare/"
    
    # Initialize scraper
    scraper = LLMCreditCardScraper()
    
    try:
        # Scrape cards
        cards = scraper.scrape_url(url, max_cards=5)
        
        if cards:
            print(f"\nFound {len(cards)} cards from {url}:")
            for i, card in enumerate(cards, 1):
                print(f"\n{i}. {card.get('name', 'Unknown')}")
                print(f"   Issuer: {card.get('issuer', 'Unknown')}")
                print(f"   Type: {card.get('card_type', 'Unknown')}")
                print(f"   Annual Fee: ${card.get('annual_fee', 0)}")
                print(f"   Rewards: {card.get('rewards_structure', '{}')}")
        else:
            print(f"No cards found at {url}")
        
        # Save results
        with open("test_custom_url_results.json", "w") as f:
            json.dump(cards, f, indent=2)
        
        print(f"\nResults saved to test_custom_url_results.json")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        scraper.close()

if __name__ == "__main__":
    print("LLM-Powered Credit Card Scraper Test")
    print("=" * 40)
    
    # Check if OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("Warning: OPENAI_API_KEY not set. Please set it in your .env file.")
        print("The scraper will still work but may have limited functionality.")
    
    # Run tests
    test_single_url()
    test_multiple_urls()
    test_custom_url()
    
    print("\nTest completed!") 