from django.shortcuts import render
from auto_app.views.api import *
from auto_app.forms import SignUpForm, LoginForm
from django.http import JsonResponse
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.models import User
from auto_app.models import Seller
from rest_framework.authtoken.models import Token
from auto_app.utils import seller_json

def app(request):
    return render(request,'index.html')


def sign_up(request):
    form = SignUpForm(request.POST)
    if not form.is_valid():

        return JsonResponse({'success': False, 'errors': form.errors})

    cleaned_data = form.cleaned_data
    new_user = User.objects.create_user(
        username=cleaned_data['email'],
        email=cleaned_data['email'],
        password=cleaned_data['password'],
        first_name=cleaned_data['first_name'],
        last_name=cleaned_data['last_name']
    )

    seller = Seller.objects.create(
        user=new_user,
        name=f"{cleaned_data['first_name']} {cleaned_data['last_name']}",
        phone_number=cleaned_data['phone'],
        email=cleaned_data['email'],
        address='hidden',
        city="HARARE", # TODO replace
        state="HARARE",
        zip_code="00263",
        country=cleaned_data['country'],
        whatsapp=True
    )

    token = Token.objects.create(user=new_user)

    return JsonResponse({
        'success': True, 
        'id': seller.pk,
        'token': token.key
    })


def login(request):
    form = LoginForm(request.POST)
    if not form.is_valid():
        return JsonResponse({'success': False, 'errors': form.errors})

    user = authenticate(username=form.cleaned_data.get('email'), password=form.cleaned_data.get('password'))
    token, _ = Token.objects.get_or_create(user=user)
    resp = {
        'success': True,
        "token": token.key
    }
    resp.update(seller_json(user))
    return JsonResponse(resp)


def get_user_details(request):
    return JsonResponse(seller_json(request.user))
