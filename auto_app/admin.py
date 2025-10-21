from django.contrib import admin

# Register your models here.
from .models import *

admin.site.register(Vehicle)
admin.site.register(VehiclePhoto)
admin.site.register(Make)
admin.site.register(Seller)
admin.site.register(Model)
admin.site.register(FAQ)
admin.site.register(FAQCategory)
admin.site.register(ContactEntry)
admin.site.register(City)
