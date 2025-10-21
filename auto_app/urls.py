from django.urls import path, re_path
from auto_app.views import (
    app, search, create_vehicle, search_vehicles,
    sign_up, login, submit_contact, get_user_details,
    save_listing, saved_listings, account_listings, reset_password, delete_account,
    update_account, remove_saved_listing, remove_listing,
    related_listings, recommended_listings, latest_listings
)
from auto_app.views import image_upload

from auto_app.views.serializers import (
    VehicleViewSet, MakeViewSet, SellerViewSet, ModelViewSet, VehiclePhotoViewSet,
    FAQViewSet, CityViewSet
)


from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'vehicle', VehicleViewSet)
router.register(r'city', CityViewSet)
router.register(r'make', MakeViewSet)
router.register(r'seller', SellerViewSet)
router.register(r'model', ModelViewSet)
router.register(r'vehicle_photo', VehiclePhotoViewSet)
router.register(r'faq', FAQViewSet)

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
    path("api/upload-vehicle-image/", image_upload.upload_vehicle_image, name="upload-vehicle-image"),
]

urlpatterns += router.urls
