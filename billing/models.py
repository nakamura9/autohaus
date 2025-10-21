from django.db import models
from auto_app.models import BaseModel


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


class Subscription(BaseModel):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    plan = models.ForeignKey('billing.SubscriptionPlan', on_delete=models.CASCADE)
    currency = models.CharField(max_length=12, blank=True, null=True)
    payment_verified = models.BooleanField(default=False)
    payment_url = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=255, blank=True, choices=[
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('pending_payment', 'Pending Payment')
    ], default='inactive')
    activated = models.DateField(null=True, blank=True)

    def __str__(self):
        return "%s - %06d" % (self.user.username, Subscription.objects.filter(plan=self.plan).count())


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
