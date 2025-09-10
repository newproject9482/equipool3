from django.http import JsonResponse
from django.db import connection
from django.core.management import execute_from_command_line
import sys
import os

def database_health_check(request):
    """Check database connectivity and run basic queries"""
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_connected = True
    except Exception as e:
        return JsonResponse({
            'database_connected': False,
            'error': str(e)
        }, status=500)
    
    # Test table existence and get counts
    tables_exist = {}
    try:
        from .models import Borrower, Investor, Pool, AuthToken
        
        # Check if tables exist by trying to count records
        tables_exist['borrower'] = {
            'exists': True,
            'count': Borrower.objects.count()
        }
        tables_exist['investor'] = {
            'exists': True,
            'count': Investor.objects.count()
        }
        tables_exist['pool'] = {
            'exists': True,
            'count': Pool.objects.count()
        }
        tables_exist['authtoken'] = {
            'exists': True,
            'count': AuthToken.objects.count()
        }
        
    except Exception as e:
        tables_exist['error'] = str(e)
    
    # Get database info
    db_info = {}
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT current_database();")
            db_name = cursor.fetchone()[0]
            db_info['database_name'] = db_name
            
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()[0]
            db_info['database_version'] = db_version
            
    except Exception as e:
        db_info['error'] = str(e)
    
    return JsonResponse({
        'database_connected': db_connected,
        'tables_exist': tables_exist,
        'database_url_set': bool(os.getenv('DATABASE_URL')),
        'debug_mode': os.getenv('DJANGO_DEBUG', 'False').lower() == 'true',
        'database_info': db_info
    })

def list_users(request):
    """List all users in the database for debugging"""
    try:
        from .models import Borrower, Investor
        
        # Get all borrowers
        borrowers = []
        for b in Borrower.objects.all().order_by('-created_at')[:10]:  # Last 10
            borrowers.append({
                'id': b.id,
                'email': b.email,
                'full_name': b.full_name,
                'created_at': b.created_at.isoformat(),
                'date_of_birth': b.date_of_birth.isoformat()
            })
        
        # Get all investors
        investors = []
        for i in Investor.objects.all().order_by('-created_at')[:10]:  # Last 10
            investors.append({
                'id': i.id,
                'email': i.email,
                'full_name': i.full_name,
                'created_at': i.created_at.isoformat(),
                'date_of_birth': i.date_of_birth.isoformat()
            })
        
        return JsonResponse({
            'borrowers': borrowers,
            'investors': investors,
            'total_borrowers': Borrower.objects.count(),
            'total_investors': Investor.objects.count()
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def force_migrate(request):
    """Force run migrations - only use in development"""
    try:
        # This is dangerous in production, only for debugging
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
        execute_from_command_line(['manage.py', 'migrate'])
        return JsonResponse({'success': True, 'message': 'Migrations completed'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
