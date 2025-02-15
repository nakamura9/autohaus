from rest_framework import viewsets
from auto_app.serializers import (
    VehicleSerializer, MakeSerializer, VehiclePhotoSerializer,
    ModelSerializer , SellerSerializer, FAQCategorySerializer,
    CitySerializer
)
import django_filters 
from auto_app.models import (
    Vehicle, Make, VehiclePhoto, Model, Seller, FAQCategory,
    City
)


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer


class MakeViewSet(viewsets.ModelViewSet):
    queryset = Make.objects.all()
    serializer_class = MakeSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filterset_fields = ['name']
    search_fields = ['name']

class VehiclePhotoViewSet(viewsets.ModelViewSet):
    queryset = VehiclePhoto.objects.all()
    serializer_class = VehiclePhotoSerializer

class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer


class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filterset_fields = ['name', 'transmission', 'engine', 'fuel_type', 'drivetrain', 'engine']
    search_fields = ['name']


class SellerViewSet(viewsets.ModelViewSet):
    queryset = Seller.objects.all()
    serializer_class = SellerSerializer


class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQCategory.objects.all()
    serializer_class = FAQCategorySerializer
