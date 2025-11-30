from rest_framework.permissions import BasePermission
import re
from auto_app.models import RolePermission
from django.contrib.auth.models import ContentType


def has_active_subscription(user):
    """Check if user has an active subscription"""
    if user.is_superuser:
        return True
    seller = getattr(user, 'seller', None)
    if not seller:
        return False
    return seller.has_active_subscription()


class ActiveSubscriptionRequired(BasePermission):
    """Permission class that requires an active subscription"""
    message = 'You need an active subscription to perform this action.'

    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser:
            return True
        return has_active_subscription(request.user)


class WritePermission(BasePermission):
    """Permission class for create/update operations"""
    message = 'You do not have permission to create/update this resource.'

    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser:
            return True

        re_match = re.match(r"/api/cms/(?P<action>[a-z]+)/(?P<model>[a-z]+)/", request.path)
        if re_match:
            action = re_match.group("action")
            if action not in ["create", "update"]:
                return False
            model = re_match.group("model")

            # Check if user has seller and role
            if not hasattr(request.user, 'seller') or not request.user.seller.role:
                return False

            # Check for active subscription for write operations
            if not has_active_subscription(request.user):
                self.message = 'You need an active subscription to create or update content.'
                return False

            user_role = request.user.seller.role
            try:
                permissions = RolePermission.objects.filter(
                    can_write=True,
                    entity=ContentType.objects.get(app_label='auto_app', model=model),
                    role=user_role
                )
                return permissions.exists()
            except ContentType.DoesNotExist:
                return False
        return True


class ReadPermission(BasePermission):
    """Permission class for read/list operations"""
    message = 'You do not have permission to view/retrieve this resource.'

    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser:
            return True

        re_match = re.match(r"/api/cms/list/(?P<model>[a-z]+)/$", request.path)
        if re_match:
            model = re_match.group("model")

            if model == "auditlog":
                return True

            # Check if user has seller and role
            if not hasattr(request.user, 'seller') or not request.user.seller.role:
                return False

            user_role = request.user.seller.role
            try:
                permissions = RolePermission.objects.filter(
                    can_read=True,
                    entity=ContentType.objects.get(app_label='auto_app', model=model),
                    role=user_role
                )
                return permissions.exists()
            except ContentType.DoesNotExist:
                return False
        return True


class DeletePermission(BasePermission):
    """Permission class for delete operations"""
    message = 'You do not have permission to delete this resource.'

    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser:
            return True

        re_match = re.match(r"/api/cms/delete/(?P<model>[a-z]+)/", request.path)
        if re_match:
            model = re_match.group("model")

            # Check if user has seller and role
            if not hasattr(request.user, 'seller') or not request.user.seller.role:
                return False

            # Check for active subscription for delete operations
            if not has_active_subscription(request.user):
                self.message = 'You need an active subscription to delete content.'
                return False

            user_role = request.user.seller.role
            try:
                permissions = RolePermission.objects.filter(
                    can_delete=True,
                    entity=ContentType.objects.get(app_label='auto_app', model=model),
                    role=user_role
                )
                return permissions.exists()
            except ContentType.DoesNotExist:
                return False
        return True


class OwnerPermission(BasePermission):
    """Permission class for owner-based access control"""
    message = 'You do not have permission as you are not the owner of this resource.'

    # Configure which models support owner-based permissions
    OWNER_ENABLED_MODELS = {
        'vehicle': 'seller__user',
        'seller': 'user',
    }

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        model_name = obj._meta.model_name.lower()

        if model_name not in self.OWNER_ENABLED_MODELS:
            return True

        owner_field = self.OWNER_ENABLED_MODELS[model_name]

        # Handle nested lookups like 'seller__user'
        if '__' in owner_field:
            fields = owner_field.split('__')
            owner = obj
            for field in fields:
                owner = getattr(owner, field, None)
                if owner is None:
                    return False
        else:
            owner = getattr(obj, owner_field, None)

        return owner == request.user


class OwnerOrAdminFilterMixin:
    """
    Mixin to filter querysets to show only objects owned by the current user
    or all objects if the user is a superuser/administrator.
    """

    OWNER_ENABLED_MODELS = {
        'vehicle': 'created_by',
        'seller': 'user',
    }

    def filter_queryset_by_owner(self, queryset, user, model_name):
        """Filter a queryset based on ownership rules"""
        if user.is_superuser:
            return queryset
        if model_name == "AuditLog":
            return queryset

        model_name_lower = model_name.lower()

        if model_name_lower not in self.OWNER_ENABLED_MODELS:
            return queryset

        owner_field = self.OWNER_ENABLED_MODELS[model_name_lower]
        return queryset.filter(**{owner_field: user})
