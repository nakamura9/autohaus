from django.http import JsonResponse
from django.apps import apps
from django.db.models import Q, Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
import json
import requests
from auto_app.models import (
    Vehicle, Make, Model, Seller, City, VehiclePhoto, ContactEntry,
    SavedListing, SavedSearch, Impression
)
from django.views.decorators.csrf import csrf_exempt
from auto_app.utils import base64_file, process_search
from auto_app.serializers import VehicleSerializer
from auto_app.utils.permissions import has_active_subscription


def get_client_ip(request):
    """Extract client IP from request headers"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_ip_location(ip_address):
    """
    Get geolocation data from IP address using ip-api.com (free service).
    Returns dict with city, region, country, country_code, lat, lon.
    """
    if ip_address in ('127.0.0.1', 'localhost', '::1'):
        return {
            'city': 'Local',
            'region': 'Local',
            'country': 'Local',
            'country_code': 'LO',
            'lat': None,
            'lon': None
        }

    try:
        response = requests.get(
            f'http://ip-api.com/json/{ip_address}',
            timeout=2
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                return {
                    'city': data.get('city', ''),
                    'region': data.get('regionName', ''),
                    'country': data.get('country', ''),
                    'country_code': data.get('countryCode', ''),
                    'lat': data.get('lat'),
                    'lon': data.get('lon')
                }
    except (requests.RequestException, ValueError):
        pass

    return {
        'city': '',
        'region': '',
        'country': '',
        'country_code': '',
        'lat': None,
        'lon': None
    }


def search(request, model=None):
    def extract_fields(m, ins):
        fields = m.search_map
        return dict(
            id=ins.pk,
            title=str(ins),
            **{k: str(getattr(ins, fields[k])) for k in fields.keys()}
        )

    klass = apps.get_model("auto_app", model)
    filters = Q()

    if request.GET.get("id"):
        qs = klass.objects.filter(id=request.GET['id'])
        if qs.exists():
            return JsonResponse({"results": [extract_fields(klass, qs.first())]})
        return JsonResponse({"results": []})

    for field in klass.search_fields:
        filters.add(Q(**{f"{field}__icontains": request.GET.get("q")}), Q.OR)

    if request.GET.get('filters'):
        filters.add(Q(**json.loads(request.GET.get('filters'))), Q.AND)

    qs = klass.objects.filter(filters)[:20]
    return JsonResponse({"results": [extract_fields(klass, res) for res in qs]})


def search_vehicles(request):
    results = process_search(request.GET)

    if not request.user.is_anonymous:
        saved_search, _ = SavedSearch.objects.get_or_create(user=request.user)
        json_string = saved_search.filters or """{"searches": []}"""
        search_list = json.loads(json_string)['searches']
        if len(search_list) > 9:
            search_list = search_list[1:]
        saved_search.filters = json.dumps({
            'searches': search_list + [dict(request.GET)]
        })
        saved_search.save()

    return JsonResponse(VehicleSerializer(results, many=True).data, safe=False)


@csrf_exempt
def create_vehicle(request):
    """
    Create or update a vehicle listing.
    Requires an active subscription to create new listings.
    """
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "POST required"}, status=405)

    # Check authentication
    if request.user.is_anonymous:
        return JsonResponse({
            "status": "error",
            "message": "Authentication required"
        }, status=401)

    # Check for active subscription
    if not has_active_subscription(request.user):
        return JsonResponse({
            "status": "error",
            "message": "Active subscription required to create listings. Please subscribe to continue."
        }, status=403)

    data = json.loads(request.body)

    # Get related objects
    if data.get('make'):
        data['make'] = Make.objects.get(pk=data['make'])
    if data.get('model'):
        data['model'] = Model.objects.get(pk=data['model'])
        data['year'] = data['model'].year
    if data.get('location'):
        data['city'] = City.objects.get(pk=data['location'])

    # Get or create seller - now properly linked to user
    seller = getattr(request.user, 'seller', None)

    if not seller:
        # User doesn't have a seller profile - this shouldn't happen with subscription flow
        # but handle it gracefully
        return JsonResponse({
            "status": "error",
            "message": "Seller profile not found. Please contact support."
        }, status=400)

    data['seller'] = seller

    # Handle images from request data
    images = data.get('images', [])

    if data.get('id'):
        # Updating existing vehicle
        try:
            vehicle = Vehicle.objects.get(pk=data['id'])

            # Verify ownership
            if vehicle.seller != seller and not request.user.is_superuser:
                return JsonResponse({
                    "status": "error",
                    "message": "You don't have permission to edit this listing"
                }, status=403)

            # If this was a temporary vehicle, update its status
            if vehicle.temporary:
                data['temporary'] = False

            # Update vehicle fields
            update_fields = ['make', 'model', 'price', 'mileage', 'transmission',
                           'fuel_type', 'drivetrain', 'engine', 'body_type',
                           'condition', 'description', 'negotiable', 'published',
                           'chassis_number', 'model_number', 'year', 'temporary']

            for field in update_fields:
                if field in data:
                    setattr(vehicle, field, data[field])

            if 'city' in data:
                vehicle.city = data['city']

            vehicle.save()

            # Handle deleted photos
            if images is not None:
                existing_photos = set(vehicle.photos.values_list('pk', flat=True))
                submitted_existing_photos = set([i['id'] for i in images if i.get('id')])
                ids_to_delete = existing_photos.difference(submitted_existing_photos)
                for photo_id in ids_to_delete:
                    VehiclePhoto.objects.filter(pk=photo_id).delete()

        except Vehicle.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "Vehicle not found"
            }, status=404)
    else:
        # Creating new vehicle
        vehicle = Vehicle.objects.create(
            make=data.get('make'),
            model=data.get('model'),
            seller=seller,
            price=data.get('price', 0),
            mileage=data.get('mileage', 0),
            city=data.get('city'),
            transmission=data.get('transmission', 'automatic'),
            fuel_type=data.get('fuel_type', 'petrol'),
            drivetrain=data.get('drivetrain', 'front_wheel_drive'),
            engine=data.get('engine', ''),
            year=data.get('year', 2000),
            body_type=data.get('body_type', 'sedan'),
            condition=data.get('condition', 'Good'),
            description=data.get('description', ''),
            negotiable=data.get('negotiable', False),
            published=data.get('published', False),
            created_by=request.user,
            updated_by=request.user
        )

    return JsonResponse({"status": "success", "id": vehicle.pk})


def submit_contact(request):
    if request.method == "POST":
        data = json.loads(request.body)
        contact = ContactEntry.objects.create(
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            message=data.get('message')
        )
        return JsonResponse({"id": contact.pk})
    else:
        return JsonResponse({"status": "error"})


@csrf_exempt
def update_account(request):
    """Update user account and seller profile details"""
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "POST required"}, status=405)

    if request.user.is_anonymous:
        return JsonResponse({"status": "error", "message": "Not authenticated"}, status=401)

    data = json.loads(request.body)
    user = request.user

    # Update user fields
    if data.get('first_name') is not None:
        user.first_name = data.get('first_name')
    if data.get('last_name') is not None:
        user.last_name = data.get('last_name')
    user.save()

    # Update seller profile if exists
    seller = getattr(user, 'seller', None)
    if seller:
        if data.get('whatsapp') is not None:
            seller.whatsapp = data.get('whatsapp')
        if data.get('recovery_email') is not None:
            seller.recovery_email = data.get('recovery_email')
        if data.get('phone') is not None:
            seller.phone_number = data.get('phone')
        if data.get('country') is not None:
            seller.country = data.get('country')
        if data.get('city') is not None:
            seller.city_id = data.get('city')

        # Handle photo upload
        if data.get('photo'):
            photo_data = data.get('photo')
            if isinstance(photo_data, dict) and photo_data.get('src'):
                file_obj, _ = base64_file(photo_data.get('src'))
                if file_obj:
                    seller.photo = file_obj

        seller.save()

    return JsonResponse({
        "status": "success",
        "user": {
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
    })


@csrf_exempt
def delete_account(request):
    """Deactivate user account (soft delete)"""
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "POST required"}, status=405)

    if request.user.is_anonymous:
        return JsonResponse({"status": "error", "message": "Not authenticated"}, status=401)

    # Confirm deletion with password
    data = json.loads(request.body)
    password = data.get('password')

    if not password:
        return JsonResponse({
            "status": "error",
            "message": "Password required to confirm account deletion"
        }, status=400)

    if not request.user.check_password(password):
        return JsonResponse({
            "status": "error",
            "message": "Incorrect password"
        }, status=400)

    # Soft delete - deactivate account
    user = request.user
    user.is_active = False
    user.save()

    # Revoke CMS access if seller exists
    seller = getattr(user, 'seller', None)
    if seller:
        seller.is_cms_user = False
        seller.save()

    return JsonResponse({
        "status": "success",
        "message": "Account has been deactivated"
    })


@csrf_exempt
def reset_password(request):
    """Reset user password"""
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "POST required"}, status=405)

    if request.user.is_anonymous:
        return JsonResponse({"status": "error", "message": "Not authenticated"}, status=401)

    data = json.loads(request.body)
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not current_password or not new_password:
        return JsonResponse({
            "status": "error",
            "message": "Current password and new password are required"
        }, status=400)

    # Verify current password
    if not request.user.check_password(current_password):
        return JsonResponse({
            "status": "error",
            "message": "Current password is incorrect"
        }, status=400)

    # Validate new password
    if len(new_password) < 8:
        return JsonResponse({
            "status": "error",
            "message": "New password must be at least 8 characters long"
        }, status=400)

    # Set new password
    request.user.set_password(new_password)
    request.user.save()

    return JsonResponse({
        "status": "success",
        "message": "Password updated successfully"
    })


def account_listings(request):
    """Get listings for the authenticated user"""
    if request.user.is_anonymous:
        return JsonResponse([], safe=False)

    seller = getattr(request.user, 'seller', None)
    if not seller:
        return JsonResponse([], safe=False)

    vehicles = Vehicle.objects.filter(seller=seller)
    return JsonResponse(VehicleSerializer(vehicles, many=True).data, safe=False)


@csrf_exempt
def save_listing(request):
    """Save a listing to user's favorites"""
    if request.method != "POST":
        return JsonResponse({"status": "error"}, status=405)

    if request.user.is_anonymous:
        return JsonResponse({"status": "error", "message": "Not authenticated"}, status=401)

    data = json.loads(request.body)
    try:
        vehicle = Vehicle.objects.get(pk=data['vehicle'])
    except Vehicle.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Vehicle not found"}, status=404)

    if SavedListing.objects.filter(user=request.user, vehicle=vehicle).exists():
        return JsonResponse({"status": "success", "message": "Already saved"})

    SavedListing.objects.create(user=request.user, vehicle=vehicle)
    return JsonResponse({"status": "success"})


def saved_listings(request):
    """Get user's saved listings"""
    if request.user.is_anonymous:
        return JsonResponse([], safe=False)

    saved = SavedListing.objects.filter(user=request.user)
    vehicles = [s.vehicle for s in saved]
    return JsonResponse(VehicleSerializer(vehicles, many=True).data, safe=False)


@csrf_exempt
def remove_saved_listing(request, id=None):
    """Remove a listing from user's favorites"""
    if request.method != "POST":
        return JsonResponse({"status": "error"}, status=405)

    if request.user.is_anonymous:
        return JsonResponse({"status": "error", "message": "Not authenticated"}, status=401)

    try:
        saved = SavedListing.objects.get(pk=id, user=request.user)
        saved.delete()
        return JsonResponse({"status": "success"})
    except SavedListing.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Not found"}, status=404)


@csrf_exempt
def remove_listing(request, id=None):
    """Delete a vehicle listing"""
    if request.method != "POST":
        return JsonResponse({"status": "error"}, status=405)

    if request.user.is_anonymous:
        return JsonResponse({"status": "error", "message": "Not authenticated"}, status=401)

    try:
        vehicle = Vehicle.objects.get(pk=id)

        # Verify ownership
        seller = getattr(request.user, 'seller', None)
        if vehicle.seller != seller and not request.user.is_superuser:
            return JsonResponse({
                "status": "error",
                "message": "You don't have permission to delete this listing"
            }, status=403)

        vehicle.delete()
        return JsonResponse({"status": "success"})
    except Vehicle.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Vehicle not found"}, status=404)


def related_listings(request, id=None):
    """Get related listings for a vehicle"""
    try:
        vehicle = Vehicle.objects.get(pk=id)
        return JsonResponse(VehicleSerializer(vehicle.related_listings(), many=True).data, safe=False)
    except Vehicle.DoesNotExist:
        return JsonResponse([], safe=False)


def latest_listings(request, id=None):
    """Get latest vehicle listings"""
    vehicles = Vehicle.objects.filter(published=True).order_by("-created_at")[:10]
    return JsonResponse(VehicleSerializer(vehicles, many=True).data, safe=False)


def recommended_listings(request):
    """Get recommended listings based on user's saved searches and listings"""
    user = request.user
    if not user.is_authenticated:
        return JsonResponse([], safe=False)

    saved_vehicles = SavedListing.objects.filter(user=user)
    recommended_vehicle_ids = []

    for saved_vehicle in saved_vehicles:
        recommended_vehicle_ids.extend([v.pk for v in saved_vehicle.vehicle.related_listings()])

    saved_searches = SavedSearch.objects.filter(user=user).first()
    if saved_searches and saved_searches.filters:
        try:
            searches = json.loads(saved_searches.filters).get('searches', [])
            for saved_search in searches:
                recommended_vehicle_ids.extend([v.pk for v in process_search(saved_search)])
        except (json.JSONDecodeError, TypeError):
            pass

    unique_pks = set(recommended_vehicle_ids)
    vehicles = Vehicle.objects.filter(pk__in=list(unique_pks)[:10])

    return JsonResponse(VehicleSerializer(vehicles, many=True).data, safe=False)


@csrf_exempt
def record_impression(request):
    """
    Record a page view impression for a vehicle.
    This endpoint is public and does not require authentication.
    """
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "POST required"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)

    vehicle_id = data.get('vehicle_id')
    if not vehicle_id:
        return JsonResponse({"status": "error", "message": "vehicle_id required"}, status=400)

    try:
        vehicle = Vehicle.objects.get(pk=vehicle_id)
    except Vehicle.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Vehicle not found"}, status=404)

    # Get client IP and location
    ip_address = get_client_ip(request)
    location = get_ip_location(ip_address)

    # Create impression record
    Impression.objects.create(
        vehicle=vehicle,
        ip_address=ip_address,
        city=location.get('city', ''),
        region=location.get('region', ''),
        country=location.get('country', ''),
        country_code=location.get('country_code', ''),
        latitude=location.get('lat'),
        longitude=location.get('lon'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        referrer=data.get('referrer', ''),
        session_id=data.get('session_id', '')
    )

    return JsonResponse({"status": "success"})


def impression_stats(request):
    """
    Get impression statistics for the authenticated dealer's vehicles.
    Returns aggregated statistics including:
    - Total impressions
    - Unique visitors (by IP)
    - Impressions by location
    - Impressions over time
    - Top viewed vehicles
    """
    if request.user.is_anonymous:
        return JsonResponse({"status": "error", "message": "Authentication required"}, status=401)

    seller = getattr(request.user, 'seller', None)
    if not seller:
        return JsonResponse({"status": "error", "message": "Seller profile not found"}, status=404)

    # Get time range from query params (default: last 30 days)
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)

    # Check if user is admin to see all impressions
    is_admin = seller.role and seller.role.role_name == "Admin"

    # Filter impressions based on user role
    if is_admin:
        base_queryset = Impression.objects.filter(created_at__gte=start_date)
        vehicles_queryset = Vehicle.objects.all()
    else:
        base_queryset = Impression.objects.filter(
            vehicle__seller=seller,
            created_at__gte=start_date
        )
        vehicles_queryset = Vehicle.objects.filter(seller=seller)

    # Total impressions
    total_impressions = base_queryset.count()

    # Unique visitors
    unique_visitors = base_queryset.values('ip_address').distinct().count()

    # Impressions by city (primary grouping for single-country focus)
    by_city = list(
        base_queryset
        .exclude(city='')
        .values('city', 'region')
        .annotate(count=Count('id'))
        .order_by('-count')[:10]
    )

    # Impressions over time (daily)
    by_date = list(
        base_queryset
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('date')
    )
    # Convert dates to strings for JSON serialization
    for item in by_date:
        item['date'] = item['date'].isoformat() if item['date'] else None

    # Top viewed vehicles
    top_vehicles = list(
        base_queryset
        .values('vehicle__id', 'vehicle__model__name', 'vehicle__make__name', 'vehicle__year')
        .annotate(count=Count('id'))
        .order_by('-count')[:10]
    )
    # Format vehicle data
    top_vehicles_formatted = [
        {
            'id': v['vehicle__id'],
            'name': f"{v['vehicle__make__name']} {v['vehicle__model__name']} ({v['vehicle__year']})",
            'impressions': v['count']
        }
        for v in top_vehicles
    ]

    # Recent impressions list (last 50)
    recent_impressions = list(
        base_queryset
        .select_related('vehicle', 'vehicle__make', 'vehicle__model')
        .order_by('-created_at')[:50]
        .values(
            'id', 'ip_address', 'city', 'country', 'country_code',
            'created_at', 'vehicle__id', 'vehicle__model__name',
            'vehicle__make__name', 'vehicle__year'
        )
    )
    # Format for JSON
    for imp in recent_impressions:
        imp['created_at'] = imp['created_at'].isoformat() if imp['created_at'] else None
        imp['vehicle_name'] = f"{imp['vehicle__make__name']} {imp['vehicle__model__name']} ({imp['vehicle__year']})"

    return JsonResponse({
        "status": "success",
        "is_admin": is_admin,
        "period_days": days,
        "total_impressions": total_impressions,
        "unique_visitors": unique_visitors,
        "by_city": by_city,
        "by_date": by_date,
        "top_vehicles": top_vehicles_formatted,
        "recent_impressions": recent_impressions
    })
