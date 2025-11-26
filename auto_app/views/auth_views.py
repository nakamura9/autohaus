from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from auto_app.models import Account, Role
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
            account = getattr(user, 'account', None)

            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_cms_user': account.is_cms_user if account else False,
                'is_superuser': user.is_superuser,
            }

            if account:
                user_data['role'] = account.role.role_name if account.role else None
                user_data['phone'] = account.phone

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
    """User registration"""
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        phone = request.data.get('phone', '')

        # Validation
        if not username or not email or not password:
            return Response({
                'success': False,
                'error': 'Username, email, and password are required'
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

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response({
                'success': False,
                'error': 'Username already exists'
            }, status=400)

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'success': False,
                'error': 'Email already exists'
            }, status=400)

        try:
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            # Create account
            account = Account.objects.create(
                user=user,
                phone=phone,
                is_cms_user=False,  # Default to False, admin can change later
                role=None  # No role by default
            )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'success': True,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_cms_user': account.is_cms_user,
                    'phone': account.phone,
                }
            }, status=201)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to create user: {str(e)}'
            }, status=500)


class CurrentUserView(APIView):
    """Get current logged in user details"""
    def get(self, request):
        if request.user.is_anonymous:
            return Response({
                'success': False,
                'error': 'Not authenticated'
            }, status=401)

        user = request.user
        account = getattr(user, 'account', None)

        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_cms_user': account.is_cms_user if account else False,
            'is_superuser': user.is_superuser,
        }

        if account:
            user_data['role'] = account.role.role_name if account.role else None
            user_data['phone'] = account.phone

        return Response({
            'success': True,
            'user': user_data
        })
