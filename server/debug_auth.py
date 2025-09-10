#!/usr/bin/env python3
"""
Test script to debug authentication issues
Run this locally to test database operations
"""

import os
import sys
import django
from django.conf import settings

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from server.models import Borrower, Investor, AuthToken
from django.contrib.auth.hashers import check_password

def test_borrower_operations():
    """Test borrower signup and login operations"""
    print("=" * 50)
    print("TESTING BORROWER OPERATIONS")
    print("=" * 50)
    
    # Test data
    test_email = "test@example.com"
    test_password = "testpassword123"
    test_name = "Test User"
    
    # Clean up any existing test user
    try:
        existing = Borrower.objects.get(email=test_email)
        existing.delete()
        print(f"Deleted existing test user: {test_email}")
    except Borrower.DoesNotExist:
        print(f"No existing test user found")
    
    # Test 1: Create borrower
    print("\n1. Testing borrower creation...")
    try:
        from datetime import date
        borrower = Borrower(
            full_name=test_name,
            email=test_email,
            date_of_birth=date(1990, 1, 1)
        )
        borrower.set_password(test_password)
        borrower.save()
        print(f"✅ Borrower created successfully: ID {borrower.id}")
    except Exception as e:
        print(f"❌ Borrower creation failed: {e}")
        return False
    
    # Test 2: Login (password check)
    print("\n2. Testing borrower login...")
    try:
        found_borrower = Borrower.objects.get(email=test_email)
        password_valid = check_password(test_password, found_borrower.password_hash)
        if password_valid:
            print(f"✅ Login successful for borrower: {found_borrower.id}")
        else:
            print(f"❌ Password verification failed")
            return False
    except Borrower.DoesNotExist:
        print(f"❌ Borrower not found during login test")
        return False
    except Exception as e:
        print(f"❌ Login test failed: {e}")
        return False
    
    # Test 3: Token creation
    print("\n3. Testing token creation...")
    try:
        import uuid
        from django.utils import timezone
        from datetime import timedelta
        
        # Clean up existing tokens
        AuthToken.objects.filter(borrower=found_borrower).delete()
        
        token = AuthToken.objects.create(
            token=str(uuid.uuid4()),
            borrower=found_borrower,
            expires_at=timezone.now() + timedelta(days=7)
        )
        print(f"✅ Token created successfully: {token.token}")
        
        # Test token validity
        if token.is_valid():
            print(f"✅ Token is valid")
        else:
            print(f"❌ Token is not valid")
            return False
            
    except Exception as e:
        print(f"❌ Token creation failed: {e}")
        return False
    
    # Clean up
    borrower.delete()
    print(f"\n🧹 Cleaned up test borrower")
    
    return True

def test_database_connection():
    """Test basic database connectivity"""
    print("=" * 50)
    print("TESTING DATABASE CONNECTION")
    print("=" * 50)
    
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print(f"✅ Database connection successful: {result}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_table_existence():
    """Test if all required tables exist"""
    print("=" * 50)
    print("TESTING TABLE EXISTENCE")
    print("=" * 50)
    
    tables_to_test = [
        (Borrower, "borrower"),
        (Investor, "investor"),
        (AuthToken, "authtoken")
    ]
    
    all_good = True
    for model, name in tables_to_test:
        try:
            count = model.objects.count()
            print(f"✅ Table '{name}' exists with {count} records")
        except Exception as e:
            print(f"❌ Table '{name}' error: {e}")
            all_good = False
    
    return all_good

if __name__ == "__main__":
    print("EQUIPOOL AUTHENTICATION DEBUG SCRIPT")
    print("=" * 50)
    
    # Run tests
    db_ok = test_database_connection()
    tables_ok = test_table_existence()
    
    if db_ok and tables_ok:
        auth_ok = test_borrower_operations()
        
        if auth_ok:
            print("\n🎉 ALL TESTS PASSED!")
            print("Authentication system is working correctly.")
        else:
            print("\n❌ AUTHENTICATION TESTS FAILED!")
    else:
        print("\n❌ DATABASE OR TABLE ISSUES DETECTED!")
        print("Run migrations: python manage.py migrate")
    
    print("\nTo run this on Railway, add this to your Django app and visit:")
    print("https://your-railway-url.up.railway.app/api/health/database")
