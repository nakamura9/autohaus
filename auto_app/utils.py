from django.core.files.base import ContentFile
import base64

def base64_file(data, name=None):
    _format, _img_str = data.split(';base64,')
    _name, ext = _format.split('/')
    if not name:
        name = _name.split(":")[-1]
    filename = name
    return ContentFile(base64.b64decode(_img_str), name=filename), filename


def seller_json(user):
    return {
        'user': {
            'id': user.pk,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'recovery_email': user.seller.recovery_email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.seller.phone_number,
            'country': user.seller.country,
            'city': user.seller.city,
            'whatsapp': user.seller.whatsapp,
            'photo': user.seller.photo.url if user.seller.photo else None
        }
    }