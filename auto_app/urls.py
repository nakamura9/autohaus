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

# CMS Views
from auto_app.views.cms_api import (
    CMSListView, CMSCreateView, CMSUpdateView, CMSDeleteView,
    AuditTrailView, CurrentUserRolePermissionsView, DashboardAPIView,
    SearchInputView, PhotoUploadView, PhotoDeleteView
)

# Authentication Views
from auto_app.views.auth_views import LoginView, SignUpView, CurrentUserView
from rest_framework_simplejwt.views import TokenRefreshView


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
    path("cms/", app, name="app"),
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

    # JWT Authentication
    path("api/auth/login/", LoginView.as_view(), name="jwt-login"),
    path("api/auth/signup/", SignUpView.as_view(), name="jwt-signup"),
    path("api/auth/current-user/", CurrentUserView.as_view(), name="current-user"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # CMS Operations
    path("api/cms/list/<str:entity>/", CMSListView.as_view(), name="cms-list"),
    path("api/cms/create/<str:entity>/", CMSCreateView.as_view(), name="cms-create"),
    path("api/cms/update/<str:entity>/<int:id>/", CMSUpdateView.as_view(), name="cms-update"),
    path("api/cms/delete/<str:entity>/<int:id>/", CMSDeleteView.as_view(), name="cms-delete"),
    path("api/cms/audit-trail/<str:entity>/<int:id>/", AuditTrailView.as_view(), name="cms-audit-trail"),
    path("api/cms/current-user-permissions/", CurrentUserRolePermissionsView.as_view(), name="cms-permissions"),
    path("api/cms/dashboard-stats/", DashboardAPIView.as_view(), name="cms-dashboard"),

    # CMS Utilities
    path("api/cms/search-input/", SearchInputView.as_view(), name="cms-search-input"),
    path("api/cms/photo-upload/<str:entity>/", PhotoUploadView.as_view(), name="cms-photo-upload"),
    path("api/cms/photo-delete/", PhotoDeleteView.as_view(), name="cms-photo-delete"),
]

urlpatterns += router.urls
