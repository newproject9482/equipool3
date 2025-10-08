from django.db import models
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
import random
import string

class Borrower(models.Model):
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    password_hash = models.CharField(max_length=128)
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password: str):
        self.password_hash = make_password(raw_password)

    @property
    def full_name(self):
        """Helper property to get full name when needed"""
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"Borrower({self.email})"

class Investor(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    date_of_birth = models.DateField()
    phone = models.CharField(max_length=20)
    ssn = models.CharField(max_length=11)  # For SSN with dashes: XXX-XX-XXXX
    address1 = models.CharField(max_length=255)
    address2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='United States')
    password_hash = models.CharField(max_length=128)
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password: str):
        self.password_hash = make_password(raw_password)

    def __str__(self):
        return f"Investor({self.email})"

class AuthToken(models.Model):
    """Simple authentication token for cross-origin requests"""
    token = models.CharField(max_length=255, unique=True)
    borrower = models.ForeignKey(Borrower, null=True, blank=True, on_delete=models.CASCADE)
    investor = models.ForeignKey(Investor, null=True, blank=True, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)  # Token valid for 7 days
        super().save(*args, **kwargs)
    
    def is_valid(self):
        return timezone.now() < self.expires_at
    
    @property
    def user(self):
        return self.borrower or self.investor
    
    @property
    def role(self):
        if self.borrower:
            return 'borrower'
        elif self.investor:
            return 'investor'
        return None
    
    def __str__(self):
        user = self.borrower or self.investor
        return f"AuthToken({user.email if user else 'None'})"

class EmailVerification(models.Model):
    """Store email verification codes for users during signup"""
    email = models.EmailField()
    code = models.CharField(max_length=6)
    user_type = models.CharField(max_length=10, choices=[('borrower', 'Borrower'), ('investor', 'Investor')])
    user_data = models.JSONField()  # Store the signup data until verification
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    verified = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=15)  # 15 minute expiry
        if not self.code:
            self.code = self.generate_code()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_code():
        """Generate a 4-digit verification code"""
        return ''.join(random.choices(string.digits, k=4))
    
    def is_valid(self):
        """Check if code is still valid (not expired and not verified)"""
        return not self.verified and timezone.now() < self.expires_at
    
    def __str__(self):
        return f"EmailVerification({self.email}, {self.code})"

class Pool(models.Model):
    POOL_TYPE_CHOICES = [
        ('equity', 'Equity Pool'),
        ('refinance', 'Refinance Pool'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('funded', 'Funded'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    TERM_CHOICES = [
        ('6', '6 Months'),
        ('12', '12 Months'),
        ('24', '24 Months'),
        ('custom', 'Custom'),
    ]
    
    LOAN_TYPE_CHOICES = [
        ('interest-only', 'Interest-Only'),
        ('maturity', 'Maturity'),
    ]

    # Basic pool information
    borrower = models.ForeignKey(Borrower, on_delete=models.CASCADE, related_name='pools')
    pool_type = models.CharField(max_length=20, choices=POOL_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Personal information (captured during pool creation)
    # Name fields (current name)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    
    # Prior names (optional)
    prior_first_name = models.CharField(max_length=100, blank=True)
    prior_middle_name = models.CharField(max_length=100, blank=True)
    prior_last_name = models.CharField(max_length=100, blank=True)
    
    # Financial information
    ssn = models.CharField(max_length=15, help_text="Social Security Number for identity verification")
    fico_score = models.PositiveIntegerField(blank=True, null=True, help_text="Credit score (optional)")
    
    # Mailing address
    address_line_1 = models.CharField(max_length=255, help_text="Street address line 1")
    address_line_2 = models.CharField(max_length=255, blank=True, help_text="Street address line 2 (optional)")
    mailing_city = models.CharField(max_length=100, help_text="City")
    mailing_state = models.CharField(max_length=50, help_text="State")
    mailing_zip_code = models.CharField(max_length=10, help_text="ZIP code")
    mailing_country = models.CharField(max_length=100, default='United States')
    
    # Property information
    address_line = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='United States')
    primary_address_choice = models.CharField(max_length=50, blank=True, null=True, 
                                              help_text="Primary residence choice: primary, vacant, tenant, owner-occupied")
    percent_owned = models.DecimalField(max_digits=5, decimal_places=2)  # e.g., 100.00 for 100%
    co_owner = models.CharField(max_length=255, blank=True, null=True)
    co_owners = models.JSONField(default=list, blank=True, help_text="List of co-owner information")
    property_value = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    property_link = models.URLField(blank=True, null=True)
    property_links = models.JSONField(default=list, blank=True, help_text="List of property links")
    mortgage_balance = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    existing_loans = models.JSONField(default=list, blank=True, help_text="List of existing loans on property")
    
    # Pool terms
    amount = models.DecimalField(max_digits=12, decimal_places=2)  # Amount requested
    roi_rate = models.DecimalField(max_digits=5, decimal_places=2)  # Interest rate percentage
    loan_type = models.CharField(max_length=20, choices=LOAN_TYPE_CHOICES, blank=True, null=True)  # Loan type
    term = models.CharField(max_length=10, choices=TERM_CHOICES, default='12')
    term_months = models.PositiveIntegerField(blank=True, null=True)  # Actual term in months (for calculations)
    is_custom_term = models.BooleanField(default=False)  # Whether custom term was used
    custom_term_months = models.PositiveIntegerField(blank=True, null=True)  # For custom terms
    
    # Liability information (optional)
    other_property_loans = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    credit_card_debt = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    monthly_debt_payments = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    liabilities = models.JSONField(default=list, blank=True, help_text="Array of liability objects with type, amount, monthlyPayment, remainingBalance")
    
    # Document uploads (we'll store file paths/URLs)
    home_insurance_doc = models.CharField(max_length=500, blank=True, null=True)
    tax_return_doc = models.CharField(max_length=500, blank=True, null=True)
    appraisal_doc = models.CharField(max_length=500, blank=True, null=True)
    property_photos = models.JSONField(default=list, blank=True)  # List of photo URLs/paths
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Calculated fields
    @property
    def funding_progress(self):
        # Calculate funding progress percentage
        # This would be calculated based on investments received
        return 0
    
    def __str__(self):
        return f"Pool({self.id}) - {self.pool_type} - ${self.amount} - {self.borrower.email}"
    
    class Meta:
        ordering = ['-created_at']

class Investment(models.Model):
    """Track investor investments in pools"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE, related_name='investments')
    pool = models.ForeignKey(Pool, on_delete=models.CASCADE, related_name='investments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)  # Amount invested
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    invested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['investor', 'pool']  # Each investor can only invest once per pool
        ordering = ['-invested_at']
    
    def __str__(self):
        return f"Investment({self.investor.email} -> Pool {self.pool.id}: ${self.amount})"
