import sys
import os

# Add the parent directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import asyncio
import json
from datetime import datetime
from app.services.agent_tools import (
    sync_summarization_tool,
    sync_filtering_tool, 
    sync_draft_tool,
    sync_schedule_tool,
    sync_snooze_tool
)
from app.services.agent_react import run_agent_on_email

# Test data based on your Snowflake email
TEST_EMAIL = {
    'id': '19920077b6741e4d',
    'user_id': '04a00301-111f-4cc8-bdef-4d0b5cf3ae8e',
    'body': """Let’s meet tomorrow at 5pm to discuss project progress. 
Attendees: khatarnakpaji12@gmail.com""",
    'subject': 'Meeting Request: Project Progress',
    'sender': 'khatarnakpaji12@gmail.com',
    'date': datetime.now(),
    'labels': ['INBOX', 'MEETING_REQUEST']
}

async def debug_individual_tools():
    """Test each tool individually"""
    print("=" * 50)
    print("DEBUGGING INDIVIDUAL TOOLS")
    print("=" * 50)
    
    email_text = TEST_EMAIL['body']
    
    # Test 1: Summarization Tool
    print("\n1. Testing Summarization Tool:")
    print("-" * 30)
    try:
        summary_result = sync_summarization_tool(email_text)
        print("✅ Summarization SUCCESS")
        print(f"Result: {summary_result[:200]}...")
    except Exception as e:
        print("❌ Summarization FAILED")
        print(f"Error: {e}")
    
    # Test 2: Filtering Tool
    print("\n2. Testing Filtering Tool:")
    print("-" * 30)
    try:
        filter_result = sync_filtering_tool(email_text)
        print("✅ Filtering SUCCESS")
        print(f"Result: {filter_result}")
    except Exception as e:
        print("❌ Filtering FAILED")
        print(f"Error: {e}")
    
    # Test 3: Draft Tool
    print("\n3. Testing Draft Tool:")
    print("-" * 30)
    try:
        draft_input = "12345|support@hackerrankforwork.com|Re: Coding Test|Thank you for the invitation|" + email_text
        draft_result = sync_draft_tool(draft_input)
        print("✅ Draft SUCCEEDED")
        print(f"Result: {draft_result[:200]}...")
    except Exception as e:
        print("❌ Draft FAILED")
        print(f"Error: {e}")
    
    # Test 4: Schedule Tool
    print("\n4. Testing Schedule Tool:")
    print("-" * 30)
    try:
        schedule_result = sync_schedule_tool("Interview meeting for tomorrow 2PM")
        print("✅ Schedule SUCCESS")
        print(f"Result: {schedule_result}")
    except Exception as e:
        print("❌ Schedule FAILED")
        print(f"Error: {e}")
    
    # Test 5: Snooze Tool
    print("\n5. Testing Snooze Tool:")
    print("-" * 30)
    try:
        snooze_result = sync_snooze_tool("1991ac86cf800f0a|3")
        print("✅ Snooze SUCCESS")
        print(f"Result: {snooze_result}")
    except Exception as e:
        print("❌ Snooze FAILED")
        print(f"Error: {e}")

async def debug_agent_workflow():
    """Test the complete agent workflow"""
    print("\n" + "=" * 50)
    print("DEBUGGING AGENT WORKFLOW")
    print("=" * 50)
    
    try:
        print("\nRunning agent on test email...")
        result = await run_agent_on_email(TEST_EMAIL, "12345")
        
        print("✅ Agent workflow COMPLETED")
        print(f"Result type: {type(result)}")
        
        if isinstance(result, dict):
            if "error" in result:
                print("❌ Agent returned an error:")
                print(f"Error: {result['error']}")
            else:
                print("Agent result keys:", list(result.keys()))
                if "output" in result:
                    print(f"Output: {result['output']}")
        else:
            print(f"Raw result: {str(result)[:500]}...")
            
    except Exception as e:
        print("❌ Agent workflow FAILED")
        print(f"Error: {e}")
        import traceback
        print("\nTraceback:")
        traceback.print_exc()

async def debug_gemini_connection():
    """Test Gemini API connection"""
    print("\n" + "=" * 50)
    print("DEBUGGING GEMINI CONNECTION")
    print("=" * 50)
    
    try:
        from app.services.llm_client import summarize_text, classify_email
        
        # Test direct API calls
        print("\nTesting direct Gemini API calls...")
        
        summary = await summarize_text(TEST_EMAIL['body'][:500], "short")
        print("✅ Direct summarize_text WORKS")
        print(f"Summary: {summary[:100]}...")
        
        classification = await classify_email(TEST_EMAIL['body'][:500])
        print("✅ Direct classify_email WORKS")
        print(f"Classification: {classification}")
        
    except Exception as e:
        print("❌ Gemini API connection FAILED")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

async def debug_database_connection():
    """Test database connection"""
    print("\n" + "=" * 50)
    print("DEBUGGING DATABASE CONNECTION")
    print("=" * 50)
    
    try:
        from app.core.mongo import emails_collection
        
        # Test database query
        count = await emails_collection.count_documents({"user_id": "12345"})
        print(f"✅ Database connection WORKS")
        print(f"Found {count} emails for user 12345")
        
    except Exception as e:
        print("❌ Database connection FAILED")
        print(f"Error: {e}")

def debug_imports():
    """Test all imports"""
    print("=" * 50)
    print("DEBUGGING IMPORTS")
    print("=" * 50)
    
    imports_to_test = [
        ("app.services.llm_client", ["summarize_text", "classify_email", "generate_personalized_email"]),
        ("app.services.agent_tools", ["sync_summarization_tool", "sync_filtering_tool"]),
        ("app.services.agent_react", ["run_agent_on_email"]),
        ("app.core.config", ["settings"]),
        ("app.core.mongo", ["emails_collection"]),
        ("langchain.agents", ["initialize_agent", "Tool"]),
        ("langchain_google_genai", ["ChatGoogleGenerativeAI"]),
    ]
    
    for module_name, items in imports_to_test:
        try:
            module = __import__(module_name, fromlist=items)
            for item in items:
                getattr(module, item)
            print(f"✅ {module_name} - ALL ITEMS OK")
        except Exception as e:
            print(f"❌ {module_name} - FAILED: {e}")

async def run_complete_debug():
    """Run all debugging tests"""
    print("STARTING COMPREHENSIVE DEBUG SESSION")
    print("=" * 60)
    
    # Test imports first
    debug_imports()
    
    # Test API connections
    await debug_gemini_connection()
    
    # Test database
    await debug_database_connection()
    
    # Test individual tools
    await debug_individual_tools()
    
    # Test complete workflow
    await debug_agent_workflow()
    
    print("\n" + "=" * 60)
    print("DEBUG SESSION COMPLETE")
    print("=" * 60)

# Entry point for debugging
if __name__ == "__main__":
    asyncio.run(run_complete_debug())