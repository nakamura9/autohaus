from django.urls import path
from billing.views import (
    plans, checkout, subscription_history, active_plan,
    successful_payment, paynow_webhook,
    payment_success, check_payment_status, register_and_checkout
)


urlpatterns = [
    path('plans/', plans, name="plans"),
    path('checkout/<int:plan_id>/', checkout, name="checkout"),
    path('register/<int:plan_id>/', register_and_checkout, name="register-and-checkout"),
    path('subscription-history/', subscription_history, name="subscription-history"),
    path('active-plan/', active_plan, name="active-plan"),
    path('successful-payment/', successful_payment, name="successful-payment"),
    path('payment-success/', payment_success, name="payment-success"),
    path('paynow-webhook/', paynow_webhook, name="paynow-webhook"),
    path('check-payment-status/', check_payment_status, name="check-payment-status"),
]
