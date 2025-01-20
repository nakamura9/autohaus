from django.http import JsonResponse
from django.apps import apps
from django.db.models import Q
import json
from auto_app.models import (
    Vehicle, Make, Model, Seller, City, VehiclePhoto, Vehicle, ContactEntry,
    SavedListing
)
from django.views.decorators.csrf import csrf_exempt
import copy
from auto_app.utils import base64_file
from auto_app.serializers import VehicleSerializer


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
    filters = Q()
    if request.GET.get('make'):
        filters.add(Q(make__id=request.GET.get('make')), Q.AND)

    if request.GET.get('model'):
        filters.add(Q(model__id=request.GET.get('model')), Q.AND)

    if request.GET.get('transmission'):
        filters.add(Q(transmission__iexact=request.GET.get('transmission')), Q.AND)

    if request.GET.get('drivetrain'):
        filters.add(Q(drivetrain__iexact=request.GET.get('drivetrain')), Q.AND)

    if request.GET.get('fuel_type'):
        filters.add(Q(fuel_type__iexact=request.GET.get('fuel_type')), Q.AND)

    if request.GET.get('min_year'):
        filters.add(Q(year__gte=request.GET.get('min_year')), Q.AND)

    if request.GET.get('max_year'):
        filters.add(Q(year__lte=request.GET.get('max_year')), Q.AND)

    if request.GET.get('min_mileage'):
        filters.add(Q(mileage__gte=request.GET.get('min_mileage')), Q.AND)

    if request.GET.get('max_mileage') and request.GET['max_mileage'] != '0':
        filters.add(Q(mileage__lte=request.GET.get('max_mileage')), Q.AND)

    if request.GET.get('min_price'):
        filters.add(Q(price__gte=request.GET.get('min_price')), Q.AND)

    if request.GET.get('max_price') and request.GET['max_price'] != '0':
        filters.add(Q(price__lte=request.GET.get('max_price')), Q.AND)

    order_by = request.GET.get('sort_by') or 'price'
    results = Vehicle.objects.filter(filters).order_by(order_by)
    return JsonResponse(VehicleSerializer(results, many=True).data, safe=False)


def create_vehicle(request):
    if request.method == "POST":
        data = json.loads(request.body)
        data['make'] = Make.objects.get(pk=data['make'])
        data['model'] = Model.objects.get(pk=data['model'])
        data['city'] = City.objects.get(pk=data['location'])
        # check if email or phone is registered
        existing_sellers = Seller.objects.filter(Q(email=data['email']) | Q(phone_number=data['phone']))
        if existing_sellers.exists():
            seller = existing_sellers.first()
        else:
            seller = Seller.objects.create(
            name=data['name'],
            phone_number=data['phone'],
            email=data['email'],
            address='hidden', # todo fix
            city=data['city'],
            state=str(data['city']),
            zip_code="00263",
            country=data['country'],
            whatsapp=True
        )
        data['seller'] = seller
        data['year'] = data['model'].year

        del data['name']
        del data['phone']
        del data['location']
        del data['email']
        del data['country']
        del data['city']
        images = copy.deepcopy(data['images'])
        del data['images']

        if data.get('id'):
            vehicle = Vehicle.objects.get(pk=data['id'])
            vehicle.__dict__.update(**data)
            vehicle.save()

            # finding deleted photos
            existing_photos = set(vehicle.photos.values_list('pk', flat=True))
            submitted_existing_photos = set([i['id'] for i in images if i.get('id')])
            ids_to_delete = existing_photos.difference(submitted_existing_photos)
            for id in ids_to_delete:
                VehiclePhoto.objects.get(pk=id).delete()

        else:
            vehicle = Vehicle(**data)
            vehicle.save()

        for i, image in enumerate(images):
            if image.get('id'):
                # skipping because existing photo being updated.
                continue
            VehiclePhoto.objects.create(
                vehicle=vehicle,
                photo=base64_file(image.get('src'))[0],
                is_main=i == 0
            )

        return JsonResponse({"status": "success", "id": vehicle.pk})
    return JsonResponse({"status": "error"})


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


def update_account(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user = request.user
        seller = request.user.seller

        user.first_name = data.get('first_name')
        user.last_name = data.get('last_name')
        user.save()
        seller.whatsapp = data.get('whatsapp') == "true"
        seller.recovery_email = data.get('recovery_email')
        seller.phone_number = data.get('phone')
        seller.country = data.get('country')
        seller.city_id = data.get('city')
        if data.get('photo'):
            if isinstance(data.get('photo'), dict):
                seller.photo = base64_file(data.get('photo', {}).get('src'))[0]

        seller.save()
        return JsonResponse({"status": "success"})
    else:
        return JsonResponse({"status": "error"})


def delete_account(request):
    if request.method == "POST":
        data = json.loads(request.body)
        vehicle = Vehicle.objects.get(pk=data['id'])
        vehicle.delete()
        return JsonResponse({"status": "success"})
    else:
        return JsonResponse({"status": "error"})


def reset_password(request):
    if request.method == "POST":
        data = json.loads(request.body)
        vehicle = Vehicle.objects.get(pk=data['id'])
        vehicle.password = data['password']
        vehicle.save()
        return JsonResponse({"status": "success"})
    else:
        return JsonResponse({"status": "error"})


def account_listings(request):
    seller = request.user.seller
    vehicles = Vehicle.objects.filter(seller=seller)
    return JsonResponse(VehicleSerializer(vehicles, many=True).data, safe=False)


def save_listing(request):
    if request.method == "POST":
        data = json.loads(request.body)
        vehicle = Vehicle.objects.get(pk=data['vehicle'])
        if SavedListing.objects.filter(user=request.user, vehicle=vehicle).exists():
            return JsonResponse({"status": "success"})
        SavedListing.objects.create(user=request.user, vehicle=vehicle)
        return JsonResponse({"status": "success"})
    else:
        return JsonResponse({"status": "error"})


def saved_listings(request):
    saved = SavedListing.objects.filter(user=request.user)
    vehicles = [s.vehicle for s in saved]
    return JsonResponse(VehicleSerializer(vehicles, many=True).data, safe=False)


def remove_saved_listing(request, id=None):
    if request.method == "POST":
        SavedListing.objects.get(pk=id).delete()
        return JsonResponse({"status": "success"})
    else:
        return JsonResponse({"status": "error"})


def remove_listing(request, id=None):
    if request.method == "POST":
        Vehicle.objects.get(pk=id).delete()
        return JsonResponse({"status": "success"})
    else:
        return JsonResponse({"status": "error"})
