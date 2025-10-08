#!/usr/bin/env python3
"""
Test script to verify investor email verification works correctly
"""

import requests
import json

# Configuration
BACKEND_URL = "http://localhost:8000"

def test_investor_email_verification():
    """Test the investor email verification flow"""
    print("=" * 60)
    print("TESTING INVESTOR EMAIL VERIFICATION FLOW")
    print("=" * 60)
    
    # Test data
    test_email = "test_investor@example.com"
    investor_data = {
        "fullName": "John Doe Investor",
        "dateOfBirth": "1990-01-01",
        "email": test_email,
        "phone": "1234567890",
        "ssn": "123456789",
        "address1": "123 Test St",
        "address2": "",
        "city": "TestCity",
        "state": "CA",
        "zip": "12345",
        "country": "United States",
        "password": "testpassword123"
    }
    
    # Step 1: Send verification email
    print("\n1. Testing: Send verification email for investor signup")
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/send-verification-email",
            json={
                "email": test_email,
                "user_type": "investor",
                "user_data": investor_data
            },
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS: {result.get('message', 'Email sent successfully')}")
            return True
        else:
            try:
                error = response.json()
                print(f"❌ FAILED: {error.get('error', 'Unknown error')}")
            except:
                print(f"❌ FAILED: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ FAILED: Could not connect to backend. Make sure Django server is running on localhost:8000")
        return False
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_investor_email_verification()
    if success:
        print("\n🎉 Investor email verification endpoint is working!")
        print("\nNOTE: To complete the test:")
        print("1. Check your email for the verification code")
        print("2. Use the main page to enter the code and verify")
        print("3. Confirm the investor account is created successfully")
    else:
        print("\n💥 There was an issue with the investor email verification flow")
        print("Check the Django server logs for more details")