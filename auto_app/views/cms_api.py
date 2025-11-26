from rest_framework.views import APIView
from rest_framework.response import Response
from django.apps import apps
from django.db import models
from django.core.paginator import Paginator
from auto_app.cms_forms import JSONToModelParser
import json
from auto_app.utils.permissions import (
    ReadPermission, WritePermission, DeletePermission, OwnerPermission,
    OwnerOrAdminFilterMixin
)
from auto_app.models import AuditLog, CMSImage, Vehicle
from django.contrib.contenttypes.models import ContentType
from auto_app.models import RolePermission


class CMSListView(OwnerOrAdminFilterMixin, APIView):
    """List view for CMS entities with pagination and filtering"""
    page_size = 20
    permission_classes = [ReadPermission]

    def get(self, request, entity, format=None):
        model = apps.get_model("auto_app", entity)

        page_no = request.GET.get('page', 1)
        filters_string = request.GET.get('filters', "{}")
        filters = json.loads(filters_string)
        objects = model.objects.all()

        # Apply owner-based filtering for configured models
        objects = self.filter_queryset_by_owner(objects, request.user, entity)

        if filters:
            for fieldname, value in filters.items():
                if hasattr(model, fieldname) and value:
                    field = model._meta.get_field(fieldname)
                    if isinstance(field, models.fields.related.ForeignKey):
                        objects = objects.filter(**{fieldname + "__id": value})
                    elif (
                            isinstance(field, models.fields.TextField) or
                            isinstance(field, models.fields.CharField)
                        ):
                        objects = objects.filter(**{fieldname + "__icontains": value})
                    else:
                        objects = objects.filter(**{fieldname: value})
        if hasattr(model, 'updated_at'):
            objects = objects.order_by("-updated_at")
        paginator = Paginator(objects, self.page_size)
        page = paginator.page(page_no)
        page.start_index()

        return Response({
            "schema": model.list_field_schema(),
            "name": model._meta.verbose_name.title(),
            "data": [e.list_json() for e in page.object_list],
            "page": page_no,
            "count": objects.count(),
            "page_start": page.start_index(),
            "page_end": page.end_index(),
            "page_size": self.page_size,
            "page_count": paginator.num_pages,
        })


class CMSCreateView(APIView):
    """Create view for CMS entities"""
    permission_classes = [WritePermission]

    def get(self, request, entity, format=None):
        model = apps.get_model("auto_app", entity)
        fields = model.form_fields()
        return Response(fields)

    def post(self, request, entity, format=None):
        model = apps.get_model("auto_app", entity)
        parser = JSONToModelParser(model, request.data, user=request.user)
        instance = parser.save()
        AuditLog.objects.create(
            title="%s created %s %s" % (request.user, instance._meta.verbose_name, instance),
            changes="{}",
            model_name=ContentType.objects.get_for_model(model),
            model_id=instance.pk,
            created_by=request.user,
            updated_by=request.user
        )
        return Response({
            "success": True,
            "id": instance.pk
        })


class PhotoUploadView(APIView):
    """Upload photos for CMS"""
    permission_classes = [WritePermission]

    def post(self, request, entity, format=None):
        uploaded_file = request.FILES.get('file')

        # For vehicle photos, create a temporary VehiclePhoto without linking to a vehicle yet
        if entity.lower() == 'vehiclephoto':
            from auto_app.models import VehiclePhoto
            vehicle_photo = VehiclePhoto.objects.create(
                photo=uploaded_file,
                vehicle=None  # Will be linked when the Vehicle is saved
            )
            return Response({
                "success": True,
                "file_path": vehicle_photo.photo.name,
                "file_url": vehicle_photo.photo.url,
            })

        # For other entities, use CMSImage
        cms_image = CMSImage.objects.create(
            image=uploaded_file,
            width=128,  # default width
            height=96   # default height
        )

        return Response({
            "success": True,
            "file_path": cms_image.image.name,
            "file_url": cms_image.image.url,
        })


class PhotoDeleteView(APIView):
    """Delete photos from CMS"""
    permission_classes = [WritePermission]

    def post(self, request, format=None):
        image_url = request.data.get('image_name', "")
        image_name = image_url.split("/")[-1] if image_url else ""
        image = CMSImage.objects.filter(
            image__endswith=image_name
        )

        if image.exists():
            image = image.first()
            image.delete()

            return Response({
                "success": True
            })
        return Response({
            "success": False,
            "error": "Image not found"
        })


class CMSUpdateView(OwnerOrAdminFilterMixin, APIView):
    """Update view for CMS entities"""
    permission_classes = [WritePermission, OwnerPermission]

    def get(self, request, entity, id, format=None):
        print(entity)
        model = apps.get_model("auto_app", entity)
        fields = model.form_fields()

        # Apply owner-based filtering for configured models
        queryset = model.objects.filter(pk=id)
        queryset = self.filter_queryset_by_owner(queryset, request.user, entity)

        if not queryset.exists():
            return Response({
                "success": False,
                "error": "Entity with id %s does not exist or you don't have permission to access it" % id
            })
        instance = queryset.first()
        data = instance.detail_json()
        return Response(dict(**fields, data=data, success=True))

    def post(self, request, entity, id, format=None):
        model = apps.get_model("auto_app", entity)

        # Apply owner-based filtering for configured models
        queryset = model.objects.filter(pk=id)
        queryset = self.filter_queryset_by_owner(queryset, request.user, entity)

        if not queryset.exists():
            return Response({
                "success": False,
                "error": "Entity with id %s does not exist or you don't have permission to access it" % id
            })
        instance = queryset.first()
        db_values = model.objects.filter(pk=id).values()[0]
        parser = JSONToModelParser(model, request.data, user=request.user, instance=instance)
        instance = parser.save()
        changes = {}

        for k, v in db_values.items():
            if k in ['created_at', 'updated_at', 'updated_by_id', 'created_by_id']:
                continue
            if getattr(instance, k) != v:
                changes[k] = [str(getattr(instance, k)), str(v)]
        if len(changes.keys()) > 0:
            AuditLog.objects.create(
                title="%s updated %s %s" % (request.user, instance._meta.verbose_name, instance),
                changes=json.dumps(changes),
                model_name=ContentType.objects.get_for_model(model),
                model_id=instance.pk,
                created_by=request.user,
                updated_by=request.user
            )
        return Response({
            "success": True,
            "id": instance.pk
        })


class CMSDeleteView(OwnerOrAdminFilterMixin, APIView):
    """Delete view for CMS entities"""
    permission_classes = [DeletePermission, OwnerPermission]

    def post(self, request, entity, id, format=None):
        model = apps.get_model("auto_app", entity)

        # Apply owner-based filtering for configured models
        queryset = model.objects.filter(pk=id)
        queryset = self.filter_queryset_by_owner(queryset, request.user, entity)

        if not queryset.exists():
            return Response({
                "success": False,
                "error": "Entity with id %s does not exist or you don't have permission to delete it" % id
            })
        instance = queryset.first()
        AuditLog.objects.create(
            title="%s deleted %s %s" % (request.user, instance._meta.verbose_name, instance),
            changes="{}",
            model_name=ContentType.objects.get_for_model(model),
            model_id=instance.pk,
            created_by=request.user,
            updated_by=request.user
        )

        instance.delete()

        return Response({
            "success": True,
        })


class AuditTrailView(APIView):
    """View audit trail for an entity"""
    def get(self, request, entity, id):
        model = apps.get_model("auto_app", entity)
        logs = AuditLog.objects.filter(
            model_name=ContentType.objects.get_for_model(model),
            model_id=id
        ).order_by('-created_at')

        log_data = []
        for log in logs:
            log_data.append({
                'id': log.id,
                'title': log.title,
                'changes': log.changes,
                'created_at': log.created_at.isoformat() if log.created_at else None,
                'created_by': log.created_by.username if log.created_by else None,
            })

        return Response({
            "success": True,
            "logs": log_data
        })


class CurrentUserRolePermissionsView(APIView):
    """Get current user's role and permissions"""
    def get(self, request):
        if request.user.is_anonymous:
            return Response({
                "success": False,
                "error": "Authentication required"
            }, status=401)

        # Superusers have all permissions
        if request.user.is_superuser:
            # Get all models in auto_app
            from django.contrib.contenttypes.models import ContentType
            all_models = ContentType.objects.filter(app_label='auto_app')
            permissions = [
                {
                    "entity": ct.model,
                    "can_read": True,
                    "can_write": True,
                    "can_delete": True,
                }
                for ct in all_models
            ]
            return Response({
                "success": True,
                "role": "Superuser",
                "permissions": permissions,
            })

        account = getattr(request.user, "account", None)
        if account is None or account.role is None:
            return Response({
                "success": True,
                "role": None,
                "permissions": []
            })

        role = account.role
        permissions_qs = RolePermission.objects.filter(role=role).select_related("entity")

        permissions = [
            {
                "entity": perm.entity.model,
                "can_read": perm.can_read,
                "can_write": perm.can_write,
                "can_delete": perm.can_delete,
            }
            for perm in permissions_qs
        ]

        return Response({
            "success": True,
            "role": role.role_name,
            "permissions": permissions,
        })


class DashboardAPIView(APIView):
    """Dashboard statistics"""
    def get(self, request):
        from auto_app.models import Vehicle, Seller, SavedListing, Make, Model as VehicleModel
        from django.db.models import Count
        from datetime import datetime, timedelta

        # Basic stats
        stats = {
            'total_vehicles': Vehicle.objects.count(),
            'published_vehicles': Vehicle.objects.filter(published=True).count(),
            'total_sellers': Seller.objects.count(),
            'total_dealers': Seller.objects.filter(is_dealer=True).count(),
            'total_saved_listings': SavedListing.objects.count(),
            'total_makes': Make.objects.count(),
            'total_models': VehicleModel.objects.count(),
        }

        # Recent changes
        recent_logs = AuditLog.objects.all().order_by('-created_at')[:10]
        stats['recent_changes'] = [{
            'title': log.title,
            'created_at': log.created_at.isoformat() if log.created_at else None,
        } for log in recent_logs]

        # Vehicles by make (top 10)
        vehicles_by_make = Vehicle.objects.values('make__name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        stats['vehicles_by_make'] = list(vehicles_by_make)

        # Recent vehicles (last 7 days)
        seven_days_ago = datetime.now() - timedelta(days=7)
        stats['recent_vehicles'] = Vehicle.objects.filter(
            created_at__gte=seven_days_ago
        ).count()

        return Response(stats)


class SearchInputView(APIView):
    """Autocomplete search for foreign key fields - CMS Widget"""
    def get(self, request):
        from django.http import JsonResponse

        model_name = request.GET.get('model')
        query = request.GET.get('q', '')
        id_param = request.GET.get('id', None)

        if not model_name:
            return JsonResponse([], safe=False)

        try:
            model = apps.get_model("auto_app", model_name)
        except LookupError:
            return JsonResponse([], safe=False)

        # If ID is provided, fetch that specific record
        if id_param:
            results = model.objects.filter(id=id_param)
        else:
            # Try to search by 'name' field if it exists
            if hasattr(model, 'name'):
                if len(query) > 0:
                    results = model.objects.filter(name__icontains=query)[:10]
                else:
                    if hasattr(model, 'updated_at'):
                        results = model.objects.all().order_by("-updated_at")[:10]
                    else:
                        results = model.objects.all()[:10]
            else:
                # For models without 'name' field, search text fields
                if len(query) > 0:
                    from django.db.models import Q, CharField, TextField
                    text_fields = [f.name for f in model._meta.get_fields()
                                 if isinstance(f, (CharField, TextField))]
                    if text_fields:
                        q_objects = Q()
                        for field in text_fields[:3]:  # Limit to first 3 text fields
                            q_objects |= Q(**{f"{field}__icontains": query})
                        results = model.objects.filter(q_objects)[:10]
                    else:
                        results = model.objects.all()[:10]
                else:
                    if hasattr(model, 'updated_at'):
                        results = model.objects.all().order_by("-updated_at")[:10]
                    else:
                        results = model.objects.all()[:10]

        # Format results - return simple list with 'name' and 'id' keys (scaffold format)
        data = []
        for result in results:
            if hasattr(result, 'name'):
                name = result.name
            else:
                name = str(result)

            data.append({'name': name, 'id': result.id})

        return JsonResponse(data, safe=False)
