from django.urls import path, re_path
from auto_app.views import (
    app, search, create_vehicle, search_vehicles,
    sign_up, login, submit_contact, get_user_details,
    save_listing, saved_listings, account_listings, reset_password, delete_account,
    update_account, remove_saved_listing, remove_listing,
    related_listings, recommended_listings, latest_listings
)
from auto_app.views.serializers import (
    VehicleViewSet, MakeViewSet, SellerViewSet, ModelViewSet, VehiclePhotoViewSet,
    FAQViewSet, CityViewSet
)


from rest_framework.routers import DefaultRouter

vehicle_router = DefaultRouter()
vehicle_router.register(r'vehicle', VehicleViewSet)
city_router = DefaultRouter()
city_router.register(r'city', CityViewSet)
make_router = DefaultRouter()
make_router.register(r'make', MakeViewSet)
seller_router = DefaultRouter()
seller_router.register(r'seller', SellerViewSet)
model_router = DefaultRouter()
model_router.register(r'model', ModelViewSet)
vehicle_photo_router = DefaultRouter()
vehicle_photo_router.register(r'vehicle_photo', VehiclePhotoViewSet)
faq_router = DefaultRouter()
faq_router.register(r'faq', FAQViewSet)

urlpatterns = [
    path("", app, name="app"),
    path("buy", app, name="app"),
    path("sell", app, name="app"),
    path("about", app, name="app"),
    path("faq", app, name="app"),
    path("contact", app, name="app"),
    re_path(r"product/*", app, name="app"),
    path("api/search/<str:model>/", search, name="search"),
    path("api/create-vehicle/", create_vehicle, name="create-vehicle"),
    path("api/search-vehicles/", search_vehicles, name="search-vehicles"),
    path("api/sign-up/", sign_up, name="sign-up"),
    path("api/user-details/", get_user_details, name="user-details"),
    path("api/update-account/", update_account, name="update-account"),
    path("api/account-listings/", account_listings, name="my-listings"),
    path("api/related-listings/<int:id>/", related_listings, name="related-listings"),
    path("api/recommended-listings/", recommended_listings, name="recommended-listings"),
    path("api/latest-listings/", latest_listings, name="latest-listings"),
    path("api/save-listing/", save_listing, name="save-listing"),
    path(
        "api/saved-listings/delete/<int:id>/",
        remove_saved_listing,
        name="delete-saved-listing"
    ),
    path(
        "api/listings/delete/<int:id>/",
        remove_listing,
        name="delete-listing"
    ),
    path("api/saved-listings/", saved_listings, name="saved-listings"),
    path("api/submit-contact/", submit_contact, name="submit-contact"),
    path("api/login/", login, name="log-in"),
]

urlpatterns += vehicle_router.urls
urlpatterns += make_router.urls
urlpatterns += seller_router.urls
urlpatterns += model_router.urls
urlpatterns += vehicle_photo_router.urls
urlpatterns += faq_router.urls
urlpatterns += city_router.urls
