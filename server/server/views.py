import json
import uuid
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.utils import timezone
from .models import Borrower, Investor, Pool, AuthToken, Investment
from django.contrib.auth.hashers import check_password

REQUIRED_FIELDS = {"firstName", "lastName", "email", "phone", "dateOfBirth", "password"}
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
            # If we also have investor_id, clear it (legacy session conflict)
            if request.session.get('investor_id'):
                del request.session['investor_id']
                request.session.save()
            return borrower, 'borrower'
        except Borrower.DoesNotExist:
            pass
    
    investor_id = request.session.get('investor_id')
    if investor_id:
        try:
            investor = Investor.objects.get(id=investor_id)
            # If we also have borrower_id, clear it (legacy session conflict)
            if request.session.get('borrower_id'):
                del request.session['borrower_id']
                request.session.save()
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
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    missing = REQUIRED_FIELDS - set(data.keys())
    if missing:
        return JsonResponse({"error": f"Missing fields: {', '.join(sorted(missing))}"}, status=400)

    first_name = data.get("firstName", "").strip()
    middle_name = data.get("middleName", "").strip()  # Optional
    last_name = data.get("lastName", "").strip()
    email = data.get("email", "").lower().strip()
    phone = data.get("phone", "").strip()
    dob_raw = data.get("dateOfBirth")
    password = data.get("password")

    if not first_name:
        return JsonResponse({"error": "First name required"}, status=400)
    if not last_name:
        return JsonResponse({"error": "Last name required"}, status=400)
    if not phone:
        return JsonResponse({"error": "Phone number required"}, status=400)
    
    # Validate name fields
    import re
    name_pattern = r"[A-Za-zÀ-ÖØ-öø-ÿ'\- ]{1,100}"
    if not re.fullmatch(name_pattern, first_name):
        return JsonResponse({"error": "First name contains invalid characters"}, status=400)
    if not re.fullmatch(name_pattern, last_name):
        return JsonResponse({"error": "Last name contains invalid characters"}, status=400)
    if middle_name and not re.fullmatch(name_pattern, middle_name):
        return JsonResponse({"error": "Middle name contains invalid characters"}, status=400)
    
    # Validate phone number (basic validation)
    phone_pattern = r"[\d\-\+\(\)\s]{10,20}"
    if not re.fullmatch(phone_pattern, phone):
        return JsonResponse({"error": "Invalid phone number format"}, status=400)
    if not email or "@" not in email:
        return JsonResponse({"error": "Valid email required"}, status=400)
    if not password or len(password) < 8:
        return JsonResponse({"error": "Password must be at least 8 characters"}, status=400)
    try:
        dob = _parse_date(dob_raw)
    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)

    # Ensure age >= 18
    today = timezone.now().date()
    try:
        eighteenth_birthday = dob.replace(year=dob.year + 18)
    except ValueError:
        # Handle Feb 29 edge-case by subtracting one day before adding 18 years
        from datetime import timedelta
        eighteenth_birthday = (dob - timedelta(days=1)).replace(year=dob.year + 18)
    if eighteenth_birthday > today:
        return JsonResponse({"error": "You must be at least 18 years old"}, status=400)

    try:
        with transaction.atomic():  # Ensure database transaction
            b = Borrower(
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                email=email,
                phone=phone,
                date_of_birth=dob
            )
            b.set_password(password)
            b.save()
            
            # Verify the save by querying back
            saved_borrower = Borrower.objects.get(id=b.id)
            
    except IntegrityError as e:
        return JsonResponse({"error": "Email already registered"}, status=409)
    except Exception as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

    # Auto-login newly registered borrower: establish session and create token
    try:
        request.session['borrower_id'] = b.id
        request.session['role'] = 'borrower'
        if 'investor_id' in request.session:
            del request.session['investor_id']
        request.session.save()
        auth_token = _create_auth_token(b, 'borrower')
    except Exception:
        auth_token = None

    return JsonResponse({
        "id": b.id,
        "firstName": b.first_name,
        "middleName": b.middle_name,
        "lastName": b.last_name,
        "fullName": b.full_name,  # Keep for compatibility
        "email": b.email,
        "phone": b.phone,
        "dateOfBirth": b.date_of_birth.isoformat(),
        "createdAt": b.created_at.isoformat(),
        "role": "borrower",
        "token": auth_token,
        "authenticated": True,
    }, status=201)

@csrf_exempt
def borrower_login(request: HttpRequest):
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
        b = Borrower.objects.get(email=email)
    except Borrower.DoesNotExist:
        return JsonResponse({'error':'Invalid credentials'}, status=401)
    except Exception as e:
        return JsonResponse({'error':'Database error'}, status=500)
        
    if not check_password(password, b.password_hash):
        return JsonResponse({'error':'Invalid credentials'}, status=401)
    
        
    # Establish session (for same-origin requests)
    request.session['borrower_id'] = b.id
    request.session['role'] = 'borrower'
    # Clear investor session data if it exists
    if 'investor_id' in request.session:
        del request.session['investor_id']
    request.session.save()  # Force save the session
    
    # Create auth token (for cross-origin requests)
    try:
        auth_token = _create_auth_token(b, 'borrower')
    except Exception as e:
        return JsonResponse({'error':'Token creation failed'}, status=500)
    
    response = JsonResponse({
        'id': b.id,
        'fullName': b.full_name,
        'email': b.email,
        'role': 'borrower',
        'token': auth_token  # Include token for cross-origin requests
    }, status=200)
    
    return response

@csrf_exempt
def auth_logout(request: HttpRequest):
    if request.method != 'POST':
        return JsonResponse({'error':'Method not allowed'}, status=405)
    # Revoke bearer token if provided
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token_value = auth_header.split(' ', 1)[1]
        try:
            token_obj = AuthToken.objects.get(token=token_value)
            token_obj.delete()
        except AuthToken.DoesNotExist:
            pass
    # Flush server-side session
    request.session.flush()
    return JsonResponse({'success': True})

def auth_me(request: HttpRequest):
    # Try both token-based and session-based authentication
    user, role = _get_user_from_request(request)
    
    if user and role:
        response_data = {
            'authenticated': True,
            'id': user.id,
            'email': user.email,
            'role': role,
            'dateOfBirth': user.date_of_birth.isoformat() if user.date_of_birth else None
        }
        
        # Add role-specific fields
        if role == 'borrower':
            response_data.update({
                'firstName': user.first_name,
                'middleName': user.middle_name,
                'lastName': user.last_name,
                'fullName': user.full_name,  # Keep for compatibility
                'phone': user.phone
            })
        elif role == 'investor':
            response_data.update({
                'fullName': user.full_name,
                'phone': user.phone,
                'ssn': user.ssn,
                'address1': user.address1,
                'address2': user.address2,
                'city': user.city,
                'state': user.state,
                'zipCode': user.zip_code,
                'country': user.country
            })
        
        return JsonResponse(response_data)
    
    return JsonResponse({'authenticated': False}, status=401)

def validate_email(request: HttpRequest):
    """Check if an email is available (not used by Borrower or Investor).
    GET /api/validate/email?email=foo@example.com
    Returns: { available: boolean }
    """
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    email = (request.GET.get('email') or '').strip().lower()
    if not email or '@' not in email:
        return JsonResponse({'error': 'Valid email required'}, status=400)
    exists = Borrower.objects.filter(email=email).exists() or Investor.objects.filter(email=email).exists()
    return JsonResponse({'available': not exists})

@csrf_exempt
def investor_signup(request: HttpRequest):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        data = json.loads(request.body.decode("utf-8"))
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
    # Require first and last name and validate characters
    name_parts = [p for p in full_name.split() if p]
    if len(name_parts) < 2:
        return JsonResponse({"error": "Please enter your full name (first and last)"}, status=400)
    import re
    if not re.fullmatch(r"[A-Za-zÀ-ÖØ-öø-ÿ'\- ]{2,255}", full_name):
        return JsonResponse({"error": "Name contains invalid characters"}, status=400)
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
    # Ensure age >= 18
    today = timezone.now().date()
    try:
        eighteenth_birthday = dob.replace(year=dob.year + 18)
    except ValueError:
        from datetime import timedelta
        eighteenth_birthday = (dob - timedelta(days=1)).replace(year=dob.year + 18)
    if eighteenth_birthday > today:
        return JsonResponse({"error": "You must be at least 18 years old"}, status=400)

    try:
        with transaction.atomic():  # Ensure database transaction
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
            i.set_password(password)
            i.save()
            
            # Verify the save by querying back
            saved_investor = Investor.objects.get(id=i.id)
            
    except IntegrityError as e:
        return JsonResponse({"error": "Email already registered"}, status=409)
    except Exception as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

    # Auto-login newly registered investor: establish session and create token
    try:
        request.session['investor_id'] = i.id
        request.session['role'] = 'investor'
        if 'borrower_id' in request.session:
            del request.session['borrower_id']
        request.session.save()
        auth_token = _create_auth_token(i, 'investor')
    except Exception:
        auth_token = None

    return JsonResponse({
        "id": i.id,
        "fullName": i.full_name,
        "email": i.email,
        "dateOfBirth": i.date_of_birth.isoformat(),
        "createdAt": i.created_at.isoformat(),
        "role": "investor",
        "token": auth_token,
        "authenticated": True,
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
    # Clear borrower session data if it exists
    if 'borrower_id' in request.session:
        del request.session['borrower_id']
    request.session.save()  # Force save the session
    
    # Create auth token (for cross-origin requests)
    auth_token = _create_auth_token(i, 'investor')
    
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

def _require_investor_auth(request):
    """Helper function to check if user is authenticated as investor"""
    user, role = _get_user_from_request(request)
    
    if not user or role != 'investor':
        return None, JsonResponse({'error': 'Investor authentication required'}, status=401)
    
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
    
    # Get basic field values (no validation)
    pool_type = data.get('poolType', 'equity').strip()
    address_line = data.get('addressLine', '').strip()
    city = data.get('city', '').strip()
    state = data.get('state', '').strip()
    zip_code = data.get('zipCode', '').strip()
    
    # Extract personal information (no validation)
    first_name = data.get('firstName', '').strip()
    middle_name = data.get('middleName', '').strip()
    last_name = data.get('lastName', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    date_of_birth_str = data.get('dateOfBirth', '').strip()
    ssn = data.get('ssn', '').strip()
    
    # Prior names (optional)
    prior_first_name = data.get('priorFirstName', '').strip()
    prior_middle_name = data.get('priorMiddleName', '').strip()
    prior_last_name = data.get('priorLastName', '').strip()
    
    # FICO score (optional)
    fico_score = data.get('ficoScore')
    if fico_score:
        try:
            fico_score = int(fico_score)
        except ValueError:
            fico_score = None
    else:
        fico_score = None
    
    # Mailing address (no validation)
    address_line_1 = data.get('addressLine1', '').strip()
    address_line_2 = data.get('addressLine2', '').strip()
    mailing_city = data.get('mailingCity', '').strip()
    mailing_state = data.get('mailingState', '').strip()
    mailing_zip_code = data.get('mailingZipCode', '').strip()
    
    # Parse date of birth (allow empty)
    date_of_birth = None
    if date_of_birth_str:
        try:
            date_of_birth = _parse_date(date_of_birth_str)
        except ValidationError:
            date_of_birth = None
    
    # Handle primary address choice
    primary_address_choice = data.get('primaryAddressChoice', '').strip()
    
    # Handle co-owners
    co_owners = data.get('coOwners', [])
    has_co_owners = data.get('hasCoOwners', False)
    
    # Calculate percent owned based on co-owners if present
    if has_co_owners and co_owners:
        total_co_owner_percentage = sum(float(owner.get('percentage', 0) or 0) for owner in co_owners)
        percent_owned = max(0, 100 - total_co_owner_percentage)
    else:
        percent_owned = 100
    
    # Handle property links (defensive programming)
    property_links = []
    property_link = data.get('propertyLink') or ''
    if isinstance(property_link, str):
        property_link = property_link.strip()
        if property_link:
            property_links.append({
                'url': property_link,
                'type': 'listing',
                'added_at': timezone.now().isoformat()
            })
    
    # Handle existing loans (defensive programming)
    existing_loans = []
    loan_amount = data.get('loanAmount') or ''
    remaining_balance = data.get('remainingBalance') or ''
    if isinstance(loan_amount, str) and isinstance(remaining_balance, str):
        loan_amount = loan_amount.strip()
        remaining_balance = remaining_balance.strip()
        if loan_amount and remaining_balance:
            try:
                existing_loans.append({
                    'loan_amount': float(loan_amount),
                    'remaining_balance': float(remaining_balance),
                    'loan_number': 1
                })
            except ValueError:
                pass  # Skip invalid loan data

    # Convert numeric fields (allow defaults)
    amount = _safe_decimal(data.get('amount')) or Decimal('10000')  # Default amount
    roi_rate = _safe_decimal(data.get('roiRate')) or Decimal('5.0')  # Default ROI
    
    # Validate percent_owned (now calculated or provided)
    if percent_owned <= 0 or percent_owned > 100:
        percent_owned = 100  # Default to 100% ownership
    
    # Optional fields (defensive programming)
    co_owner = data.get('coOwner') or ''
    if isinstance(co_owner, str):
        co_owner = co_owner.strip() or None
    else:
        co_owner = None
    
    property_value = _safe_decimal(data.get('propertyValue'))
    
    property_link_single = data.get('propertyLink') or ''
    if isinstance(property_link_single, str):
        property_link_single = property_link_single.strip() or None
    else:
        property_link_single = None
    
    mortgage_balance = _safe_decimal(data.get('mortgageBalance'))
    term = data.get('term', '12')
    custom_term_months = None
    
    if term == 'custom':
        custom_term_months = data.get('customTermMonths', 12)  # Default to 12
    
    # Handle step 3 fields - Pool Terms (no validation)
    loan_type = data.get('loanType') or 'interest-only'
    if isinstance(loan_type, str):
        loan_type = loan_type.strip() or 'interest-only'
    else:
        loan_type = 'interest-only'
    term_months = data.get('termMonths', 12)
    is_custom_term = data.get('isCustomTerm', False)
    
    # Convert term months to int
    if term_months:
        try:
            term_months = int(term_months)
        except ValueError:
            term_months = 12  # Default to 12 months
    
    # Optional liability fields
    other_property_loans = _safe_decimal(data.get('otherPropertyLoans'))
    credit_card_debt = _safe_decimal(data.get('creditCardDebt'))
    monthly_debt_payments = _safe_decimal(data.get('monthlyDebtPayments'))
    
    # Handle liabilities array
    liabilities = data.get('liabilities', [])
    processed_liabilities = []
    for liability in liabilities:
        if isinstance(liability, dict):
            processed_liability = {
                'type': liability.get('type', '').strip(),
                'amount': liability.get('amount', '').strip(),
                'monthlyPayment': liability.get('monthlyPayment', '').strip(),
                'remainingBalance': liability.get('remainingBalance', '').strip()
            }
            # Only include if at least one field has data
            if any(processed_liability.values()):
                processed_liabilities.append(processed_liability)
    
    try:
        pool = Pool.objects.create(
            borrower=borrower,
            pool_type=pool_type,
            # Personal information
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name,
            email=email,
            phone=phone,
            date_of_birth=date_of_birth,
            prior_first_name=prior_first_name,
            prior_middle_name=prior_middle_name,
            prior_last_name=prior_last_name,
            ssn=ssn,
            fico_score=fico_score,
            # Mailing address
            address_line_1=address_line_1,
            address_line_2=address_line_2,
            mailing_city=mailing_city,
            mailing_state=mailing_state,
            mailing_zip_code=mailing_zip_code,
            # Property information
            address_line=address_line,
            city=city,
            state=state,
            zip_code=zip_code,
            primary_address_choice=primary_address_choice,
            percent_owned=percent_owned,
            co_owner=co_owner,
            co_owners=co_owners,
            property_value=property_value,
            property_link=property_link_single,
            property_links=property_links,
            mortgage_balance=mortgage_balance,
            existing_loans=existing_loans,
            amount=amount,
            roi_rate=roi_rate,
            loan_type=loan_type,
            term=term,
            term_months=term_months,
            is_custom_term=is_custom_term,
            custom_term_months=custom_term_months,
            other_property_loans=other_property_loans,
            credit_card_debt=credit_card_debt,
            monthly_debt_payments=monthly_debt_payments,
            liabilities=processed_liabilities,
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

def get_investment_opportunities(request: HttpRequest):
    """Get all active pools for investors to browse"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Check authentication
    investor, auth_error = _require_investor_auth(request)
    if auth_error:
        return auth_error
    
    # Get all active pools from all borrowers
    pools = Pool.objects.filter(status='active').order_by('-created_at')
    
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
            'borrowerName': pool.borrower.full_name,  # Add borrower info for investors
            'percentOwned': str(pool.percent_owned),
        })
    
    return JsonResponse({'pools': pools_data}, status=200)

def get_investment_pool_detail(request: HttpRequest, pool_id: int):
    """Get detailed information for a specific investment opportunity"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Check authentication
    investor, auth_error = _require_investor_auth(request)
    if auth_error:
        return auth_error
    
    try:
        # Investors can view any active pool, not just their own
        pool = Pool.objects.get(id=pool_id, status='active')
    except Pool.DoesNotExist:
        return JsonResponse({'error': 'Investment opportunity not found'}, status=404)
    
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
        
        # Borrower information (limited for privacy)
        'borrowerName': pool.borrower.full_name,
        'borrowerEmail': pool.borrower.email,  # Investors might need this for contact
        
        # Risk assessment information
        'otherPropertyLoans': str(pool.other_property_loans) if pool.other_property_loans else None,
        'creditCardDebt': str(pool.credit_card_debt) if pool.credit_card_debt else None,
        'monthlyDebtPayments': str(pool.monthly_debt_payments) if pool.monthly_debt_payments else None,
        
        # Documents (if available)
        'homeInsuranceDoc': pool.home_insurance_doc,
        'taxReturnDoc': pool.tax_return_doc,
        'appraisalDoc': pool.appraisal_doc,
        'propertyPhotos': pool.property_photos,
    }, status=200)

@csrf_exempt
def invest_in_pool(request: HttpRequest, pool_id: int):
    """Allow an investor to invest in a pool"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Check authentication
    investor, auth_error = _require_investor_auth(request)
    if auth_error:
        return auth_error
    
    try:
        pool = Pool.objects.get(id=pool_id, status='active')
    except Pool.DoesNotExist:
        return JsonResponse({'error': 'Pool not found or not available for investment'}, status=404)
    
    # Check if investor has already invested in this pool
    existing_investment = Investment.objects.filter(investor=investor, pool=pool).first()
    if existing_investment:
        return JsonResponse({'error': 'You have already invested in this pool'}, status=400)
    
    try:
        data = json.loads(request.body)
        amount = data.get('amount')
        
        if not amount:
            return JsonResponse({'error': 'Investment amount is required'}, status=400)
        
        # Convert to Decimal
        try:
            investment_amount = Decimal(str(amount))
        except (InvalidOperation, ValueError):
            return JsonResponse({'error': 'Invalid investment amount'}, status=400)
        
        # Validate investment amount (should be positive and not exceed pool amount)
        if investment_amount <= 0:
            return JsonResponse({'error': 'Investment amount must be positive'}, status=400)
        
        if investment_amount > pool.amount:
            return JsonResponse({'error': 'Investment amount cannot exceed pool amount'}, status=400)
        
        # Create the investment
        with transaction.atomic():
            investment = Investment.objects.create(
                investor=investor,
                pool=pool,
                amount=investment_amount,
                status='active'
            )
            
            # Update pool funding progress (you might want to calculate this based on total investments)
            # For now, we'll just mark the pool as having some investment
            
        return JsonResponse({
            'success': True,
            'investment': {
                'id': investment.id,
                'amount': str(investment.amount),
                'status': investment.status,
                'investedAt': investment.invested_at.isoformat(),
                'poolId': pool.id,
                'poolType': pool.pool_type,
                'roiRate': str(pool.roi_rate),
                'term': pool.term
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Investment failed: {str(e)}'}, status=500)

def get_my_investments(request: HttpRequest):
    """Get all investments for the authenticated investor"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Check authentication
    investor, auth_error = _require_investor_auth(request)
    if auth_error:
        return auth_error
    
    investments = Investment.objects.filter(investor=investor).select_related('pool', 'pool__borrower').order_by('-invested_at')
    
    investments_data = []
    for investment in investments:
        pool = investment.pool
        investments_data.append({
            'id': investment.id,
            'amount': str(investment.amount),
            'status': investment.status,
            'investedAt': investment.invested_at.isoformat(),
            'pool': {
                'id': pool.id,
                'poolType': pool.pool_type,
                'status': pool.status,
                'amount': str(pool.amount),
                'roiRate': str(pool.roi_rate),
                'term': pool.term,
                'termMonths': pool.term_months,
                'createdAt': pool.created_at.isoformat(),
                'addressLine': pool.address_line,
                'city': pool.city,
                'state': pool.state,
                'zipCode': pool.zip_code,
                'percentOwned': str(pool.percent_owned),
                'coOwner': pool.co_owner,
                'propertyValue': str(pool.property_value) if pool.property_value else None,
                'propertyLink': pool.property_link,
                'mortgageBalance': str(pool.mortgage_balance) if pool.mortgage_balance else None,
                'borrowerName': pool.borrower.full_name,
                'borrowerEmail': pool.borrower.email
            }
        })
    
    return JsonResponse({'investments': investments_data}, status=200)


def get_investor_dashboard(request: HttpRequest):
    """Get dashboard metrics for the authenticated investor"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Check authentication
    investor, auth_error = _require_investor_auth(request)
    if auth_error:
        return auth_error
    
    # Get all investments for this investor
    investments = Investment.objects.filter(investor=investor).select_related('pool')
    
    # Calculate metrics
    total_invested = sum(investment.amount for investment in investments)
    active_pools_count = investments.filter(status='active').count()
    
    # Calculate ROI (simplified - this would be more complex in real scenarios)
    # For now, we'll use the weighted average of pool ROI rates
    if investments.exists():
        total_investment_amount = sum(inv.amount for inv in investments)
        weighted_roi = sum(inv.amount * inv.pool.roi_rate for inv in investments) / total_investment_amount if total_investment_amount > 0 else 0
    else:
        weighted_roi = 0
    
    # Calculate pending payouts (simplified - would need actual payout schedule)
    # For now, we'll calculate expected returns from active investments
    active_investments = investments.filter(status='active')
    pending_payout_amount = 0
    next_payout_date = None
    
    if active_investments.exists():
        # Calculate expected returns (principal + interest)
        for investment in active_investments:
            expected_return = investment.amount * (1 + investment.pool.roi_rate / 100)
            pending_payout_amount += expected_return
        
        # For demo purposes, set next payout date as next month
        from datetime import datetime, timedelta
        next_payout_date = (datetime.now() + timedelta(days=30)).strftime('%B %d')
    
    dashboard_data = {
        'totalInvested': str(total_invested),
        'currentROI': f"{weighted_roi:.1f}",
        'activePools': active_pools_count,
        'pendingPayouts': {
            'amount': str(pending_payout_amount),
            'nextDate': next_payout_date
        }
    }
    
    return JsonResponse(dashboard_data, status=200)


@csrf_exempt
def update_pool(request: HttpRequest, pool_id: int):
    """Update pool details for the authenticated borrower"""
    if request.method != 'PUT':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    # Check authentication (supports Bearer token or session)
    borrower, auth_error = _require_borrower_auth(request)
    if auth_error:
        return auth_error

    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # Get pool and verify ownership
    try:
        pool = Pool.objects.get(id=pool_id, borrower=borrower)
    except Pool.DoesNotExist:
        return JsonResponse({'error': 'Pool not found'}, status=404)

    # Allow updates regardless of status for now (can restrict in future if needed)

    # Map and validate fields
    try:
        # Simple string fields
        if 'poolType' in data:
            pool.pool_type = data['poolType']
        if 'addressLine' in data:
            pool.address_line = data['addressLine']
        if 'city' in data:
            pool.city = data['city']
        if 'state' in data:
            pool.state = data['state']
        if 'zipCode' in data:
            pool.zip_code = data['zipCode']
        if 'coOwner' in data:
            co_owner = data.get('coOwner')
            pool.co_owner = (co_owner.strip() if isinstance(co_owner, str) else co_owner) or None
        if 'propertyLink' in data:
            prop_link = data.get('propertyLink')
            pool.property_link = (prop_link.strip() if isinstance(prop_link, str) else prop_link) or None
        if 'term' in data:
            pool.term = data['term']
            # If term is not custom, clear custom months unless explicitly provided
            if pool.term != 'custom' and 'customTermMonths' not in data:
                pool.custom_term_months = None
        if 'customTermMonths' in data:
            ctm = data['customTermMonths']
            pool.custom_term_months = int(ctm) if ctm is not None else None

        # Decimal/numeric fields via helper
        if 'percentOwned' in data:
            val = _safe_decimal(data.get('percentOwned'))
            if val is not None:
                pool.percent_owned = val
        if 'propertyValue' in data:
            pool.property_value = _safe_decimal(data.get('propertyValue'))
        if 'mortgageBalance' in data:
            pool.mortgage_balance = _safe_decimal(data.get('mortgageBalance'))
        if 'amount' in data:
            amt = _safe_decimal(data.get('amount'))
            if amt is not None:
                pool.amount = amt
        if 'roiRate' in data:
            rate = _safe_decimal(data.get('roiRate'))
            if rate is not None:
                pool.roi_rate = rate
        if 'otherPropertyLoans' in data:
            pool.other_property_loans = _safe_decimal(data.get('otherPropertyLoans'))
        if 'creditCardDebt' in data:
            pool.credit_card_debt = _safe_decimal(data.get('creditCardDebt'))
        if 'monthlyDebtPayments' in data:
            pool.monthly_debt_payments = _safe_decimal(data.get('monthlyDebtPayments'))

        pool.save()

        # Return updated pool details similar to get_pool_detail
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
            'addressLine': pool.address_line,
            'city': pool.city,
            'state': pool.state,
            'zipCode': pool.zip_code,
            'percentOwned': str(pool.percent_owned),
            'coOwner': pool.co_owner,
            'propertyValue': str(pool.property_value) if pool.property_value else None,
            'propertyLink': pool.property_link,
            'mortgageBalance': str(pool.mortgage_balance) if pool.mortgage_balance else None,
            'otherPropertyLoans': str(pool.other_property_loans) if pool.other_property_loans else None,
            'creditCardDebt': str(pool.credit_card_debt) if pool.credit_card_debt else None,
            'monthlyDebtPayments': str(pool.monthly_debt_payments) if pool.monthly_debt_payments else None,
            'homeInsuranceDoc': pool.home_insurance_doc,
            'taxReturnDoc': pool.tax_return_doc,
            'appraisalDoc': pool.appraisal_doc,
            'propertyPhotos': pool.property_photos,
        }, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def delete_pool(request: HttpRequest, pool_id: int):
    """Delete pool - only for draft pools"""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        # Get borrower from session
        borrower_id = request.session.get('borrower_id')
        if not borrower_id:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        
        try:
            borrower = Borrower.objects.get(id=borrower_id)
        except Borrower.DoesNotExist:
            return JsonResponse({'error': 'Borrower not found'}, status=404)
        
        # Get pool and verify ownership
        try:
            pool = Pool.objects.get(id=pool_id, borrower=borrower)
        except Pool.DoesNotExist:
            return JsonResponse({'error': 'Pool not found'}, status=404)
        
        # Allow deletion of pools in any status for now
        # You can add restrictions later if needed
        # if pool.status != 'draft':
        #     return JsonResponse({'error': 'Can only delete draft pools'}, status=400)
        
        # Delete the pool
        pool.delete()
        
        return JsonResponse({'message': 'Pool deleted successfully'}, status=200)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)