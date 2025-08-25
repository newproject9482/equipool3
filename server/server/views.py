import json
from datetime import datetime
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from .models import Borrower
from django.contrib.auth.hashers import check_password

REQUIRED_FIELDS = {"fullName", "email", "dateOfBirth", "password"}

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
    if not check_password(password, b.password_hash):
        return JsonResponse({'error':'Invalid credentials'}, status=401)
    # Simple success response. Later: issue token/session.
    return JsonResponse({'id': b.id,'fullName': b.full_name,'email': b.email}, status=200)
