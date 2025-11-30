from django.contrib import admin
from billing.models import SubscriptionPlan, PaynowSettings, Subscription, PendingRegistration


admin.site.register(SubscriptionPlan)
admin.site.register(Subscription)
admin.site.register(PaynowSettings)
admin.site.register(PendingRegistration)
# Register your models here.
