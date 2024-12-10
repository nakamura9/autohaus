from django.core.files.base import ContentFile
import base64

def base64_file(data, name=None):
    _format, _img_str = data.split(';base64,')
    _name, ext = _format.split('/')
    if not name:
        name = _name.split(":")[-1]
    filename = name
    return ContentFile(base64.b64decode(_img_str), name=filename), filename
