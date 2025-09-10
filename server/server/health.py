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
    
    # Test table existence
    tables_exist = {}
    try:
        from .models import Borrower, Investor, Pool, AuthToken
        
        # Check if tables exist by trying to count records
        tables_exist['borrower'] = Borrower.objects.count() >= 0
        tables_exist['investor'] = Investor.objects.count() >= 0  
        tables_exist['pool'] = Pool.objects.count() >= 0
        tables_exist['authtoken'] = AuthToken.objects.count() >= 0
        
    except Exception as e:
        tables_exist['error'] = str(e)
    
    return JsonResponse({
        'database_connected': db_connected,
        'tables_exist': tables_exist,
        'database_url_set': bool(os.getenv('DATABASE_URL')),
        'debug_mode': os.getenv('DJANGO_DEBUG', 'False').lower() == 'true'
    })

def force_migrate(request):
    """Force run migrations - only use in development"""
    try:
        # This is dangerous in production, only for debugging
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
        execute_from_command_line(['manage.py', 'migrate'])
        return JsonResponse({'success': True, 'message': 'Migrations completed'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
