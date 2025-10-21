from datetime import timedelta
from django.utils import timezone
from auto_app.models import Vehicle, User, Make, Model

def cleanup_temporary_vehicles():
    """Delete temporary vehicles older than 24 hours"""
    cutoff = timezone.now() - timedelta(hours=24)
    Vehicle.objects.filter(
        temporary=True,
        created_at__lt=cutoff
    ).delete()
