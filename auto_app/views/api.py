from django.http import JsonResponse
from django.apps import apps
from django.db.models import Q
import json
from auto_app.models import Vehicle, Make, Model, Seller, City, VehiclePhoto, Vehicle
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

    for field in klass.search_fields:
        filters.add(Q(**{f"{field}__icontains": request.GET.get("q")}), Q.OR)

    qs = klass.objects.filter(filters)[:20]
    return JsonResponse({"results": [extract_fields(klass, res) for res in qs]})


def search_vehicles(request):
    filters = Q()
    if request.GET.get('make'):
        filters.add(Q(make__id=request.GET.get('make')), Q.AND)

    if request.GET.get('model'):
        filters.add(Q(model__id=request.GET.get('model')), Q.AND)

    if request.GET.get('transmission'):
        filters.add(Q(transmission=request.GET.get('transmission')), Q.AND)

    if request.GET.get('drivetrain'):
        filters.add(Q(drivetrain=request.GET.get('drivetrain')), Q.AND)

    if request.GET.get('fuel_type'):
        filters.add(Q(fuel_type=request.GET.get('fuel_type')), Q.AND)

    if request.GET.get('min_year'):
        filters.add(Q(year__gte=request.GET.get('min_year')), Q.AND)

    if request.GET.get('max_year'):
        filters.add(Q(year__lte=request.GET.get('max_year')), Q.AND)

    if request.GET.get('min_mileage'):
        filters.add(Q(mileage__gte=request.GET.get('min_mileage')), Q.AND)

    if request.GET.get('max_mileage'):
        filters.add(Q(mileage__lte=request.GET.get('max_mileage')), Q.AND)

    if request.GET.get('min_price'):
        filters.add(Q(price__gte=request.GET.get('min_price')), Q.AND)

    if request.GET.get('max_price'):
        filters.add(Q(price__lte=request.GET.get('max_price')), Q.AND)


    print(filters)
    order_by = request.GET.get('sort_by') or 'price'
    results = Vehicle.objects.filter(filters).order_by(order_by)
    return JsonResponse(VehicleSerializer(results, many=True).data, safe=False)

# @csrf_exempt
def create_vehicle(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        data['make'] = Make.objects.get(pk=data['make'])
        data['model'] = Model.objects.get(pk=data['model'])
        data['city'] = City.objects.get(pk=data['location'])
        data['seller'] = Seller.objects.create(
            name=data['name'],
            phone_number=data['phone'],
            email=data['email'],
            address='hidden',
            city=data['city'],
            state=str(data['city']),
            zip_code="00263",
            country=data['country'],
            whatsapp=True
        )
        data['year'] = data['model'].year

        del data['name']
        del data['phone']
        del data['location']
        del data['email']
        del data['country']
        del data['city']
        images = copy.deepcopy(data['images'])
        del data['images']

        vehicle = Vehicle(**data)
        vehicle.save()

        for i, image in enumerate(images):
            VehiclePhoto.objects.create(
                vehicle=vehicle,
                photo=base64_file(image.get('src'))[0],
                is_main=i == 0
            )

        return JsonResponse({"status": "success"})
    return JsonResponse({"status": "error"})