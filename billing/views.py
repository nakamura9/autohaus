from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from billing.models import Subscription, SubscriptionPlan, PaynowSettings
from billing.serializers import SubscriptionPlanSerializer, SubscriptionSerializer
import uuid
uuid.uuid4().hex
from billing.paynow import Paynow


def plans(request):
    return JsonResponse(
        SubscriptionPlanSerializer(
            SubscriptionPlan.objects.all(), many=True
        ).data, safe=False)


def checkout(request, plan_id):
    if request.method != "POST":
        return JsonResponse({'success': False, 'error': 'Invalid request method'})

    if request.user.is_anonymous:
        return JsonResponse({'success': False, 'error': 'User is not logged in'})

    plan = SubscriptionPlan.objects.get(id=plan_id)
    sub = Subscription.objects.create(
        user=request.user,
        plan=plan,
        currency=plan.currency,
        status='pending_payment'
    )
    settings = PaynowSettings.objects.first()
    print(settings.paynow_id)
    print(settings.paynow_key)
    paynow = Paynow(
        settings.paynow_id,
        settings.paynow_key,
        "https://auto.bench.co.zw/billing/successful-payment",
        "https://auto.bench.co.zw/billing/successful-payment",
    )

    payment = paynow.create_payment(str(sub), request.user.email)
    payment.add(str(plan), plan.price)
    response = paynow.send(payment)
    sub.payment_url = response.poll_url
    sub.save()

    print(sub.pk)
    print(response)
    print(dir(response))
    print(response.poll_url)
    print(response.status)
    print("%s" % response.error)
    print(response.redirect_url)

    return JsonResponse({
        'success': True,
        "id": sub.pk,
        "url": response.redirect_url
    })


def subscription_history(request):
    if request.user.is_anonymous:
        return JsonResponse([], safe=False)
    return JsonResponse(
        SubscriptionSerializer(
            Subscription.objects.filter(user=request.user), many=True
        ).data, safe=False)


def active_plan(request):
    if request.user.is_anonymous:
        return JsonResponse([], safe=False)

    subs = Subscription.objects.filter(user=request.user, status='active')
    if not subs.exists():
        return JsonResponse([], safe=False)

    return JsonResponse(
        SubscriptionSerializer(
            subs.first()
        ).data, safe=False)


def successful_payment(request):
    return HttpResponse("Ok")
