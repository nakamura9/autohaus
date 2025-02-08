from django.contrib import admin
from billing.models import SubscriptionPlan, PaynowSettings, Subscription


admin.site.register(SubscriptionPlan)
admin.site.register(Subscription)
admin.site.register(PaynowSettings)
# Register your models here.
