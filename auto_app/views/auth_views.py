from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from auto_app.models import Seller, Role
import re


class LoginView(APIView):
    """User login with JWT authentication"""
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({
                'success': False,
                'error': 'Username and password are required'
            }, status=400)

        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            seller = getattr(user, 'seller', None)

            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_cms_user': seller.is_cms_user if seller else False,
                'is_superuser': user.is_superuser,
                'has_seller': seller is not None,
                'has_subscription': seller.has_active_subscription() if seller else False,
            }

            if seller:
                user_data['role'] = seller.role.role_name if seller.role else None
                user_data['phone'] = seller.phone_number
                user_data['seller_id'] = seller.id
                user_data['city'] = seller.city_id
                user_data['country'] = seller.country
                user_data['whatsapp'] = seller.whatsapp
                user_data['photo'] = seller.photo.url if seller.photo else None
                user_data['recovery_email'] = seller.recovery_email
                # Include subscription info
                active_sub = seller.get_active_subscription()
                if active_sub:
                    user_data['subscription'] = {
                        'id': active_sub.id,
                        'plan': active_sub.plan.name,
                        'status': active_sub.status,
                        'activated': str(active_sub.activated) if active_sub.activated else None,
                    }

            return Response({
                'success': True,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': user_data
            })

        return Response({
            'success': False,
            'error': 'Invalid credentials'
        }, status=401)


class SignUpView(APIView):
    """
    User registration - DISABLED
    Regular signups are no longer allowed. Users must subscribe to become sellers.
    This endpoint is kept for informational purposes only.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        return Response({
            'success': False,
            'error': 'Direct registration is not available. Please subscribe to a plan to create an account and start selling.'
        }, status=403)


class CurrentUserView(APIView):
    """Get current logged in user details"""
    def get(self, request):
        if request.user.is_anonymous:
            return Response({
                'success': False,
                'error': 'Not authenticated'
            }, status=401)

        user = request.user
        seller = getattr(user, 'seller', None)

        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_cms_user': seller.is_cms_user if seller else False,
            'is_superuser': user.is_superuser,
            'has_seller': seller is not None,
            'has_subscription': seller.has_active_subscription() if seller else False,
        }

        if seller:
            user_data['role'] = seller.role.role_name if seller.role else None
            user_data['phone'] = seller.phone_number
            user_data['seller_id'] = seller.id
            user_data['city'] = seller.city_id
            user_data['country'] = seller.country
            user_data['whatsapp'] = seller.whatsapp
            user_data['photo'] = seller.photo.url if seller.photo else None
            user_data['recovery_email'] = seller.recovery_email
            # Include subscription info
            active_sub = seller.get_active_subscription()
            if active_sub:
                user_data['subscription'] = {
                    'id': active_sub.id,
                    'plan': active_sub.plan.name,
                    'status': active_sub.status,
                    'activated': str(active_sub.activated) if active_sub.activated else None,
                }

        return Response({
            'success': True,
            'user': user_data
        })
