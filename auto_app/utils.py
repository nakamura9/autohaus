from django.core.files.base import ContentFile
from django.db.models import Q
import base64
import boto3
from auto_app.logging import logger


def base64_file(data, name=None):
    _format, _img_str = data.split(';base64,')
    _name, ext = _format.split('/')
    if not name:
        name = _name.split(":")[-1]
    filename = name
    return ContentFile(base64.b64decode(_img_str), name=f"{filename}.{ext}"), filename


def seller_json(user):
    if not user.is_authenticated:
        return None

    if not user.seller:
        return {
            'user': {
                'id': user.pk,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'subscription': None
            } 
        }
    subscription = None 
    return {
        'user': {
            'id': user.pk,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'recovery_email': user.seller.recovery_email,
            'phone': user.seller.phone_number,
            'country': user.seller.country,
            'city': user.seller.city.pk if user.seller.city else None,
            'whatsapp': user.seller.whatsapp,
            'photo': user.seller.photo.url if user.seller.photo else None,
            'subscription': subscription
        }
    }


def process_search(query_map):
    from auto_app.models import Vehicle

    filters = Q()
    if query_map.get('make'):
        filters.add(Q(make__id=query_map.get('make')), Q.AND)

    if query_map.get('model'):
        filters.add(Q(model__id=query_map.get('model')), Q.AND)

    if query_map.get('transmission'):
        filters.add(Q(transmission__iexact=query_map.get('transmission')), Q.AND)

    if query_map.get('drivetrain'):
        filters.add(Q(drivetrain__iexact=query_map.get('drivetrain')), Q.AND)

    if query_map.get('fuel_type'):
        filters.add(Q(fuel_type__iexact=query_map.get('fuel_type')), Q.AND)

    if query_map.get('min_year'):
        filters.add(Q(year__gte=query_map.get('min_year')), Q.AND)

    if query_map.get('max_year'):
        filters.add(Q(year__lte=query_map.get('max_year')), Q.AND)

    if query_map.get('min_mileage'):
        filters.add(Q(mileage__gte=query_map.get('min_mileage')), Q.AND)

    if query_map.get('max_mileage') and query_map['max_mileage'] != '0':
        filters.add(Q(mileage__lte=query_map.get('max_mileage')), Q.AND)

    if query_map.get('min_price'):
        filters.add(Q(price__gte=query_map.get('min_price')), Q.AND)

    if query_map.get('max_price') and query_map['max_price'] != '0':
        filters.add(Q(price__lte=query_map.get('max_price')), Q.AND)

    order_by = query_map.get('sort_by') or 'price'
    return Vehicle.objects.filter(filters).order_by(order_by)


def upload_photo(file_path, name):
    try:
        logger.info(f"Tryging to upload {file_path}  {name}")
        session = boto3.Session(profile_name="autohaus")
        s3 = session.client('s3', region_name='af-south-1')
        existing = f"Existing buckets: {[b for b in s3.list_buckets()]}"
        logger.info(existing)
        s3.upload_file(file_path, 'autohaus-mukuta', name)
    except Exception as e:
        logger.error(f"Failed to upload file {name}: {str(e)}")
        return False
    else:
        logger.info("Uploaded file successfully")
        return True
