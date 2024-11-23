from rest_framework import viewsets
from auto_app.serializers import (
    VehicleSerializer, MakeSerializer, VehiclePhotoSerializer,
    ModelSerializer , SellerSerializer
)

from auto_app.models import Vehicle, Make, VehiclePhoto, Model, Seller


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer


class MakeViewSet(viewsets.ModelViewSet):
    queryset = Make.objects.all()
    serializer_class = MakeSerializer


class VehiclePhotoViewSet(viewsets.ModelViewSet):
    queryset = VehiclePhoto.objects.all()
    serializer_class = VehiclePhotoSerializer


class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer


class SellerViewSet(viewsets.ModelViewSet):
    queryset = Seller.objects.all()
    serializer_class = SellerSerializer
