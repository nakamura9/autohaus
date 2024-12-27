from django.db import models


# Create your models here.
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, related_name='%(class)s_creator', null=True)
    updated_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, related_name='%(class)s_updater', null=True)

    class Meta:
        abstract = True


class Seller(BaseModel):
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    whatsapp = models.BooleanField(blank=True, null=True, default=False)
    photo = models.ImageField(upload_to="seller_photos/", null=True)
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='seller', null=True)

    def __str__(self) -> str:
        return self.name


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
            return f"{self.make} {self.name} ({self.year})"
        return f"{self.make} {self.name}"


class Currency(BaseModel):
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10)


class Vehicle(BaseModel):
    make = models.ForeignKey('auto_app.Make', on_delete=models.CASCADE, related_name='vehicles')
    model = models.ForeignKey('auto_app.Model', on_delete=models.CASCADE, related_name='vehicles')
    seller = models.ForeignKey('auto_app.Seller', on_delete=models.CASCADE, related_name='seller')
    negotiable = models.BooleanField(default=False,blank=True)
    price = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    currency = models.ForeignKey('auto_app.Currency', on_delete=models.SET_NULL, null=True, related_name='currency')
    mileage = models.IntegerField()
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
    published = models.BooleanField(default=False)
    published_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, default="")

    def __str__(self) -> str:
        return str(self.model)


class VehiclePhoto(BaseModel):
    vehicle = models.ForeignKey('auto_app.Vehicle', on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='vehicle_photos/')
    thumbnail = models.ImageField(upload_to='vehicle_thumbnails/', null=True, blank=True)
    is_main = models.BooleanField(default=False)


class City(models.Model):
    search_fields = ["name"]
    search_map = {
        "description": "name",
    }
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class FAQCategory(models.Model):
    name = models.CharField(max_length=1024)
    description = models.TextField()

    def __str__(self):
        return self.name


class FAQ(models.Model):
    category = models.ForeignKey("auto_app.FAQCategory", on_delete=models.CASCADE)
    question = models.CharField(max_length=1024)
    answer = models.TextField()

    def __str__(self):
        return self.question


class ContactEntry(models.Model):
    name = models.CharField(max_length=256)
    email = models.CharField(max_length=128)
    phone = models.CharField(max_length=128)
    message = models.TextField()
