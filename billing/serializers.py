from rest_framework import serializers
from billing.models import Subscription, SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = "__all__"


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    days_remaining = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            'id', 'user', 'plan', 'currency', 'payment_verified',
            'status', 'activated', 'expires_at', 'created_at',
            'days_remaining', 'is_expired'
        ]

    def get_days_remaining(self, obj):
        return obj.days_until_expiry()

    def get_is_expired(self, obj):
        return obj.is_expired()
