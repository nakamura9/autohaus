from django.shortcuts import render
from auto_app.views.api import search, create_vehicle, search_vehicles
# Create your views here.

def app(request):
    return render(request,'index.html')