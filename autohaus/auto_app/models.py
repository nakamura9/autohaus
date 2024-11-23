from django.db import models

# Create your models here.
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by  = models.ForeignKey('auth.User', on_delete=models.SET_NULL, related_name='%(class)s_creator', null=True)
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

    def __str__(self) -> str:
        return self.name



class Make(BaseModel):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='make_logos/')

    def __str__(self) -> str:
        return self.name

class Model(BaseModel):
    make = models.ForeignKey('auto_app.Make', on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=255)

    def __str__(self) -> str:
        return f"{self.make} {self.name}"

class Vehicle(BaseModel):
    make = models.ForeignKey('auto_app.Make', on_delete=models.CASCADE, related_name='vehicles')
    model = models.ForeignKey('auto_app.Model', on_delete=models.CASCADE, related_name='vehicles')
    seller = models.ForeignKey('auto_app.Seller', on_delete=models.CASCADE, related_name='seller')
    # price 
    # currency
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

    def __str__(self) -> str:
        return str(self.model)


class VehiclePhoto(BaseModel):
    vehicle = models.ForeignKey('auto_app.Vehicle', on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='vehicle_photos/')
    thumbnail = models.ImageField(upload_to='vehicle_thumbnails/', null=True, blank=True)
    is_main = models.BooleanField(default=False)
