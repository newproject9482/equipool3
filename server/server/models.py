from django.db import models
from django.contrib.auth.hashers import make_password

class Borrower(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    date_of_birth = models.DateField()
    password_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password: str):
        self.password_hash = make_password(raw_password)

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
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password: str):
        self.password_hash = make_password(raw_password)

    def __str__(self):
        return f"Investor({self.email})"

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

    # Basic pool information
    borrower = models.ForeignKey(Borrower, on_delete=models.CASCADE, related_name='pools')
    pool_type = models.CharField(max_length=20, choices=POOL_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Property information
    address_line = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='United States')
    percent_owned = models.DecimalField(max_digits=5, decimal_places=2)  # e.g., 100.00 for 100%
    co_owner = models.CharField(max_length=255, blank=True, null=True)
    property_value = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    property_link = models.URLField(blank=True, null=True)
    mortgage_balance = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    
    # Pool terms
    amount = models.DecimalField(max_digits=12, decimal_places=2)  # Amount requested
    roi_rate = models.DecimalField(max_digits=5, decimal_places=2)  # Interest rate percentage
    term = models.CharField(max_length=10, choices=TERM_CHOICES, default='12')
    custom_term_months = models.PositiveIntegerField(blank=True, null=True)  # For custom terms
    
    # Liability information (optional)
    other_property_loans = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    credit_card_debt = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    monthly_debt_payments = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    
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
    
    @property
    def term_months(self):
        """Get the term in months"""
        if self.term == 'custom':
            return self.custom_term_months or 12
        return int(self.term)
    
    def __str__(self):
        return f"Pool({self.id}) - {self.pool_type} - ${self.amount} - {self.borrower.email}"
    
    class Meta:
        ordering = ['-created_at']
