from django.shortcuts import render
from auto_app.views.api import search
# Create your views here.

def app(request):
    return render(request,'index.html')