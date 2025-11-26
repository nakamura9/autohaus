from django.db import models
from django.db.models import Q
from django.apps import apps
from django.contrib.auth.models import ContentType, Group


CDN_DOMAIN_NAME = "https://autohaus-mukuta.s3.af-south-1.amazonaws.com"


# Create your models here.
class BaseModel(models.Model):
    """
    Abstract base model providing common fields and methods for all models.
    Includes automatic form generation, list views, and detail serialization.
    """
    list_fields = []  # Fields to show in list view
    section_break_after = []  # Fields after which to add a section break
    column_break_after = []  # Fields after which to add a column break

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, related_name='%(class)s_creator', null=True, blank=True)
    updated_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, related_name='%(class)s_updater', null=True, blank=True)

    class Meta:
        abstract = True

    def __str__(self):
        """Default string representation"""
        if hasattr(self, 'name'):
            return str(self.name)
        return f"{self.__class__.__name__} {self.id}"

    def list_json(self):
        """Returns JSON representation for list views"""
        from auto_app.utils.serial import generic_serializer
        detail = self.detail_json()
        if not self.list_fields:
            return {'name': str(self), 'id': self.id}

        data = {}
        for f in self.list_fields:
            if isinstance(getattr(self, f, None), models.Model):
                data[f] = str(getattr(self, f))
            else:
                data[f] = detail.get(f)
        data['name'] = str(self)
        data['id'] = self.id
        return data

    def detail_json(self):
        """Returns complete JSON representation including child tables"""
        from auto_app.utils.serial import generic_serializer
        try:
            form = self.__class__.form_fields().get('sections', [])
        except:
            # If form_fields not implemented, return basic serialization
            form = []

        fields = []
        data = {}

        for section in form:
            for column in section:
                for field_dict in column:
                    if field_dict.get('fieldtype') == 'table':
                        fields.append(f"{field_dict.get('related_model')}:{field_dict.get('fieldname')}")
                    else:
                        fields.append(field_dict.get('fieldname'))

        # If no form fields, serialize all concrete fields
        if not fields:
            fields = [field.name for field in self._meta.get_fields()
                     if field.concrete and field.name not in ['created_by', 'updated_by']]

        for field in fields:
            if ":" in field:
                # Handle child table relationships
                related, fieldname = field.replace("::", ":").split(":")
                related_model = apps.get_model(app_label="auto_app", model_name=related)
                for related_field in related_model._meta.get_fields():
                    if isinstance(related_field, models.ForeignKey) and \
                            related_field.remote_field.model == self.__class__:
                        related_field_name = related_field.name
                related_objects = related_model.objects.filter(**{related_field_name: self})
                data[f":{fieldname}"] = [ro.detail_json() for ro in related_objects]
            else:
                if hasattr(self, field):
                    data[field] = getattr(self, field)

        return generic_serializer(data)

    @classmethod
    def form_fields(cls):
        """Automatically generates form schema from model fields"""
        from auto_app.cms_forms import CMSFormBuilder
        builder = CMSFormBuilder(cls)
        field_order = [field.name for field in cls._meta.get_fields() if field.concrete]
        excluded_fields = ["created_by", "updated_by", "created_at", "updated_at", "id"]

        for field_name in field_order:
            if field_name in excluded_fields:
                continue
            builder.add_field(field_name)
            if field_name in cls.section_break_after:
                builder.add_section()
            if field_name in cls.column_break_after:
                builder.add_column()

        return builder.to_dict()

    @classmethod
    def list_field_schema(cls):
        """Returns schema for list view columns"""
        from auto_app.utils.serial import to_field_json
        fields = [
            {'fieldname': 'name', 'label': 'Name', 'fieldtype': 'char'}
        ]
        field_order = [field.name for field in cls._meta.get_fields() if field.concrete]
        for field_name in field_order:
            if field_name in cls.list_fields:
                field = {
                    'fieldname': field_name,
                    'label': cls._meta.get_field(field_name).verbose_name.title(),
                }
                field.update(to_field_json(field_name, cls))
                fields.append(field)

        return fields


class Seller(BaseModel):
    search_fields = ["name"]
    search_map = {
        "thumb": "photo",
        "description": "city",
    }

    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    recovery_email = models.EmailField(blank=True, default="")
    address = models.TextField()
    city = models.ForeignKey('auto_app.City', on_delete=models.SET_NULL, related_name='seller_city', null=True)
    state = models.CharField(max_length=100, blank=True, default="")
    country = models.CharField(max_length=100)
    whatsapp = models.BooleanField(blank=True, null=True, default=False)
    photo = models.ImageField(upload_to="seller_photos/", null=True)
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='seller', null=True)
    is_dealer = models.BooleanField(default=False, blank=True)

    def __str__(self) -> str:
        return self.name

    @property
    def num_ads(self):
        return Vehicle.objects.filter(seller=self).count()


class Make(BaseModel):
    search_fields = ["name"]
    search_map = {
        "thumb": "logo",
        "description": "name",
    }

    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='make_logos/')
    number_of_vehicles = models.PositiveIntegerField(default=0)
    number_of_models = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return self.name


class Model(BaseModel):
    search_fields = ["name", "make__name"]
    search_map = {
        "description": "make",
        "thumb": "logo",
    }

    make = models.ForeignKey('auto_app.Make', on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=255)
    number_of_vehicles = models.PositiveIntegerField(default=0)
    transmission = models.CharField(max_length=50, choices=[
        ('automatic', 'Automatic'),
        ('manual', 'Manual'),
    ], default="automatic")
    fuel_type = models.CharField(max_length=50, choices=[
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
    ], default="petrol")
    drivetrain = models.CharField(max_length=50, choices=[
        ('front_wheel_drive', 'Front Wheel Drive'),
        ('rear_wheel_drive', 'Rear Wheel Drive'),
        ('all_wheel_drive', 'All Wheel Drive'),
    ], default='front_wheel_drive')
    engine = models.CharField(max_length=255, blank=True, default="")
    car_class = models.CharField(max_length=255, blank=True, default="") # map these to body types
    year = models.PositiveIntegerField(default=2000)

    def __str__(self) -> str:
        if self.year:
            return f"{self.name} ({self.year})"
        return self.name
    
    @property
    def logo(self):
        return self.make.logo


class Currency(BaseModel):
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10)


class Vehicle(BaseModel):
    list_fields = ["make", "model", "price", "year"]
    column_break_after = ['seller']

    make = models.ForeignKey('auto_app.Make', on_delete=models.CASCADE, related_name='vehicles')
    model = models.ForeignKey('auto_app.Model', on_delete=models.CASCADE, related_name='vehicles')
    seller = models.ForeignKey('auto_app.Seller', on_delete=models.CASCADE, related_name='seller')
    negotiable = models.BooleanField(default=False,blank=True)
    price = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    currency = models.ForeignKey('auto_app.Currency', on_delete=models.SET_NULL, null=True, related_name='currency')
    mileage = models.IntegerField()
    city = models.ForeignKey('auto_app.City', on_delete=models.SET_NULL, related_name='city', null=True)
    transmission = models.CharField(max_length=50, choices=[
        ('automatic', 'Automatic'),
        ('manual', 'Manual'),
    ])
    fuel_type = models.CharField(max_length=50, choices=[
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
    ])
    drivetrain = models.CharField(max_length=50, choices=[
        ('front_wheel_drive', 'Front Wheel Drive'),
        ('rear_wheel_drive', 'Rear Wheel Drive'),
        ('all_wheel_drive', 'All Wheel Drive'),
    ])
    engine = models.CharField(max_length=255)
    year = models.IntegerField()
    body_type = models.CharField(max_length=50, choices=[
        ('sedan', 'Sedan'),
        ('suv', 'SUV'),
        ('hatchback', 'Hatchback'),
        ('commercial', 'Commercial'),
        ('convertible', 'Convertible'),
        ('wagon', 'Station Wagon'),
        ('pickup', 'Pickup'),
        ('crossover', 'Crossover'),
        ('sports_car', 'Sports Car'),
        ('other', 'Other'),
    ])
    condition = models.CharField(max_length=50, choices=[
        ("Non-Runner", "Non-Runner"),
        ("Excellent", "Excellent"),
        ("Good", "Good"),
        ("Fair", "Fair"),
        ("New", "New"),
        ("Needs Work", "Needs Work"),
    ], default="Good")
    chassis_number = models.CharField(max_length=32, blank=True, default="")
    model_number = models.CharField(max_length=32, blank=True, default="")
    published = models.BooleanField(default=False, blank=True)
    published_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, default="")
    temporary = models.BooleanField(default=False, blank=True)  # Flag for temporary vehicles during image upload

    @classmethod
    def form_fields(cls):
        from auto_app.cms_forms import CMSFormBuilder
        builder = CMSFormBuilder(cls)

        # Add photo grid widget at the top
        builder.add_component("vehicle_photos", html="PhotoGridWidget")
        builder.add_section()

        # Column 1: Basic information
        col_one = ['make', 'model', 'year', 'price', 'currency', 'mileage', 'seller', 'city']
        for field in col_one:
            builder.add_field(field)

        builder.add_column()

        # Column 2: Vehicle details
        col_two = ['transmission', 'fuel_type', 'drivetrain', 'engine', 'body_type',
                   'condition', 'negotiable', 'published', 'published_date']
        for field in col_two:
            builder.add_field(field)

        builder.add_section()

        # Description in its own section
        builder.add_field('description')

        # Additional fields
        builder.add_section()
        builder.add_field('chassis_number')
        builder.add_field('model_number')

        # Hidden table for vehicle photos (managed by PhotoGridWidget)
        builder.add_section()
        builder.add_table("Vehicle Photos", "vehiclephoto", ["photo"], hidden=True)

        return builder.to_dict()

    def __str__(self) -> str:
        return str(self.model)

    def related_listings(self):
        return Vehicle.objects.filter(Q(
            Q(Q(make=self.make) & Q(model=self.model)) |
            Q(price__range=(self.price - 1000, self.price + 1000)) |
            Q(year__range=(self.year - 2, self.year + 2)) |
            Q(fuel_type=self.fuel_type) |
            Q(transmission=self.transmission) |
            Q(drivetrain=self.drivetrain) |
            Q(body_type=self.body_type)
        )).exclude(pk=self.pk)[:10]


class VehiclePhoto(BaseModel):
    vehicle = models.ForeignKey('auto_app.Vehicle', on_delete=models.CASCADE, related_name='photos', null=True)
    photo = models.ImageField(upload_to='vehicle_photos/')
    thumbnail = models.ImageField(upload_to='vehicle_thumbnails/', null=True, blank=True)
    is_main = models.BooleanField(default=False, blank=True)
    width = models.PositiveIntegerField(default=128)
    height = models.PositiveIntegerField(default=96)
    cdn_photo = models.URLField(blank=True, null=True)
    cdn_thumbnail = models.URLField(blank=True, null=True)

    def __str__(self):
        if hasattr(self, 'name') and self.name:
            return self.name
        return self.photo.name if self.photo else f"VehiclePhoto {self.id}"

    def save(self, *args, **kwargs):
        if self.cdn_photo or self.cdn_thumbnail:
            super().save(*args, **kwargs)
            return

        from PIL import Image
        from io import BytesIO
        from django.core.files.uploadedfile import InMemoryUploadedFile
        import sys

        if self.photo and not self.thumbnail:
            im = Image.open(self.photo)
            self.width, self.height = im.size
            output = BytesIO()
            # Resize/modify the image
            im = im.resize((300, 300))
            # after modifications, save it to the output
            im.save(output, format='PNG', quality=100)
            output.seek(0)
            # change the imagefield value to be the newley modifed image value
            self.thumbnail = InMemoryUploadedFile(output, 'ImageField', "%s_thumb.png" % self.photo.name.split('.')[0], 'image/png', sys.getsizeof(output), None)

        super(VehiclePhoto, self).save(*args, **kwargs)
        # upload the photo and thumbnail to s3
        # if upload_photo(self.photo.path, self.photo.name):
        #     self.cdn_photo = f"{CDN_DOMAIN_NAME}/vehicle_photos/{self.photo.name}"
        # if upload_photo(self.thumbnail.path, self.thumbnail.name):
        #     self.cdn_thumbnail = f"{CDN_DOMAIN_NAME}/vehicle_thumbnails/{self.thumbnail.name}"

        # self.save()

    def delete(self, *args, **kwargs):
        if self.photo:
            self.photo.delete(save=False)
        if self.thumbnail:
            self.thumbnail.delete(save=False)
        super().delete(*args, **kwargs)


class City(BaseModel):
    search_fields = ["name"]
    search_map = {
        "description": "name",
    }
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class FAQCategory(BaseModel):
    name = models.CharField(max_length=1024)
    description = models.TextField()

    def __str__(self):
        return self.name


class FAQ(BaseModel):
    category = models.ForeignKey("auto_app.FAQCategory", on_delete=models.CASCADE)
    question = models.CharField(max_length=1024)
    answer = models.TextField()

    def __str__(self):
        return self.question


class ContactEntry(BaseModel):
    name = models.CharField(max_length=256)
    email = models.CharField(max_length=128)
    phone = models.CharField(max_length=128)
    message = models.TextField()


class SavedListing(BaseModel):
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    vehicle = models.ForeignKey("auto_app.Vehicle", on_delete=models.CASCADE)


class SavedSearch(BaseModel):
    user = models.OneToOneField("auth.User", on_delete=models.CASCADE)
    filters = models.TextField()


# CMS Authentication and Permission Models

class Account(BaseModel):
    """User account with role-based permissions"""
    name = models.CharField(max_length=255, blank=True)
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='account')
    phone = models.CharField(max_length=255, blank=True)
    is_cms_user = models.BooleanField(default=False, blank=True)
    role = models.ForeignKey('auto_app.Role', null=True, blank=True, on_delete=models.SET_NULL, related_name='accounts')

    def __str__(self):
        return f"{self.user.username}"

    def save(self, *args, **kwargs):
        self.name = f"{self.user.username}"
        super().save(*args, **kwargs)

    @classmethod
    def form_fields(cls):
        from auto_app.cms_forms import CMSFormBuilder
        builder = CMSFormBuilder(cls)
        builder.add_section()
        builder.add_field('user')
        builder.add_field('phone')
        builder.add_field('is_cms_user')
        builder.add_field('role')
        return builder.to_dict()


class Role(BaseModel):
    """Role definition with permissions"""
    name = models.CharField(max_length=255, blank=True)
    group = models.ForeignKey("auth.Group", null=True, blank=True, on_delete=models.SET_NULL)
    role_name = models.CharField(max_length=255)
    list_fields = ['role_name']

    @classmethod
    def form_fields(cls):
        from auto_app.cms_forms import CMSFormBuilder
        builder = CMSFormBuilder(cls)
        builder.add_field("role_name")
        builder.add_table("Permissions", "rolepermission", ["entity", "can_read", "can_write", "can_delete"])
        return builder.to_dict()

    def __str__(self):
        return self.role_name

    def save(self, *args, **kwargs):
        self.name = self.role_name
        if not self.pk:
            self.group = Group.objects.get_or_create(name=self.role_name)[0]
        super().save(*args, **kwargs)


class RolePermission(BaseModel):
    """Permission mapping for roles"""
    name = models.CharField(max_length=255, blank=True)
    role = models.ForeignKey("auto_app.Role", on_delete=models.CASCADE, related_name='permissions')
    entity = models.ForeignKey(ContentType, on_delete=models.CASCADE, limit_choices_to={"app_label": "auto_app"})
    can_read = models.BooleanField(default=False, blank=True)
    can_write = models.BooleanField(default=False, blank=True)
    can_delete = models.BooleanField(default=False, blank=True)

    def __str__(self):
        return f"{self.role.role_name} - {self.entity.model}"

    def save(self, *args, **kwargs):
        self.name = f"{self.role.role_name} - {self.entity.model}"
        super().save(*args, **kwargs)


class AuditLog(BaseModel):
    """Audit trail for all model changes"""
    name = models.CharField(max_length=255, blank=True)
    title = models.CharField(max_length=255)
    model_name = models.ForeignKey('contenttypes.ContentType', null=True, on_delete=models.CASCADE)
    model_id = models.PositiveIntegerField(null=True)
    changes = models.TextField()  # JSON

    list_fields = ['title', 'model_name', 'created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        self.name = self.title
        super().save(*args, **kwargs)

    @property
    def entity(self):
        if not self.model_name or not self.model_id:
            return None
        try:
            return self.model_name.model_class().objects.get(pk=self.model_id)
        except:
            return None


class Setting(BaseModel):
    """Application settings key-value store"""
    list_fields = ["key", "value"]
    name = models.CharField(max_length=255, blank=True)
    key = models.CharField(max_length=255, unique=True)
    value = models.TextField()

    def __str__(self):
        return f"{self.key}"

    def save(self, *args, **kwargs):
        self.name = self.key
        super().save(*args, **kwargs)


class CMSImage(BaseModel):
    """Generic image storage for CMS"""
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='cms_images/')
    width = models.PositiveIntegerField(default=128)
    height = models.PositiveIntegerField(default=96)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.image:
            from PIL import Image
            self.name = self.image.name
            img = Image.open(self.image)
            self.width, self.height = img.size
        super().save(*args, **kwargs)
