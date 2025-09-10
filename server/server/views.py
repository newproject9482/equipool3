import json
import uuid
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone
from .models import Borrower, Investor, Pool, AuthToken
from django.contrib.auth.hashers import check_password

REQUIRED_FIELDS = {"fullName", "email", "dateOfBirth", "password"}
REQUIRED_INVESTOR_FIELDS = {"fullName", "email", "dateOfBirth", "phone", "ssn", "address1", "city", "state", "zip", "country", "password"}

def _create_auth_token(user, role):
    """Create a new authentication token for a user"""
    # Clean up any existing tokens for this user
    if role == 'borrower':
        AuthToken.objects.filter(borrower=user).delete()
        token = AuthToken.objects.create(
            token=str(uuid.uuid4()),
            borrower=user
        )
    else:  # investor
        AuthToken.objects.filter(investor=user).delete()
        token = AuthToken.objects.create(
            token=str(uuid.uuid4()),
            investor=user
        )
    return token.token

def _get_user_from_request(request):
    """Extract user from request using token or session"""
    # Try token-based auth first (for cross-origin requests)
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token_value = auth_header.split(' ', 1)[1]
        try:
            auth_token = AuthToken.objects.get(token=token_value)
            if auth_token.is_valid():
                return auth_token.user, auth_token.role
            else:
                auth_token.delete()  # Clean up expired token
        except AuthToken.DoesNotExist:
            pass
    
    # Fallback to session-based auth (for same-origin requests)
    borrower_id = request.session.get('borrower_id')
    if borrower_id:
        try:
            borrower = Borrower.objects.get(id=borrower_id)
            return borrower, 'borrower'
        except Borrower.DoesNotExist:
            pass
    
    investor_id = request.session.get('investor_id')
    if investor_id:
        try:
            investor = Investor.objects.get(id=investor_id)
            return investor, 'investor'
        except Investor.DoesNotExist:
            pass
    
    return None, None

def _parse_date(date_str: str):
    for fmt in ("%Y-%m-%d", "%b %d %Y", "%B %d %Y"):  # allow multiple formats
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    raise ValidationError("Invalid date format; expected YYYY-MM-DD")

@csrf_exempt  # For now; recommend enabling proper CSRF/token auth later
def borrower_signup(request: HttpRequest):
    print(f"[DEBUG] Borrower signup request received: {request.method}")
    print(f"[DEBUG] Headers: {dict(request.headers)}")
    
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        data = json.loads(request.body.decode("utf-8"))
        print(f"[DEBUG] Signup data received: {data}")
    except json.JSONDecodeError:
        print(f"[DEBUG] Invalid JSON in request body")
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    missing = REQUIRED_FIELDS - set(data.keys())
    if missing:
        print(f"[DEBUG] Missing required fields: {missing}")
        return JsonResponse({"error": f"Missing fields: {', '.join(sorted(missing))}"}, status=400)

    full_name = data.get("fullName", "").strip()
    email = data.get("email", "").lower().strip()
    dob_raw = data.get("dateOfBirth")
    password = data.get("password")

    print(f"[DEBUG] Processing signup for email: {email}")

    if not full_name:
        return JsonResponse({"error": "Full name required"}, status=400)
    if not email or "@" not in email:
        return JsonResponse({"error": "Valid email required"}, status=400)
    if not password or len(password) < 8:
        return JsonResponse({"error": "Password must be at least 8 characters"}, status=400)
    try:
        dob = _parse_date(dob_raw)
    except ValidationError as e:
        print(f"[DEBUG] Date parsing error: {e}")
        return JsonResponse({"error": str(e)}, status=400)

    try:
        print(f"[DEBUG] Creating borrower object...")
        b = Borrower(full_name=full_name, email=email, date_of_birth=dob)
        print(f"[DEBUG] Setting password...")
        b.set_password(password)
        print(f"[DEBUG] Saving borrower to database...")
        b.save()
        print(f"[DEBUG] Borrower saved successfully with ID: {b.id}")
    except IntegrityError as e:
        print(f"[DEBUG] Integrity error during save: {e}")
        return JsonResponse({"error": "Email already registered"}, status=409)
    except Exception as e:
        print(f"[DEBUG] Unexpected error during save: {e}")
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

    return JsonResponse({
        "id": b.id,
        "fullName": b.full_name,
        "email": b.email,
        "dateOfBirth": b.date_of_birth.isoformat(),
        "createdAt": b.created_at.isoformat(),
    }, status=201)

@csrf_exempt
def borrower_login(request: HttpRequest):
    print(f"[DEBUG] Login request received: {request.method}")
    print(f"[DEBUG] Headers: {dict(request.headers)}")
    
    if request.method != 'POST':
        return JsonResponse({'error':'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body.decode('utf-8'))
        print(f"[DEBUG] Login data: {data}")
    except json.JSONDecodeError:
        print(f"[DEBUG] Invalid JSON in login request")
        return JsonResponse({'error':'Invalid JSON'}, status=400)
        
    email = data.get('email','').lower().strip()
    password = data.get('password','')
    print(f"[DEBUG] Attempting login for email: {email}")
    
    if not email or not password:
        print(f"[DEBUG] Missing email or password")
        return JsonResponse({'error':'Email and password required'}, status=400)
        
    try:
        print(f"[DEBUG] Searching for borrower with email: {email}")
        b = Borrower.objects.get(email=email)
        print(f"[DEBUG] Found borrower: {b.id}, {b.full_name}")
    except Borrower.DoesNotExist:
        print(f"[DEBUG] No borrower found with email: {email}")
        return JsonResponse({'error':'Invalid credentials'}, status=401)
    except Exception as e:
        print(f"[DEBUG] Database error during borrower lookup: {e}")
        return JsonResponse({'error':'Database error'}, status=500)
        
    print(f"[DEBUG] Checking password for borrower: {b.id}")
    if not check_password(password, b.password_hash):
        print(f"[DEBUG] Password check failed for borrower: {b.id}")
        return JsonResponse({'error':'Invalid credentials'}, status=401)
        
    print(f"[DEBUG] Password check passed for borrower: {b.id}")
    
    # Establish session (for same-origin requests)
    request.session['borrower_id'] = b.id
    request.session['role'] = 'borrower'
    request.session.save()  # Force save the session
    
    # Create auth token (for cross-origin requests)
    try:
        print(f"[DEBUG] Creating auth token for borrower: {b.id}")
        auth_token = _create_auth_token(b, 'borrower')
        print(f"[DEBUG] Auth token created successfully: {auth_token}")
    except Exception as e:
        print(f"[DEBUG] Error creating auth token: {e}")
        return JsonResponse({'error':'Token creation failed'}, status=500)
    
    print(f"[DEBUG] Session established for borrower: {b.id}")
    print(f"[DEBUG] Session data after login: {dict(request.session)}")
    print(f"[DEBUG] Session key: {request.session.session_key}")
    
    response = JsonResponse({
        'id': b.id,
        'fullName': b.full_name,
        'email': b.email,
        'role': 'borrower',
        'token': auth_token  # Include token for cross-origin requests
    }, status=200)
    
    print(f"[DEBUG] Login successful for borrower: {b.id}")
    return response

@csrf_exempt
def auth_logout(request: HttpRequest):
    if request.method != 'POST':
        return JsonResponse({'error':'Method not allowed'}, status=405)
    request.session.flush()
    return JsonResponse({'success': True})

def auth_me(request: HttpRequest):
    print(f"[DEBUG] Auth check - session data: {dict(request.session)}")
    print(f"[DEBUG] Auth check - session key: {request.session.session_key}")
    print(f"[DEBUG] Auth check - cookies: {request.COOKIES}")
    print(f"[DEBUG] Auth check - headers: {dict(request.headers)}")
    
    # Try both token-based and session-based authentication
    user, role = _get_user_from_request(request)
    
    if user and role:
        print(f"[DEBUG] User authenticated via {'token' if 'Authorization' in request.headers else 'session'}: {user.id} ({role})")
        return JsonResponse({
            'authenticated': True,
            'id': user.id,
            'fullName': user.full_name,
            'email': user.email,
            'role': role
        })
    
    print(f"[DEBUG] Authentication failed - no valid session or token")
    return JsonResponse({'authenticated': False}, status=401)

@csrf_exempt
def investor_signup(request: HttpRequest):
    print(f"[DEBUG] Investor signup request received: {request.method}")
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        data = json.loads(request.body.decode("utf-8"))
        print(f"[DEBUG] Received investor data: {data}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    missing = REQUIRED_INVESTOR_FIELDS - set(data.keys())
    if missing:
        return JsonResponse({"error": f"Missing fields: {', '.join(sorted(missing))}"}, status=400)

    # Extract and validate fields
    full_name = data.get("fullName", "").strip()
    email = data.get("email", "").lower().strip()
    dob_raw = data.get("dateOfBirth")
    phone = data.get("phone", "").strip()
    ssn = data.get("ssn", "").strip()
    address1 = data.get("address1", "").strip()
    address2 = data.get("address2", "").strip()
    city = data.get("city", "").strip()
    state = data.get("state", "").strip()
    zip_code = data.get("zip", "").strip()
    country = data.get("country", "United States").strip()
    password = data.get("password")

    # Validation
    if not full_name:
        return JsonResponse({"error": "Full name required"}, status=400)
    if not email or "@" not in email:
        return JsonResponse({"error": "Valid email required"}, status=400)
    if not password or len(password) < 8:
        return JsonResponse({"error": "Password must be at least 8 characters"}, status=400)
    if not phone:
        return JsonResponse({"error": "Phone number required"}, status=400)
    if not ssn:
        return JsonResponse({"error": "SSN required"}, status=400)
    if not address1:
        return JsonResponse({"error": "Address required"}, status=400)
    if not city:
        return JsonResponse({"error": "City required"}, status=400)
    if not state:
        return JsonResponse({"error": "State required"}, status=400)
    if not zip_code:
        return JsonResponse({"error": "ZIP code required"}, status=400)

    try:
        dob = _parse_date(dob_raw)
    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)

    try:
        print(f"[DEBUG] Creating investor object for email: {email}")
        i = Investor(
            full_name=full_name,
            email=email,
            date_of_birth=dob,
            phone=phone,
            ssn=ssn,
            address1=address1,
            address2=address2,
            city=city,
            state=state,
            zip_code=zip_code,
            country=country
        )
        print(f"[DEBUG] Setting password for investor...")
        i.set_password(password)
        print(f"[DEBUG] Saving investor to database...")
        i.save()
        print(f"[DEBUG] Successfully created investor with ID: {i.id}")
    except IntegrityError as e:
        print(f"[DEBUG] Integrity error during investor save: {e}")
        print(f"[DEBUG] Email already registered: {email}")
        return JsonResponse({"error": "Email already registered"}, status=409)
    except Exception as e:
        print(f"[DEBUG] Unexpected error during investor save: {e}")
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

    return JsonResponse({
        "id": i.id,
        "fullName": i.full_name,
        "email": i.email,
        "dateOfBirth": i.date_of_birth.isoformat(),
        "createdAt": i.created_at.isoformat(),
    }, status=201)

@csrf_exempt
def investor_login(request: HttpRequest):
    if request.method != 'POST':
        return JsonResponse({'error':'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error':'Invalid JSON'}, status=400)
    
    email = data.get('email','').lower().strip()
    password = data.get('password','')
    
    if not email or not password:
        return JsonResponse({'error':'Email and password required'}, status=400)
    
    try:
        i = Investor.objects.get(email=email)
    except Investor.DoesNotExist:
        return JsonResponse({'error':'Invalid credentials'}, status=401)
    
    if not check_password(password, i.password_hash):
        return JsonResponse({'error':'Invalid credentials'}, status=401)
    
    # Establish session (for same-origin requests)
    request.session['investor_id'] = i.id
    request.session['role'] = 'investor'
    request.session.save()  # Force save the session
    
    # Create auth token (for cross-origin requests)
    auth_token = _create_auth_token(i, 'investor')
    
    print(f"[DEBUG] Session established for investor: {i.id}")
    print(f"[DEBUG] Session data after login: {dict(request.session)}")
    print(f"[DEBUG] Session key: {request.session.session_key}")
    print(f"[DEBUG] Auth token created: {auth_token}")
    
    response = JsonResponse({
        'id': i.id,
        'fullName': i.full_name,
        'email': i.email,
        'role': 'investor',
        'token': auth_token  # Include token for cross-origin requests
    }, status=200)
    
    return response

def _require_borrower_auth(request):
    """Helper function to check if user is authenticated as borrower"""
    user, role = _get_user_from_request(request)
    
    if not user or role != 'borrower':
        return None, JsonResponse({'error': 'Authentication required'}, status=401)
    
    return user, None

def _safe_decimal(value, default=None):
    """Safely convert value to Decimal, return default if invalid"""
    if value is None or value == '':
        return default
    try:
        # Remove currency symbols and commas
        if isinstance(value, str):
            value = value.replace('$', '').replace(',', '').strip()
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return default

@csrf_exempt
def create_pool(request: HttpRequest):
    """Create a new pool"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Check authentication
    borrower, auth_error = _require_borrower_auth(request)
    if auth_error:
        return auth_error
    
    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # Required fields validation
    required_fields = {
        'poolType', 'addressLine', 'city', 'state', 'zipCode', 
        'percentOwned', 'amount', 'roiRate'
    }
    missing = required_fields - set(data.keys())
    if missing:
        return JsonResponse({'error': f'Missing fields: {", ".join(sorted(missing))}'}, status=400)
    
    # Validate required field values
    pool_type = data.get('poolType', '').strip()
    if pool_type not in ['equity', 'refinance']:
        return JsonResponse({'error': 'Invalid pool type'}, status=400)
    
    address_line = data.get('addressLine', '').strip()
    city = data.get('city', '').strip()
    state = data.get('state', '').strip()
    zip_code = data.get('zipCode', '').strip()
    
    if not all([address_line, city, state, zip_code]):
        return JsonResponse({'error': 'Address information is required'}, status=400)
    
    # Convert and validate numeric fields
    percent_owned = _safe_decimal(data.get('percentOwned'))
    amount = _safe_decimal(data.get('amount'))
    roi_rate = _safe_decimal(data.get('roiRate'))
    
    if percent_owned is None or percent_owned <= 0 or percent_owned > 100:
        return JsonResponse({'error': 'Valid percent owned is required (1-100)'}, status=400)
    
    if amount is None or amount <= 0:
        return JsonResponse({'error': 'Valid amount is required'}, status=400)
    
    if roi_rate is None or roi_rate <= 0:
        return JsonResponse({'error': 'Valid ROI rate is required'}, status=400)
    
    # Optional fields
    co_owner = data.get('coOwner')
    co_owner = co_owner.strip() if co_owner else None
    co_owner = co_owner or None  # Convert empty string to None
    
    property_value = _safe_decimal(data.get('propertyValue'))
    
    property_link = data.get('propertyLink')
    property_link = property_link.strip() if property_link else None
    property_link = property_link or None  # Convert empty string to None
    
    mortgage_balance = _safe_decimal(data.get('mortgageBalance'))
    term = data.get('term', '12')
    custom_term_months = None
    
    if term == 'custom':
        custom_term_months = data.get('customTermMonths')
        if custom_term_months is None:
            return JsonResponse({'error': 'Custom term months required when term is custom'}, status=400)
    
    # Optional liability fields
    other_property_loans = _safe_decimal(data.get('otherPropertyLoans'))
    credit_card_debt = _safe_decimal(data.get('creditCardDebt'))
    monthly_debt_payments = _safe_decimal(data.get('monthlyDebtPayments'))
    
    try:
        pool = Pool.objects.create(
            borrower=borrower,
            pool_type=pool_type,
            address_line=address_line,
            city=city,
            state=state,
            zip_code=zip_code,
            percent_owned=percent_owned,
            co_owner=co_owner,
            property_value=property_value,
            property_link=property_link,
            mortgage_balance=mortgage_balance,
            amount=amount,
            roi_rate=roi_rate,
            term=term,
            custom_term_months=custom_term_months,
            other_property_loans=other_property_loans,
            credit_card_debt=credit_card_debt,
            monthly_debt_payments=monthly_debt_payments,
            status='active'  # Set as active when created
        )
        
        return JsonResponse({
            'id': pool.id,
            'poolType': pool.pool_type,
            'amount': str(pool.amount),
            'roiRate': str(pool.roi_rate),
            'term': pool.term,
            'status': pool.status,
            'createdAt': pool.created_at.isoformat(),
            'address': f"{pool.address_line}, {pool.city}, {pool.state} {pool.zip_code}"
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Failed to create pool: {str(e)}'}, status=500)

def get_pools(request: HttpRequest):
    """Get all pools for the authenticated borrower"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Check authentication
    borrower, auth_error = _require_borrower_auth(request)
    if auth_error:
        return auth_error
    
    pools = Pool.objects.filter(borrower=borrower).order_by('-created_at')
    
    pools_data = []
    for pool in pools:
        pools_data.append({
            'id': pool.id,
            'poolType': pool.pool_type,
            'amount': str(pool.amount),
            'roiRate': str(pool.roi_rate),
            'term': pool.term,
            'termMonths': pool.term_months,
            'status': pool.status,
            'fundingProgress': pool.funding_progress,
            'createdAt': pool.created_at.isoformat(),
            'address': f"{pool.address_line}, {pool.city}, {pool.state} {pool.zip_code}",
            'propertyValue': str(pool.property_value) if pool.property_value else None,
            'mortgageBalance': str(pool.mortgage_balance) if pool.mortgage_balance else None,
        })
    
    return JsonResponse({'pools': pools_data}, status=200)

def get_pool_detail(request: HttpRequest, pool_id: int):
    """Get detailed information for a specific pool"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Check authentication
    borrower, auth_error = _require_borrower_auth(request)
    if auth_error:
        return auth_error
    
    try:
        pool = Pool.objects.get(id=pool_id, borrower=borrower)
    except Pool.DoesNotExist:
        return JsonResponse({'error': 'Pool not found'}, status=404)
    
    return JsonResponse({
        'id': pool.id,
        'poolType': pool.pool_type,
        'status': pool.status,
        'amount': str(pool.amount),
        'roiRate': str(pool.roi_rate),
        'term': pool.term,
        'termMonths': pool.term_months,
        'customTermMonths': pool.custom_term_months,
        'fundingProgress': pool.funding_progress,
        'createdAt': pool.created_at.isoformat(),
        'updatedAt': pool.updated_at.isoformat(),
        
        # Property details
        'addressLine': pool.address_line,
        'city': pool.city,
        'state': pool.state,
        'zipCode': pool.zip_code,
        'percentOwned': str(pool.percent_owned),
        'coOwner': pool.co_owner,
        'propertyValue': str(pool.property_value) if pool.property_value else None,
        'propertyLink': pool.property_link,
        'mortgageBalance': str(pool.mortgage_balance) if pool.mortgage_balance else None,
        
        # Liability information
        'otherPropertyLoans': str(pool.other_property_loans) if pool.other_property_loans else None,
        'creditCardDebt': str(pool.credit_card_debt) if pool.credit_card_debt else None,
        'monthlyDebtPayments': str(pool.monthly_debt_payments) if pool.monthly_debt_payments else None,
        
        # Documents
        'homeInsuranceDoc': pool.home_insurance_doc,
        'taxReturnDoc': pool.tax_return_doc,
        'appraisalDoc': pool.appraisal_doc,
        'propertyPhotos': pool.property_photos,
    }, status=200)
