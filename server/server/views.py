import json
from datetime import datetime
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from .models import Borrower, Investor
from django.contrib.auth.hashers import check_password

REQUIRED_FIELDS = {"fullName", "email", "dateOfBirth", "password"}
REQUIRED_INVESTOR_FIELDS = {"fullName", "email", "dateOfBirth", "phone", "ssn", "address1", "city", "state", "zip", "country", "password"}

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

    full_name = data.get("fullName", "").strip()
    email = data.get("email", "").lower().strip()
    dob_raw = data.get("dateOfBirth")
    password = data.get("password")

    if not full_name:
        return JsonResponse({"error": "Full name required"}, status=400)
    if not email or "@" not in email:
        return JsonResponse({"error": "Valid email required"}, status=400)
    if not password or len(password) < 8:
        return JsonResponse({"error": "Password must be at least 8 characters"}, status=400)
    try:
        dob = _parse_date(dob_raw)
    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)

    try:
        b = Borrower(full_name=full_name, email=email, date_of_birth=dob)
        b.set_password(password)
        b.save()
    except IntegrityError:
        return JsonResponse({"error": "Email already registered"}, status=409)

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
        return JsonResponse({'error':'Invalid JSON'}, status=400)
    email = data.get('email','').lower().strip()
    password = data.get('password','')
    if not email or not password:
        return JsonResponse({'error':'Email and password required'}, status=400)
    try:
        b = Borrower.objects.get(email=email)
    except Borrower.DoesNotExist:
        return JsonResponse({'error':'Invalid credentials'}, status=401)
    if not check_password(password, b.password_hash):
        return JsonResponse({'error':'Invalid credentials'}, status=401)
    # Establish session
    request.session['borrower_id'] = b.id
    request.session['role'] = 'borrower'
    print(f"[DEBUG] Session established for borrower: {b.id}")
    return JsonResponse({'id': b.id,'fullName': b.full_name,'email': b.email,'role':'borrower'}, status=200)

@csrf_exempt
def auth_logout(request: HttpRequest):
    if request.method != 'POST':
        return JsonResponse({'error':'Method not allowed'}, status=405)
    request.session.flush()
    return JsonResponse({'success': True})

def auth_me(request: HttpRequest):
    print(f"[DEBUG] Auth check - session data: {dict(request.session)}")
    borrower_id = request.session.get('borrower_id')
    investor_id = request.session.get('investor_id')
    print(f"[DEBUG] Borrower ID: {borrower_id}, Investor ID: {investor_id}")
    
    if borrower_id:
        try:
            b = Borrower.objects.get(id=borrower_id)
            return JsonResponse({
                'authenticated': True,
                'id': b.id,
                'fullName': b.full_name,
                'email': b.email,
                'role': 'borrower'
            })
        except Borrower.DoesNotExist:
            pass
    
    if investor_id:
        try:
            i = Investor.objects.get(id=investor_id)
            return JsonResponse({
                'authenticated': True,
                'id': i.id,
                'fullName': i.full_name,
                'email': i.email,
                'role': 'investor'
            })
        except Investor.DoesNotExist:
            pass
    
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
        print(f"[DEBUG] Successfully created investor with ID: {i.id}")
    except IntegrityError:
        print(f"[DEBUG] Email already registered: {email}")
        return JsonResponse({"error": "Email already registered"}, status=409)

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
    
    # Establish session
    request.session['investor_id'] = i.id
    request.session['role'] = 'investor'
    
    return JsonResponse({
        'id': i.id,
        'fullName': i.full_name,
        'email': i.email,
        'role': 'investor'
    }, status=200)
