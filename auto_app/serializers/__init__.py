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

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'
        depth = 1

    photos = VehiclePhotoSerializer(many=True)
    is_saved = serializers.SerializerMethodField()
    saved_listing_id = serializers.SerializerMethodField()

    def get_is_saved(self, obj):
        if not self.context.get('request'):
            return False
        if not self.context['request'].user.is_authenticated:
            return False
        return SavedListing.objects.filter(vehicle=obj, user=self.context['request'].user).exists()

    def get_saved_listing_id(self, obj):
        if not self.context.get('request'):
            return None
        if not self.context['request'].user.is_authenticated:
            return None
        listing = SavedListing.objects.filter(vehicle=obj, user=self.context['request'].user)
        if listing.exists():
            return listing.first().id
        return None


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
