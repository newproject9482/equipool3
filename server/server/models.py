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
