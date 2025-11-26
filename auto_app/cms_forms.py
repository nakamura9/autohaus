from auto_app.utils.serial import to_field_json
from django.db.models.fields import NOT_PROVIDED
from django.db import models
import copy
import datetime
from django.core.files.base import ContentFile
import base64
from decimal import Decimal as D
from django.apps import apps
from django.conf import settings
from django.core.exceptions import ValidationError
from autohaus import settings


def throw(message):
    """Helper function to raise validation errors"""
    raise ValidationError(message)


class Section():
    def __init__(self):
        self.columns = []
        self.table = None
        self.current_column = None

    def add_field(self, field):
        if not self.current_column:
            self.add_column()
        self.current_column.add_field(field)

    def add_column(self):
        self.current_column = Column()
        self.columns.append(self.current_column)

    def add_table(self, table):
        self.table = table

    def to_dict(self):
        if self.table:
            return [[self.table.to_dict()]]
        return [column.to_dict() for column in self.columns]


class Column():
    def __init__(self):
        self.fields = []

    def add_field(self, field):
        self.fields.append(field)

    def to_dict(self):
        return [field.to_dict() for field in self.fields]


class Field():
    model = None

    def __init__(self, name, model=None, hidden=False):
        self.name = name
        self.model = model
        self.hidden = hidden

    def to_dict(self):
        field_json = to_field_json(self.name, self.model)
        model_field = self.model._meta.get_field(self.name)
        default = None
        if not model_field.default is NOT_PROVIDED:
            default = model_field.default
        return {
            "fieldname": self.name,
            "fieldtype": field_json["fieldtype"],
            "label": field_json["label"],
            "options": field_json["options"],
            'required': not model_field.blank,
            'hidden': self.hidden,
            'default_value': default
        }


class Component():
    model = None

    def __init__(self, name, html="", hidden=False):
        self.name = name
        self.html = html
        self.hidden = hidden

    def to_dict(self):
        return {
            "fieldname": self.name,
            "fieldtype": "component",
            "label": "",
            "options": self.html,
            'required': False,
            'hidden': self.hidden,
            'default_value': None
        }


class Table():
    def __init__(self, label, model, fields, hidden=False):
        self.fieldname = f":{model.lower()}"
        self.related_model_name = model
        self.fields = fields
        self.label = label
        self.hidden = hidden

    def to_dict(self):
        related_model = apps.get_model(app_label="auto_app", model_name=self.related_model_name)
        options = []
        for related_fieldname in self.fields:
            field_json = to_field_json(related_fieldname, related_model)
            options.append(field_json)
        return {
            "fieldname": self.fieldname,
            "label": self.label,
            "fieldtype": "table",
            "related_model": self.related_model_name,
            "options": options,
            'hidden': self.hidden,
        }


class CMSFormBuilder():
    def __init__(self, model):
        self.model = model
        self.sections: list[Section] = []
        self.current_section: Section = None

    def add_field(self, field_name, hidden=False):
        field = Field(field_name, model=self.model, hidden=hidden)
        if not self.current_section:
            self.add_section()
        self.current_section.add_field(field)
        return self

    def add_component(self, field_name, html="", hidden=False):
        field = Component(field_name, html=html, hidden=hidden)
        if not self.current_section:
            self.add_section()
        self.current_section.add_field(field)
        return self

    def add_section(self):
        self.current_section = Section()
        self.sections.append(self.current_section)
        return self

    def add_table(self, label: str, model: str, fields: list[str], hidden: bool = False):
        self.add_section()

        table = Table(label, model, fields, hidden=hidden)
        self.current_section.add_table(table)

    def add_column(self):
        self.current_section.add_column()

    def to_dict(self):
        return {
            "name": self.model._meta.verbose_name.title(),
            "sections": [section.to_dict() for section in self.sections]
        }


def base64_file(data, name=None):
    _format, _img_str = data.split(';base64,')
    _name, ext = _format.split('/')
    if not name:
        name = _name.split(":")[-1]
    filename = name
    return ContentFile(base64.b64decode(_img_str), name=filename), filename


class JSONToModelParser(object):
    model = None
    data = None

    def __init__(self, model, data, instance=None, files=None, user=None):
        self.data = data  # immutable
        self.cleaned_data = copy.deepcopy(data)
        self.model = model
        self.instance = instance
        self.files = files
        self.user = user

    def save(self):
        self.clean()
        self.validate()
        if self.instance:
            self.update()
        else:
            self.create()

        if hasattr(self.model, 'validate'):
            self.instance.validate()

        if hasattr(self.model, 'submit') and not self.instance.draft:
            self.model.submit(None, self.instance, self.user)

        if hasattr(self.model, 'after_insert'):
            self.instance.after_insert()

        return self.instance

    def validate(self):
        self.validate_mandatory()

    def validate_mandatory(self):
        excluded_fields = ['draft', 'void', 'name',
                           'created_by', 'updated_by', 'created_at', 'updated_at']

        form_fields = [field.name for field in self.model._meta.get_fields() if field.concrete]
        for field in self.model._meta.fields:
            if field.name in excluded_fields or field.name not in form_fields:
                continue
            if not field.blank and field.get_default() == None:
                if self.data.get(field.name, None) == None:
                    throw(f"{field.verbose_name} is a mandatory field")

    def clean(self):
        # remove many to many fields
        for field in self.model._meta.many_to_many:
            if field.name in self.data.keys():
                del self.cleaned_data[field.name]

        # remove child table fields
        for k in list(self.data.keys()):
            if k.startswith(":"):
                del self.cleaned_data[k]

        # replace pk's with ID's in foreign keys
        for field in self.model._meta.fields:
            if isinstance(field, models.ForeignKey) and self.data.get(field.name, None) != None:
                self.cleaned_data[field.name] = field.related_model.objects.get(
                    pk=self.data[field.name])

            if type(field) == models.DateField and self.data.get(field.name, None) != None:
                if "-" not in self.data[field.name]:
                    self.cleaned_data[field.name] = datetime.datetime.strptime(
                        self.data[field.name], "%m/%d/%Y").strftime("%Y-%m-%d")
                else:
                    self.cleaned_data[field.name] = self.data[field.name]

            is_file_field = any([
                isinstance(field, models.FileField),
                isinstance(field, models.ImageField)
            ])


            is_number_field = any([
                isinstance(field, models.IntegerField),
                isinstance(field, models.FloatField),
                isinstance(field, models.DecimalField)
            ])
            if isinstance(field, models.ManyToManyField):
                if field.name in self.cleaned_data:
                    del self.cleaned_data[field.name]

            is_str = isinstance(self.data.get(field.name), str)
            if is_number_field and is_str:
                if len(self.data[field.name]) > 0:
                    if isinstance(field, models.DecimalField):
                        self.cleaned_data[field.name] = D(
                            self.data[field.name])
                    else:  # float
                        self.cleaned_data[field.name] = float(
                            self.data[field.name])
                else:
                    self.cleaned_data[field.name] = 0

    def clean_child(self, child_model_name, child_data):
        # clean child tables
        child_model = apps.get_model(app_label="auto_app", model_name=child_model_name.replace(":", ""))
        related_field_name = None
        for field in child_model._meta.get_fields():
            if isinstance(field, models.ForeignKey) and \
                    field.remote_field.model == self.model:
                related_field_name = field.name

        # clean
        for field in child_model._meta.fields:
            if isinstance(field, models.ForeignKey) and child_data.get(field.name, None) != None:
                child_data[field.name] = field.related_model.objects.get(
                    pk=child_data[field.name])
            if type(field) == models.DateField and child_data.get(field.name, None) != None:
                child_data[field.name] = datetime.datetime.strptime(
                    child_data[field.name], "%m/%d/%Y").strftime("%Y-%m-%d")

            # is_file_field = any([
            #     isinstance(field, models.FileField),
            #     isinstance(field, models.ImageField)
            # ])

            # if is_file_field and child_data.get(field.name):
            #     if isinstance(child_data[field.name], str):
            #         if not child_data[field.name].startswith("/"):
            #             child_data[field.name] = "/" + child_data[field.name]

            is_number_field = any([
                isinstance(field, models.DecimalField),
                isinstance(field, models.IntegerField),
                isinstance(field, models.FloatField),
            ])
            is_str = isinstance(child_data.get(field.name), str)
            if is_number_field and is_str:
                if len(child_data[field.name]) > 0:
                    if isinstance(field, models.DecimalField):
                        child_data[field.name] = D(child_data[field.name])
                    else:  # float
                        child_data[field.name] = float(child_data[field.name])
                else:
                    child_data[field.name] = 0

        child_data.update({related_field_name: self.instance})

        return child_data

    def create(self):
        parent = copy.deepcopy(self.cleaned_data)
        self.instance = self.model.objects.create(**parent, created_by=self.user, updated_by=self.user)

        # create many to many relationships
        for field in self.model._meta.many_to_many:
            if not field.name in self.data.keys():
                continue
            if not self.data[field.name]:
                continue
            for pk in self.data[field.name]:
                getattr(self.instance, field.name).add(
                    field.related_model.objects.get(pk=pk)
                )


        # add children
        for k, v in self.data.items():
            if k.startswith(":"):
                child_model = apps.get_model(app_label="auto_app", model_name=k.replace(":", ""))
                related_field_name = None
                for field in child_model._meta.get_fields():
                    if isinstance(field, models.ForeignKey) and \
                            field.remote_field.model == self.model:
                        related_field_name = field.name

                for child_data in v:
                    # clean
                    for field in child_model._meta.fields:
                        if isinstance(field, models.ForeignKey) and child_data.get(field.name, None) != None:
                            child_data[field.name] = field.related_model.objects.get(
                                pk=child_data[field.name])
                        if type(field) == models.DateField and child_data.get(field.name, None) != None:
                            child_data[field.name] = datetime.datetime.strptime(
                                child_data[field.name], "%m/%d/%Y").strftime("%Y-%m-%d")

                        is_number_field = any([
                            isinstance(field, models.IntegerField),
                            isinstance(field, models.FloatField),
                            isinstance(field, models.DecimalField)
                        ])

                        if isinstance(field, models.ManyToManyField):
                            if field.name in child_data:
                                del child_data[field.name]

                        is_str = isinstance(child_data.get(field.name), str)
                        if is_number_field and is_str:
                            if len(child_data[field.name]) > 0:
                                if isinstance(field, models.DecimalField):
                                    child_data[field.name] = D(
                                        child_data[field.name])
                                else:  # float
                                    child_data[field.name] = float(
                                        child_data[field.name])
                            else:
                                child_data[field.name] = 0

                    child_data.update({related_field_name: self.instance})

                    # Check if we have a file path for an ImageField/FileField
                    # If so, try to find an existing temp record with that file
                    existing_instance = None
                    for field in child_model._meta.fields:
                        is_file_field = any([
                            isinstance(field, models.FileField),
                            isinstance(field, models.ImageField)
                        ])
                        if is_file_field and field.name in child_data and isinstance(child_data[field.name], str):
                            # Try to find existing record with this file path and no parent link
                            filter_kwargs = {
                                field.name: child_data[field.name],
                                related_field_name: None
                            }
                            existing_instance = child_model.objects.filter(**filter_kwargs).first()
                            if existing_instance:
                                # Update existing record with parent link and other data
                                for key, value in child_data.items():
                                    setattr(existing_instance, key, value)
                                existing_instance.save()
                                break

    def update(self):
        # check for changes
        parent = copy.deepcopy(self.cleaned_data)
        db_values = self.model.objects.filter(pk=self.instance.pk).values()[0]

        self.model.objects.filter(pk=self.instance.pk).update(**parent, updated_by=self.user)
        self.instance = self.model.objects.get(pk=self.instance.pk)
        draft = False

        for k, v in db_values.items():
            if k in ['created_by_id', 'updated_at', 'updated_by_id', 'created_at']:
                continue
            if getattr(self.instance, k) != v:
                draft = True
                break

        # create many to many relationships
        for field in self.model._meta.many_to_many:
            if field.name not in self.data.keys():
                continue
            getattr(self.instance, field.name).clear()
            for pk in self.data[field.name]:
                getattr(self.instance, field.name).add(
                    field.related_model.objects.get(pk=pk)
                )

        # children
        for data_key, data_value in self.data.items():
            if data_key.startswith(":"):
                child_model = apps.get_model(app_label="auto_app", model_name=data_key.replace(":", ""))
                related_field_name = None
                for field in child_model._meta.get_fields():
                    if isinstance(field, models.ForeignKey) and \
                            field.remote_field.model == self.model:
                        related_field_name = field.name

                child_instances = child_model.objects.filter(**{related_field_name: self.instance})
                child_instance_list = list(child_instances)
                retained_pks = []
                for i, row in enumerate(data_value):
                    row = self.clean_child(data_key, row)
                    ct_instance = None
                    if i < len(child_instance_list):
                        ct_instance = child_instance_list[i]
                        retained_pks.append(ct_instance.pk)
                        update_fields(ct_instance, row)
                        for k, v in row.items():
                            if getattr(ct_instance, k) != v:
                                draft = True
                                break
                    else:
                        draft = True
                        row[related_field_name] = self.instance

                        # Check if we have a file path for an ImageField/FileField
                        # If so, try to find an existing temp record with that file
                        existing_temp = None
                        for field in child_model._meta.fields:
                            is_file_field = any([
                                isinstance(field, models.FileField),
                                isinstance(field, models.ImageField)
                            ])
                            if is_file_field and field.name in row and isinstance(row[field.name], str):
                                # Try to find existing record with this file path and no parent link
                                filter_kwargs = {
                                    field.name: row[field.name],
                                    related_field_name: None
                                }
                                existing_temp = child_model.objects.filter(**filter_kwargs).first()
                                if existing_temp:
                                    # Update existing record with parent link and other data
                                    for key, value in row.items():
                                        setattr(existing_temp, key, value)
                                    existing_temp.save()
                                    ct_instance = existing_temp
                                    break

                        # If no existing temp found, create new one
                        if not existing_temp:
                            ct_instance = child_model.objects.create(**row)

                        retained_pks.append(ct_instance.pk)


                # redefine with the latest data
                child_instances = child_model.objects.filter(
                    **{related_field_name: self.instance}).order_by("pk")

                len_child_items = len(data_value)
                if child_instances.count() > len_child_items:
                    (child_model.objects
                        .filter(**{related_field_name: self.instance})
                        .exclude(pk__in=retained_pks).delete())
                    draft = True

        if hasattr(self.model, 'draft'):
            self.instance.draft = draft
            self.instance.save()


def update_fields(ins, fields):
    for f in fields:
        if f == 'id':
            continue
        # Only update fields that exist in the instance
        if hasattr(ins, f):
            setattr(ins, f, fields[f])

    ins.save()
    return ins
