from django.urls import path
from auto_app.views import app, search, create_vehicle, search_vehicles
from auto_app.views.serializers import VehicleViewSet, MakeViewSet, SellerViewSet, ModelViewSet, VehiclePhotoViewSet


from rest_framework.routers import DefaultRouter

vehicle_router = DefaultRouter()
vehicle_router.register(r'vehicle', VehicleViewSet)
make_router = DefaultRouter()
make_router.register(r'make', MakeViewSet)
seller_router = DefaultRouter()
seller_router.register(r'seller', SellerViewSet)
model_router = DefaultRouter()
model_router.register(r'model', ModelViewSet)
vehicle_photo_router = DefaultRouter()
vehicle_photo_router.register(r'vehicle_photo', VehiclePhotoViewSet)

urlpatterns = [
    path("", app, name="app"),
    path("api/search/<str:model>/", search, name="search"),
    path("api/create-vehicle/", create_vehicle, name="create-vehicle"),
    path("api/search-vehicles/", search_vehicles, name="search-vehicles"),
]

urlpatterns += vehicle_router.urls
urlpatterns += make_router.urls
urlpatterns += seller_router.urls
urlpatterns += model_router.urls
urlpatterns += vehicle_photo_router.urls
