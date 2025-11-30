from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from billing.models import Subscription, SubscriptionPlan, PaynowSettings, PendingRegistration
from billing.serializers import SubscriptionPlanSerializer, SubscriptionSerializer
from auto_app.models import Seller, Role
from billing.paynow import Paynow
import uuid
import re
import logging
import traceback


logger = logging.getLogger(__name__)


def get_paynow_instance():
    """Get configured Paynow instance"""
    settings = PaynowSettings.objects.first()
    if not settings:
        raise ValueError("PaynowSettings not configured. Please configure Paynow credentials in admin.")
    return Paynow(
        settings.paynow_id,
        settings.paynow_key,
        settings.success_url or "https://auto.bench.co.zw/payment-status",
        settings.result_url or "https://auto.bench.co.zw/billing/paynow-webhook/",
    )


def get_frontend_base_url():
    """Get the frontend base URL for redirects"""
    settings = PaynowSettings.objects.first()
    if settings and settings.success_url:
        # Extract base URL from success_url (e.g., https://auto.bench.co.zw)
        from urllib.parse import urlparse
        parsed = urlparse(settings.success_url)
        return f"{parsed.scheme}://{parsed.netloc}"
    return "https://auto.bench.co.zw"


@api_view(['GET'])
@permission_classes([AllowAny])
def plans(request):
    """Get all available subscription plans"""
    return Response(SubscriptionPlanSerializer(
        SubscriptionPlan.objects.all(), many=True
    ).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_and_checkout(request, plan_id):
    """
    New user registration with subscription checkout.
    Creates a PendingRegistration and initiates Paynow payment.
    User + Seller are created only after successful payment.
    """
    data = request.data

    # Extract registration data
    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    phone = data.get('phone', '').strip()

    # Validation
    if not email or not username or not password:
        return Response({
            'success': False,
            'error': 'Email, username, and password are required'
        }, status=400)

    # Validate email format
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        return Response({
            'success': False,
            'error': 'Invalid email format'
        }, status=400)

    # Validate password strength
    if len(password) < 8:
        return Response({
            'success': False,
            'error': 'Password must be at least 8 characters long'
        }, status=400)

    # Check if user already exists
    if User.objects.filter(username=username).exists():
        return Response({
            'success': False,
            'error': 'Username already exists'
        }, status=400)

    if User.objects.filter(email=email).exists():
        return Response({
            'success': False,
            'error': 'Email already exists. Please login instead.'
        }, status=400)

    # Check if there's already a pending registration for this email
    existing_pending = PendingRegistration.objects.filter(email=email, status='pending').first()
    if existing_pending:
        existing_pending.delete()

    try:
        plan = SubscriptionPlan.objects.get(id=plan_id)
    except SubscriptionPlan.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Invalid subscription plan'
        }, status=404)

    # Create pending registration
    pending = PendingRegistration.objects.create(
        email=email,
        username=username,
        password_hash=make_password(password),
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        plan=plan,
        status='pending'
    )

    # Initialize Paynow payment
    try:
        paynow = get_paynow_instance()
        # Set dynamic return URL with pending_id
        frontend_url = get_frontend_base_url()
        paynow.set_return_url(f"{frontend_url}/payment-status?pending_id={pending.id}")

        reference = f"REG-{pending.id}-{uuid.uuid4().hex[:8]}"
        payment = paynow.create_payment(reference, email)
        payment.add(f"{plan.name} Subscription", float(plan.price + plan.tax))
        response = paynow.send(payment)

        if not response.success:
            pending.status = 'failed'
            pending.save()
            return Response({
                'success': False,
                'error': f'Payment initiation failed: {getattr(response, "error", "Unknown error")}'
            }, status=500)

        pending.payment_url = response.poll_url
        pending.paynow_reference = reference
        pending.save()

        logger.info(f"Payment initiated for pending registration {pending.id}: {response.poll_url}")

        return Response({
            'success': True,
            'pending_id': pending.id,
            'redirect_url': response.redirect_url,
            'poll_url': response.poll_url
        })

    except Exception as e:
        logger.error(f"Payment initiation error: {str(e)}")
        logger.error(traceback.format_exc())
        pending.status = 'failed'
        pending.save()
        return Response({
            'success': False,
            'error': f'Payment initiation failed: {str(e)}'
        }, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request, plan_id):
    """
    Checkout for existing authenticated users (renewal).
    Creates a Subscription with pending_payment status.
    """
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id)
    except SubscriptionPlan.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Invalid subscription plan'
        }, status=404)

    # Create subscription record
    sub = Subscription.objects.create(
        user=request.user,
        plan=plan,
        currency=plan.currency,
        status='pending_payment'
    )

    try:
        paynow = get_paynow_instance()
        # Set dynamic return URL with subscription_id
        frontend_url = get_frontend_base_url()
        paynow.set_return_url(f"{frontend_url}/payment-status?subscription_id={sub.id}")

        reference = f"SUB-{sub.id}-{uuid.uuid4().hex[:8]}"
        payment = paynow.create_payment(reference, request.user.email)
        payment.add(f"{plan.name} Subscription", float(plan.price + plan.tax))
        response = paynow.send(payment)

        if not response.success:
            sub.delete()
            return Response({
                'success': False,
                'error': f'Payment initiation failed: {getattr(response, "error", "Unknown error")}'
            }, status=500)

        sub.payment_url = response.poll_url
        sub.save()

        logger.info(f"Payment initiated for subscription {sub.id}: {response.poll_url}")

        return Response({
            'success': True,
            'subscription_id': sub.id,
            'url': response.redirect_url,
            'poll_url': response.poll_url
        })

    except Exception as e:
        logger.error(f"Payment initiation error: {str(e)}")
        logger.error(traceback.format_exc())
        sub.delete()
        return Response({
            'success': False,
            'error': f'Payment initiation failed: {str(e)}'
        }, status=500)


def verify_payment(poll_url):
    """Verify payment status via Paynow poll URL"""
    try:
        paynow = get_paynow_instance()
        status = paynow.check_transaction_status(poll_url)
        return status.paid, status.status
    except Exception as e:
        logger.error(f"Payment verification error: {str(e)}")
        return False, str(e)


def activate_pending_registration(pending):
    """
    Complete registration after successful payment.
    Creates User, Seller, and Subscription.
    """
    # Create the user
    user = User.objects.create(
        username=pending.username,
        email=pending.email,
        password=pending.password_hash,
        first_name=pending.first_name,
        last_name=pending.last_name
    )

    # Get or create a default Seller role
    seller_role, _ = Role.objects.get_or_create(
        role_name='Seller',
        defaults={'name': 'Seller'}
    )

    # Create the seller profile
    seller = Seller.objects.create(
        user=user,
        name=f"{pending.first_name} {pending.last_name}".strip() or pending.username,
        email=pending.email,
        phone_number=pending.phone,
        is_cms_user=True,
        role=seller_role
    )

    # Create and activate subscription
    subscription = Subscription.objects.create(
        user=user,
        plan=pending.plan,
        currency=pending.plan.currency,
        payment_url=pending.payment_url,
        payment_verified=True
    )
    subscription.activate()

    # Mark pending registration as completed
    pending.status = 'completed'
    pending.save()

    logger.info(f"Registration completed for {user.email}, subscription activated until {subscription.expires_at}")

    return user, seller, subscription


def activate_existing_subscription(subscription):
    """Activate subscription for existing user"""
    subscription.activate()

    # Ensure user has a seller profile
    user = subscription.user
    if not hasattr(user, 'seller'):
        seller_role, _ = Role.objects.get_or_create(
            role_name='Seller',
            defaults={'name': 'Seller'}
        )
        Seller.objects.create(
            user=user,
            name=user.get_full_name() or user.username,
            email=user.email,
            is_cms_user=True,
            role=seller_role
        )
    else:
        # Ensure seller has CMS access
        seller = user.seller
        if not seller.is_cms_user:
            seller.is_cms_user = True
            seller.save()

    logger.info(f"Subscription activated for {user.email} until {subscription.expires_at}")


@api_view(['POST'])
@permission_classes([AllowAny])
def paynow_webhook(request):
    """
    Webhook endpoint for Paynow payment notifications.
    Called by Paynow when payment status changes.
    """

    status = request.data.get('status', '').lower()
    poll_url = request.data.get('pollurl', '')

    logger.info(f"Paynow webhook received: status={status}, poll_url={poll_url}")

    if status == 'paid':
        # Check if this is a pending registration
        pending = PendingRegistration.objects.filter(
            payment_url=poll_url,
            status='pending'
        ).first()

        if pending:
            try:
                activate_pending_registration(pending)
                logger.info(f"Pending registration {pending.id} activated via webhook")
            except Exception as e:
                logger.error(f"Failed to activate pending registration: {str(e)}")
                return HttpResponse("Error", status=500)
        else:
            # Check if this is an existing subscription
            subscription = Subscription.objects.filter(
                payment_url=poll_url,
                status='pending_payment'
            ).first()

            if subscription:
                try:
                    activate_existing_subscription(subscription)
                    logger.info(f"Subscription {subscription.id} activated via webhook")
                except Exception as e:
                    logger.error(f"Failed to activate subscription: {str(e)}")
                    return HttpResponse("Error", status=500)

    return HttpResponse("OK")


@api_view(['GET'])
@permission_classes([AllowAny])
def payment_success(request):
    """
    Success page after Paynow payment.
    Verifies payment and activates subscription if not already done by webhook.
    """
    poll_url = request.GET.get('pollurl', '')

    if not poll_url:
        return Response({
            'success': False,
            'error': 'No poll URL provided'
        }, status=400)

    # Verify payment
    is_paid, status_msg = verify_payment(poll_url)

    if not is_paid:
        return Response({
            'success': False,
            'error': f'Payment not confirmed: {status_msg}',
            'payment_status': status_msg
        })

    # Check if this is a pending registration
    pending = PendingRegistration.objects.filter(payment_url=poll_url).first()

    if pending:
        if pending.status == 'completed':
            user = User.objects.filter(email=pending.email).first()
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'success': True,
                    'message': 'Account created and subscription activated!',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                    }
                })
        elif pending.status == 'pending':
            try:
                user, seller, subscription = activate_pending_registration(pending)
                refresh = RefreshToken.for_user(user)
                return Response({
                    'success': True,
                    'message': 'Account created and subscription activated!',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                    },
                    'subscription': {
                        'plan': subscription.plan.name,
                        'expires_at': str(subscription.expires_at)
                    }
                })
            except Exception as e:
                logger.error(f"Failed to activate pending registration: {str(e)}")
                return Response({
                    'success': False,
                    'error': f'Failed to create account: {str(e)}'
                }, status=500)

    # Check if this is an existing subscription
    subscription = Subscription.objects.filter(payment_url=poll_url).first()

    if subscription:
        if subscription.status != 'active':
            activate_existing_subscription(subscription)

        return Response({
            'success': True,
            'message': 'Subscription activated!',
            'subscription': {
                'plan': subscription.plan.name,
                'expires_at': str(subscription.expires_at),
                'status': subscription.status
            }
        })

    return Response({
        'success': False,
        'error': 'Could not find associated registration or subscription'
    }, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_payment_status(request):
    """
    Check payment status for a pending registration or subscription.
    """
    pending_id = request.GET.get('pending_id')
    subscription_id = request.GET.get('subscription_id')
    poll_url = None

    if pending_id:
        pending = PendingRegistration.objects.filter(id=pending_id).first()
        if not pending:
            return Response({'success': False, 'error': 'Not found'}, status=404)

        if pending.status == 'completed':
            user = User.objects.filter(email=pending.email).first()
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'success': True,
                    'status': 'completed',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                    }
                })

        poll_url = pending.payment_url

    elif subscription_id:
        subscription = Subscription.objects.filter(id=subscription_id).first()
        if not subscription:
            return Response({'success': False, 'error': 'Not found'}, status=404)

        if subscription.status == 'active':
            return Response({
                'success': True,
                'status': 'active',
                'subscription': SubscriptionSerializer(subscription).data
            })

        poll_url = subscription.payment_url

    if not poll_url:
        return Response({'success': False, 'error': 'No payment URL'}, status=400)

    # Check payment status
    is_paid, status_msg = verify_payment(poll_url)

    if is_paid:
        if pending_id:
            pending = PendingRegistration.objects.get(id=pending_id)
            if pending.status == 'pending':
                user, seller, subscription = activate_pending_registration(pending)
                refresh = RefreshToken.for_user(user)
                return Response({
                    'success': True,
                    'status': 'completed',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                })
        elif subscription_id:
            subscription = Subscription.objects.get(id=subscription_id)
            if subscription.status == 'pending_payment':
                activate_existing_subscription(subscription)
                return Response({
                    'success': True,
                    'status': 'active'
                })

    return Response({
        'success': True,
        'status': 'pending',
        'payment_status': status_msg
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_history(request):
    """Get subscription history for current user"""
    return Response(SubscriptionSerializer(
        Subscription.objects.filter(user=request.user).order_by('-created_at'), many=True
    ).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def active_plan(request):
    """Get active subscription for current user"""
    subs = Subscription.objects.filter(user=request.user, status='active').first()
    if not subs:
        return Response({
            'success': True,
            'has_active': False,
            'subscription': None
        })

    return Response({
        'success': True,
        'has_active': True,
        'subscription': SubscriptionSerializer(subs).data,
        'days_remaining': subs.days_until_expiry()
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def successful_payment(request):
    """Legacy endpoint - redirects to payment_success"""
    return payment_success(request)
