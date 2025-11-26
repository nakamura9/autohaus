from django.db import models
from rest_framework import serializers
import json


def generic_serializer(data: dict):
    """
    Takes a dictionary and converts all the values to Django serializable types.
    """
    def serialize_value(value):
        if isinstance(value, models.Model):
            return value.pk
        elif isinstance(value, (list, tuple)):
            return [serialize_value(v) for v in value]
        elif isinstance(value, dict):
            return generic_serializer(value)
        elif isinstance(value, (models.QuerySet,)):
            return list(value.values_list('pk', flat=True))
        elif isinstance(value, (models.DateField, models.DateTimeField, models.TimeField)):
            return value.isoformat() if hasattr(value, 'isoformat') else str(value)
        elif isinstance(value, (models.DecimalField,)):
            return float(value)
        elif isinstance(value, (
            models.fields.files.ImageFieldFile,
            models.fields.files.FieldFile
        )):
            return value.url if value else None
        elif hasattr(value, 'url'):
            # Catch any file-like objects that have a url attribute
            return value.url if value else None
        else:
            return value

    return {key: serialize_value(value) for key, value in data.items()}


def to_field_json(field_name, model):
    """Converts a Django model field to a JSON-serializable field definition"""
    field = model._meta.get_field(field_name)
    label = field.verbose_name
    field_type = None
    options = None

    if isinstance(field, models.fields.CharField):
        if field.choices:
            field_type = "select"
            options = [{'label': c[1], 'value': c[0]} for c in field.choices]
        else:
            field_type = "char"
    elif isinstance(field, models.fields.BooleanField):
        field_type = "bool"
    elif isinstance(field, models.fields.TextField):
        field_type = "text"
    elif (
            isinstance(field, models.fields.DecimalField)
            or isinstance(field, models.fields.FloatField)
            or isinstance(field, models.fields.IntegerField)
        ):
        field_type = "number"
    elif isinstance(field, models.fields.DateField):
        field_type = "date"
    elif isinstance(field, models.fields.TimeField):
        field_type = "time"
    elif isinstance(field, models.fields.files.ImageField):
        field_type = "photo"
    elif isinstance(field, models.fields.related.ForeignKey):
        field_type = "search"
        app_name = field.remote_field.model._meta.app_label
        model_name = field.remote_field.model.__name__
        options = model_name

    return {
        'fieldname': field_name,
        'fieldtype': field_type,
        'label': label.title(),
        'options': options
    }
