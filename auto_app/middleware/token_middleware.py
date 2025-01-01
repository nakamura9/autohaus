from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.http import JsonResponse

class TokenAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get the authorization header
        auth_header = request.headers.get('Authorization')

        if auth_header and auth_header.startswith('Token '):
            # Extract the token
            token_key = auth_header.split(' ')[1]

            try:
                # Get the token object
                token = Token.objects.select_related('user').get(key=token_key)

                # Set the authenticated user on the request
                request.user = token.user

            except Token.DoesNotExist:
                return JsonResponse(
                    {'error': 'Invalid or expired token'}, 
                    status=401
                )

        return self.get_response(request)
