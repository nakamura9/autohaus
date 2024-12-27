from django.shortcuts import render
from auto_app.views.api import search, create_vehicle, search_vehicles, submit_contact
from auto_app.forms import SignUpForm, LoginForm
from django.http import JsonResponse
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.models import User
from auto_app.models import Seller

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

    return JsonResponse({'success': True, 'id': seller.pk})


def login(request):
    form = LoginForm(request.POST)
    if not form.is_valid():
        return JsonResponse({'success': False, 'errors': form.errors})

    user = authenticate(username=form.cleaned_data.get('email'), password=form.cleaned_data.get('password'))
    return JsonResponse({
        'success': True,
        'user': {
            'id': user.pk,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.seller.phone_number,
            'country': user.seller.country,
            'city': user.seller.city,
        }
    })
