from django.db import models
from auto_app.models import BaseModel
from datetime import date, timedelta


class SingletonModel(BaseModel):
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj


class PendingRegistration(BaseModel):
    """
    Stores registration data until payment is verified.
    Once payment is confirmed, this data is used to create User + Seller.
    """
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    password_hash = models.CharField(max_length=255)  # Hashed password
    first_name = models.CharField(max_length=150, blank=True, default="")
    last_name = models.CharField(max_length=150, blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    plan = models.ForeignKey('billing.SubscriptionPlan', on_delete=models.CASCADE)
    payment_url = models.CharField(max_length=500, null=True, blank=True)
    paynow_reference = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50, choices=[
        ('pending', 'Pending Payment'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('expired', 'Expired'),
    ], default='pending')

    def __str__(self):
        return f"Pending: {self.email} - {self.plan.name}"


class Subscription(BaseModel):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    plan = models.ForeignKey('billing.SubscriptionPlan', on_delete=models.CASCADE)
    currency = models.CharField(max_length=12, blank=True, null=True)
    payment_verified = models.BooleanField(default=False)
    payment_url = models.CharField(max_length=500, null=True, blank=True)
    status = models.CharField(max_length=255, blank=True, choices=[
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('pending_payment', 'Pending Payment')
    ], default='pending_payment')  # Fixed: was 'inactive' which wasn't in choices
    activated = models.DateField(null=True, blank=True)
    expires_at = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.plan.name} ({self.status})"

    def activate(self):
        """Activate the subscription"""
        self.status = 'active'
        self.payment_verified = True
        self.activated = date.today()
        self.expires_at = date.today() + timedelta(days=self.plan.duration)
        self.save()

    def is_expired(self):
        """Check if subscription is expired"""
        if not self.expires_at:
            return True
        return date.today() > self.expires_at

    def days_until_expiry(self):
        """Get number of days until subscription expires"""
        if not self.expires_at:
            return 0
        delta = self.expires_at - date.today()
        return max(0, delta.days)

    def expire(self):
        """Mark subscription as expired"""
        self.status = 'expired'
        self.save()


class SubscriptionPlan(BaseModel):
    name = models.CharField(max_length=255)
    currency = models.CharField(max_length=12, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField()  # Duration in days
    description = models.TextField()

    def __str__(self):
        return self.name


class PaynowSettings(SingletonModel):
    paynow_id = models.CharField(max_length=255)
    paynow_key = models.CharField(max_length=255)
    success_url = models.CharField(max_length=255)
    result_url = models.CharField(max_length=255, blank=True, default="")
