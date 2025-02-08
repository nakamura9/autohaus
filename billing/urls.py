from django.urls import path, re_path
from billing.views import plans, checkout, subscription_history, active_plan, successful_payment


urlpatterns = [
    path('plans/',  plans, name="plans"),
    path('checkout/<int:plan_id>/', checkout, name="checkout"),
    path('subscription-history/', subscription_history, name="subscription-history"),
    path('active-plan/', active_plan, name="active-plan"),
    path('successful-payment/', successful_payment, name="successful-payment"),
]
