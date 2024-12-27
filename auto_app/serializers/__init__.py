from auto_app.models import *
from rest_framework import serializers



class MakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Make
        fields = '__all__'
        depth = 1


class ModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = '__all__'
        depth = 1

class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seller
        fields = '__all__'
        depth = 1


class VehiclePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehiclePhoto
        fields = '__all__'
        depth = 1

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'
        depth = 1

    photos = VehiclePhotoSerializer(many=True)


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields =  "__all__"

class FAQCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQCategory
        fields = '__all__'
        depth = 1

    faq_set = FAQSerializer(many=True)
